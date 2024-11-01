import { makeAutoObservable, runInAction } from "mobx"
import * as storage from "../utils/storage"

const STORAGE_KEY = "HABIT_STORE"

interface DayStreak {
  slipUpCount: number
  maxSlipUpsForDay: number
  date: string
}

interface HabitStore {
  habitName: string
  description: string
  maxSlipUps: number
  dayStreak: DayStreak[]
  streak: number
  superStreak: number
  hasSeenStreakPrompt: boolean
  hasSelectedClearHabit: boolean
}

const createInitialState = (): HabitStore => ({
  habitName: "",
  description: "",
  maxSlipUps: 3,
  dayStreak: [],
  streak: 0,
  superStreak: 0,
  hasSeenStreakPrompt: false,
  hasSelectedClearHabit: false,
})

export class HabitStoreModel {
  habitName: string = ""
  description: string = ""
  maxSlipUps: number = 3
  dayStreak: DayStreak[] = []
  streak: number = 0
  superStreak: number = 0
  hasSeenStreakPrompt: boolean = false
  hasSelectedClearHabit: boolean = false

  constructor() {
    makeAutoObservable(this)
    this.loadPersistedData()
  }

  private async loadPersistedData() {
    try {
      // Use type assertion here since storage.load returns unknown
      const savedData = (await storage.load(STORAGE_KEY)) as HabitStore | null
      if (savedData && this.isValidHabitStore(savedData)) {
        runInAction(() => {
          this.habitName = savedData.habitName
          this.description = savedData.description
          this.maxSlipUps = savedData.maxSlipUps
          this.dayStreak = savedData.dayStreak
          this.streak = savedData.streak
          this.superStreak = savedData.superStreak
          this.hasSeenStreakPrompt = savedData.hasSeenStreakPrompt
          this.hasSelectedClearHabit = savedData.hasSelectedClearHabit
        })
      }
    } catch (error) {
      console.error("Failed to load habit data:", error)
    }
  }

  // Type guard to ensure the loaded data matches our HabitStore interface
  private isValidHabitStore(data: unknown): data is HabitStore {
    const store = data as HabitStore
    return (
      typeof store === "object" &&
      store !== null &&
      typeof store.habitName === "string" &&
      typeof store.description === "string" &&
      typeof store.maxSlipUps === "number" &&
      Array.isArray(store.dayStreak) &&
      typeof store.streak === "number" &&
      typeof store.superStreak === "number" &&
      typeof store.hasSeenStreakPrompt === "boolean" &&
      typeof store.hasSelectedClearHabit === "boolean" &&
      store.dayStreak.every(
        (day): day is DayStreak =>
          typeof day === "object" &&
          day !== null &&
          typeof day.slipUpCount === "number" &&
          typeof day.maxSlipUpsForDay === "number" &&
          typeof day.date === "string"
      )
    )
  }

  private async persistData() {
    try {
      const dataToSave: HabitStore = {
        habitName: this.habitName,
        description: this.description,
        maxSlipUps: this.maxSlipUps,
        dayStreak: this.dayStreak,
        streak: this.streak,
        superStreak: this.superStreak,
        hasSeenStreakPrompt: this.hasSeenStreakPrompt,
        hasSelectedClearHabit: this.hasSelectedClearHabit,
      }
      await storage.save(STORAGE_KEY, dataToSave)
    } catch (error) {
      console.error("Failed to save habit data:", error)
    }
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

  resetDailySlipUps(slipUpCount: number) {
    const today = new Date().toISOString().split('T')[0]
    
    // Add new day to streak
    this.dayStreak.push({
      slipUpCount,
      maxSlipUpsForDay: this.maxSlipUps,
      date: today
    })

    // Update streak counts
    if (slipUpCount <= this.maxSlipUps) {
      this.streak += 1
      if (slipUpCount === 0) {
        this.superStreak += 1
      } else {
        this.superStreak = 0
      }
    } else {
      this.streak = 0
      this.superStreak = 0
    }

    this.persistData()
  }

  clearStreaks() {
    this.dayStreak = []
    this.streak = 0
    this.superStreak = 0
    this.persistData()
  }

  clearHabit() {
    Object.assign(this, createInitialState())
    this.persistData()
  }
}

export const habitStore = new HabitStoreModel()