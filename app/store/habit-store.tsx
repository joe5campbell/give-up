import { makeAutoObservable, runInAction } from "mobx"
import { format, addDays, parseISO, isAfter, isBefore, eachDayOfInterval } from "date-fns"
import * as storage from "../utils/storage"

const STORAGE_KEY = "HABIT_STORE"
const DEV_MODE = true

interface SlipUpHistory {
  [date: string]: {
    count: number
    maxAllowed: number
  }
}

interface HabitStore {
  habitName: string
  description: string
  maxSlipUps: number
  slipUpHistory: SlipUpHistory
  startDate: string          // Jan 1, 2024 for development purposes
  trackingStartDate: string  // When this specific habit tracking began
  daysOffset: number
  developmentMode: boolean
}

const createInitialState = (): HabitStore => ({
  habitName: "",
  description: "",
  maxSlipUps: 3,
  slipUpHistory: {},
  startDate: format(new Date(2024, 0, 1), 'yyyy-MM-dd'),
  trackingStartDate: format(new Date(2024, 0, 1), 'yyyy-MM-dd'),
  daysOffset: 0,
  developmentMode: DEV_MODE
})

export class HabitStoreModel {
  habitName: string = ""
  description: string = ""
  maxSlipUps: number = 3
  slipUpHistory: SlipUpHistory = {}
  startDate: string = format(new Date(2024, 0, 1), 'yyyy-MM-dd')
  trackingStartDate: string = format(new Date(2024, 0, 1), 'yyyy-MM-dd')
  daysOffset: number = 0
  developmentMode: boolean = DEV_MODE

  constructor() {
    makeAutoObservable(this)
    this.loadPersistedData()
  }

  private async loadPersistedData() {
    try {
      const savedData = await storage.load(STORAGE_KEY) as HabitStore | null
      
      if (savedData && this.isValidHabitStore(savedData)) {
        runInAction(() => {
          this.habitName = savedData.habitName
          this.description = savedData.description
          this.maxSlipUps = savedData.maxSlipUps
          this.slipUpHistory = savedData.slipUpHistory
          this.startDate = savedData.startDate
          this.trackingStartDate = savedData.trackingStartDate
          this.daysOffset = savedData.daysOffset
          this.developmentMode = savedData.developmentMode
        })
      }
    } catch (error) {
      console.error("Failed to load habit data:", error)
    }
  }

  private isValidHabitStore(data: unknown): data is HabitStore {
    const store = data as HabitStore
    return (
      typeof store === "object" &&
      store !== null &&
      typeof store.habitName === "string" &&
      typeof store.description === "string" &&
      typeof store.maxSlipUps === "number" &&
      typeof store.slipUpHistory === "object" &&
      typeof store.startDate === "string" &&
      typeof store.trackingStartDate === "string" &&
      typeof store.daysOffset === "number" &&
      typeof store.developmentMode === "boolean"
    )
  }

  private async persistData() {
    try {
      const dataToSave: HabitStore = {
        habitName: this.habitName,
        description: this.description,
        maxSlipUps: this.maxSlipUps,
        slipUpHistory: this.slipUpHistory,
        startDate: this.startDate,
        trackingStartDate: this.trackingStartDate,
        daysOffset: this.daysOffset,
        developmentMode: this.developmentMode
      }
      await storage.save(STORAGE_KEY, dataToSave)
    } catch (error) {
      console.error("Failed to save habit data:", error)
    }
  }

  getEffectiveDate(): Date {
    const currentDate = new Date()
    return this.developmentMode 
      ? addDays(currentDate, this.daysOffset)
      : currentDate
  }

  // Return false for dates before tracking started
  isDateBeforeToday(date: string): boolean {
    const todayStart = this.getEffectiveDate()
    todayStart.setHours(0, 0, 0, 0)
    const checkDate = parseISO(date)
    return isBefore(checkDate, todayStart) && !isBefore(checkDate, parseISO(this.trackingStartDate))
  }

