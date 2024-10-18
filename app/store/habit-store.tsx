import { makeAutoObservable } from "mobx"

class HabitStore {
  habitName = ""
  description = ""
  maxSlipUps = 0
  streak = 0
  superStreak = 0
  slipUpsToday = 0
  dayStreak: number[] = []  // Track streaks

  constructor() {
    makeAutoObservable(this)
  }

  setHabitName(name: string) {
    this.habitName = name
  }

  setDescription(desc: string) {
    this.description = desc
  }

  setMaxSlipUps(max: number) {
    this.maxSlipUps = max
  }

  addSlipUp() {
    this.slipUpsToday += 1
  }

  resetDailySlipUps(slipUps: number) {
    if (slipUps === 0) {
      this.superStreak += 1  // Increment super streak when no slip-ups
      this.streak += 1  // Continue current streak during super streak
    } else if (slipUps <= this.maxSlipUps) {
      this.streak += 1  // Increment streak if within limit
      this.superStreak = 0  // Reset super streak if any slip-ups happen
    } else {
      this.streak = 0  // Reset streak if limit exceeded
      this.superStreak = 0  // Reset super streak too
    }

    // Add the day's slip-ups to the dayStreak array
    this.dayStreak.push(slipUps)
  }

  clearHabit() {
    this.habitName = ""
    this.description = ""
    this.maxSlipUps = 0
    this.streak = 0
    this.superStreak = 0
    this.slipUpsToday = 0
    this.dayStreak = []  // Clear the streak data when habit is cleared
  }
}

export const habitStore = new HabitStore()

