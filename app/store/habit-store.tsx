import { makeAutoObservable } from "mobx"

class HabitStore {
  habitName = ""
  description = ""

  constructor() {
    makeAutoObservable(this)
  }

  setHabitName(name: string) {
    this.habitName = name
  }

  setDescription(desc: string) {
    this.description = desc
  }

  // Clear the habit data
  clearHabit() {
    this.habitName = ""
    this.description = ""
  }
}

export const habitStore = new HabitStore()