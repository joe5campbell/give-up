import { makeAutoObservable } from "mobx"

class HabitStore {
  habitName = ""
  description = ""
  maxSlipUps = 0
  streak = 0
  superStreak = 0

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

  resetDailySlipUps(slipUps: number) {
    if (slipUps === 0) {
      this.superStreak += 1  // Increment super streak when no slip-ups
    }
    if (slipUps <= this.maxSlipUps) {
      this.streak += 1  // Increment streak if within limit
    } else {
      this.streak = 0  // Reset streak if limit exceeded
    }
  }

  clearHabit() {
    this.habitName = ""
    this.description = ""
    this.maxSlipUps = 0
    this.streak = 0
    this.superStreak = 0
  }
}

export const habitStore = new HabitStore()
