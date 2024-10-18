import React, { useState } from "react"
import { View, TextInput, ViewStyle, TextStyle, Alert } from "react-native"
import { Text, Button, Screen } from "app/components"
import { colors, spacing } from "../theme"
import { HomeStackScreenProps } from "../navigators/types"
import { habitStore } from "app/store/habit-store"

export const CreateHabitScreen = ({ navigation }: HomeStackScreenProps<"CreateHabit">) => {
  const [habitName, setHabitName] = useState("")
  const [description, setDescription] = useState("")
  const [maxSlipUps, setMaxSlipUps] = useState("")  // New state for max slip-ups

  // Function to handle the habit creation process
  const handleCreateHabit = () => {
    if (habitStore.dayStreak.length > 0) {
      // Show confirmation pop-up if streaks exist
      showStreakResetConfirmation()
    } else {
      // No streaks, save habit directly
      saveHabit(false)
    }
  }

  // Function to save the habit and reset streaks if required
  const saveHabit = (resetStreak: boolean) => {
    if (habitName.trim() && maxSlipUps.trim()) {
      habitStore.setHabitName(habitName)
      habitStore.setDescription(description)
      habitStore.setMaxSlipUps(parseInt(maxSlipUps))  // Store max slip-ups
      if (resetStreak) {
        habitStore.clearStreaks()  // Clear streaks if reset is confirmed
      }
      navigation.navigate("Home")  // Navigate back to Home
    } else {
      alert("Please enter both a habit name and maximum slip-ups per day.")
    }
  }

  // Function to show confirmation dialog for resetting streaks
  const showStreakResetConfirmation = () => {
    Alert.alert(
      "Reset Streak?",
      "You have an existing streak. Do you want to reset it as well?",
      [
        { text: "No", onPress: () => saveHabit(false) },  // Don't reset streak
        { text: "Yes", onPress: () => saveHabit(true) },  // Reset streak
      ]
    )
  }

  return (
    <Screen preset="scroll" contentContainerStyle={$container} safeAreaEdges={["top", "bottom"]}>
      <View style={$header}>
        <Text text="Create Your Habit" size="xl" weight="bold" style={$headerText} />
      </View>
      <View style={$inputContainer}>
        <Text text="Habit Name" preset="formLabel" style={$labelStyle} />
        <TextInput
          value={habitName}
          onChangeText={setHabitName}
          placeholder="Enter habit name"
          style={$inputStyle}
        />
      </View>
      <View style={$inputContainer}>
        <Text text="Description" preset="formLabel" style={$labelStyle} />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Optional habit details"
          style={$inputStyle}
        />
      </View>
      <View style={$inputContainer}>
        <Text text="Max Slip-Ups Per Day" preset="formLabel" style={$labelStyle} />
        <TextInput
          value={maxSlipUps}
          onChangeText={setMaxSlipUps}
          keyboardType="numeric"
          placeholder="Enter max slip-ups"
          style={$inputStyle}
        />
      </View>
      <Button
        text="Create Habit"
        style={$button}
        textStyle={$buttonText}
        onPress={handleCreateHabit}  // Handle the creation process
      />
    </Screen>
  )
}

const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xxl,
  gap: spacing.md,
}

const $header: ViewStyle = {
  marginBottom: spacing.lg,
}

const $headerText: TextStyle = {
  color: colors.palette.primary600,
}

const $inputContainer: ViewStyle = {
  marginBottom: spacing.md,
}

const $inputStyle: TextStyle = {
  borderWidth: 1,
  borderColor: colors.palette.neutral300,
  padding: spacing.sm,
  borderRadius: spacing.sm,
  color: colors.text,
}

const $labelStyle: TextStyle = {
  marginBottom: spacing.xs,
}

const $button: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  padding: spacing.md,
  borderRadius: spacing.sm,
}

const $buttonText: TextStyle = {
  color: colors.palette.neutral100,
  textAlign: "center",
}
