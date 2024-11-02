import React, { useState } from "react"
import { View, TextInput, ViewStyle, TextStyle, Alert } from "react-native"
import { NavigationProp, RouteProp } from "@react-navigation/native"
import { Text, Button, Screen } from "app/components"
import { colors, spacing } from "../theme"
import { HomeStackParamList } from "../navigators/types"
import { habitStore } from "app/store/habit-store"

interface CreateHabitScreenProps {
  navigation: NavigationProp<HomeStackParamList>
  route: RouteProp<HomeStackParamList, "CreateHabit">
}

export const CreateHabitScreen = ({ navigation, route }: CreateHabitScreenProps) => {
  const [habitName, setHabitName] = useState("")
  const [description, setDescription] = useState("")
  const [maxSlipUps, setMaxSlipUps] = useState("")

  const hasAcknowledgedStreak = route.params?.hasAcknowledgedStreak ?? false
  const hasSelectedClearHabit = route.params?.hasSelectedClearHabit ?? false

  // Function to handle the habit creation process
  const handleCreateHabit = () => {
    if (Object.keys(habitStore.slipUpHistory).length > 0 && !hasAcknowledgedStreak) {
      // Show confirmation pop-up if streaks exist and haven't been acknowledged
      showStreakResetConfirmation()
    } else {
      // Streak acknowledged or no streak, save habit directly
      saveHabit(hasSelectedClearHabit)
    }
  }

  // Function to save the habit and handle streak data
  const saveHabit = (resetStreak: boolean) => {
    if (habitName.trim() && maxSlipUps.trim()) {
      // Store the current slip-up history if we're keeping the streak
      const existingHistory = !resetStreak ? { ...habitStore.slipUpHistory } : {}
      const trackingStartDate = habitStore.trackingStartDate;

      
      // Clear the store (this resets everything)
      habitStore.clearHabit()
      
      // Set the new habit details
      habitStore.setHabitName(habitName)
      habitStore.setDescription(description)
      habitStore.setMaxSlipUps(parseInt(maxSlipUps))

      // If keeping streak, restore the slip-up history
      if (!resetStreak && Object.keys(existingHistory).length > 0) {
        habitStore.restoreHistory(existingHistory, trackingStartDate)
      }

      navigation.navigate("Home")
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
        {
          text: "Yes",
          onPress: () => {
            navigation.navigate("CreateHabit", { 
              hasAcknowledgedStreak: true, 
              hasSelectedClearHabit: true 
            })
            saveHabit(true)  // Reset streak
          },
        },
        {
          text: "No",
          onPress: () => {
            navigation.navigate("CreateHabit", { 
              hasAcknowledgedStreak: true, 
              hasSelectedClearHabit: false 
            })
            saveHabit(false)  // Don't reset streak
          },
        },
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
        onPress={handleCreateHabit}
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