  // Find the most recent streak break date
  private getLastStreakBreakDate(): string {
    const currentDate = addDays(this.getEffectiveDate(), -1) // Start from yesterday
    let checkDate = format(currentDate, 'yyyy-MM-dd')
    
    while (!isBefore(parseISO(checkDate), parseISO(this.trackingStartDate))) {
      const slipUps = this.getSlipUpsForDate(checkDate)
      const maxAllowed = this.getMaxSlipUpsForDate(checkDate)
      
      if (slipUps > maxAllowed) {
        return checkDate
      }
      checkDate = format(addDays(parseISO(checkDate), -1), 'yyyy-MM-dd')
    }
    
    return this.trackingStartDate
  }

  isDateInCurrentStreak(date: string): boolean {
    if (!this.isDateBeforeToday(date)) return false
    
    const lastBreakDate = this.getLastStreakBreakDate()
    const checkDate = parseISO(date)
    const breakDate = parseISO(lastBreakDate)
    
    // If after last break and before today, check if it maintained streak
    if (isAfter(checkDate, breakDate)) {
      const slipUps = this.getSlipUpsForDate(date)
      const maxAllowed = this.getMaxSlipUpsForDate(date)
      return slipUps <= maxAllowed
    }
    
    return false
  }

  incrementSlipUpCount() {
    const currentDate = format(this.getEffectiveDate(), 'yyyy-MM-dd')
    
    if (!this.slipUpHistory[currentDate]) {
      this.slipUpHistory[currentDate] = {
        count: 1,
        maxAllowed: this.maxSlipUps
      }
    } else {
      this.slipUpHistory[currentDate].count++
    }

    this.persistData()
  }

  getSlipUpsForDate(date: string): number {
    return this.slipUpHistory[date]?.count ?? 0
  }

  getMaxSlipUpsForDate(date: string): number {
    return this.slipUpHistory[date]?.maxAllowed ?? this.maxSlipUps
  }

  get streak(): number {
    let currentStreak = 0
    const currentDate = addDays(this.getEffectiveDate(), -1)  // Start from yesterday
    let checkDate = format(currentDate, 'yyyy-MM-dd')

    while (!isBefore(parseISO(checkDate), parseISO(this.trackingStartDate))) {
      const slipUps = this.getSlipUpsForDate(checkDate)
      const maxAllowed = this.getMaxSlipUpsForDate(checkDate)

      if (slipUps > maxAllowed) break
      currentStreak++
      checkDate = format(addDays(parseISO(checkDate), -1), 'yyyy-MM-dd')
    }

    return currentStreak
  }

  get superStreak(): number {
    let superStreak = 0
    const currentDate = addDays(this.getEffectiveDate(), -1)  // Start from yesterday
    let checkDate = format(currentDate, 'yyyy-MM-dd')

    while (!isBefore(parseISO(checkDate), parseISO(this.trackingStartDate))) {
      const slipUps = this.getSlipUpsForDate(checkDate)
      if (slipUps !== 0) break
      superStreak++
      checkDate = format(addDays(parseISO(checkDate), -1), 'yyyy-MM-dd')
    }

    return superStreak
  }

  getStreakData() {
    const start = parseISO(this.trackingStartDate)
    const end = this.getEffectiveDate()
    const days = eachDayOfInterval({ start, end })

    return days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      return {
        date: dateStr,
        slipUpCount: this.getSlipUpsForDate(dateStr),
        maxSlipUpsForDay: this.getMaxSlipUpsForDate(dateStr),
        isInCurrentStreak: this.isDateInCurrentStreak(dateStr)
      }
    })
  }

  addTestDay() {
    if (this.developmentMode) {
      this.daysOffset += 1
      this.persistData()
    }
  }

  setDevelopmentMode(enabled: boolean) {
    this.developmentMode = enabled
    this.persistData()
  }

  setHabitName(name: string) {
    this.habitName = name
    this.persistData()
  }

  setDescription(description: string) {
    this.description = description
    this.persistData()
  }

  setMaxSlipUps(count: number) {
    this.maxSlipUps = count
    this.persistData()
  }

  setTrackingStartDate(date: string) {
    this.trackingStartDate = date
    this.persistData()
  }

  restoreHistory(history: SlipUpHistory, trackingStartDate: string) {
    this.slipUpHistory = history
    this.trackingStartDate = trackingStartDate
    this.persistData()
  }

  clearHabit() {
    const newState = createInitialState()
    newState.trackingStartDate = format(this.getEffectiveDate(), 'yyyy-MM-dd')
    Object.assign(this, newState)
    this.persistData()
  }
}

export const habitStore = new HabitStoreModel()