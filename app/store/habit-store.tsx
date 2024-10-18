import { makeAutoObservable } from "mobx"

class HabitStore {
  habitName = ""
  description = ""
  maxSlipUps = 0
  streak = 0
  superStreak = 0
  slipUpsToday = 0
  dayStreak: { slipUpCount: number, maxSlipUpsForDay: number }[] = [] // Store slip-ups and max slip-ups
  hasSeenStreakPrompt = false // New flag to track if the streak prompt has been shown
  hasSelectedClearHabit = false // New flag to track if the user has selected to clear the habit

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
      this.streak += 1  // Increment streak as there are no slip-ups
      this.superStreak += 1  // Increment super streak too! 
    } else if (slipUps <= this.maxSlipUps) {  // <-- Changed `elif` to `else if`
      this.streak += 1  // Increment streak if within limit
      this.superStreak = 0 // Reset super streak 
    } else {
      this.streak = 0  // Reset streak if limit exceeded
      this.superStreak = 0 // Reset super streak as well
    }

    // Add the current day's slip-up count and max slip-ups to the day streak
    this.dayStreak.push({
      slipUpCount: slipUps,
      maxSlipUpsForDay: this.maxSlipUps,  // Store the max slip-ups for the day
    })
  }

  clearStreaks() {
    this.streak = 0
    this.superStreak = 0
    this.dayStreak = []  // Clear the stored streak circles
  }

  clearHabit() {
    this.habitName = ""
    this.description = ""
    this.maxSlipUps = 0
    this.slipUpsToday = 0
    this.hasSeenStreakPrompt = false // Reset the prompt flag when the habit is cleared
    this.hasSelectedClearHabit = false // Reset the clear flag when the habit is cleared
  }
}

export const habitStore = new HabitStore()

