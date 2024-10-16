import React, { useState } from "react"
import { View, TextInput, ViewStyle, TextStyle } from "react-native"
import { Text, Button, Screen } from "app/components"
import { colors, spacing } from "../theme"
import { HomeStackScreenProps } from "../navigators/types"
import { habitStore } from "app/store/habit-store"

export const CreateHabitScreen = ({ navigation }: HomeStackScreenProps<"CreateHabit">) => {
  const [habitName, setHabitName] = useState("")
  const [description, setDescription] = useState("")

  const handleCreateHabit = () => {
    if (habitName.trim()) {
      habitStore.setHabitName(habitName)
      habitStore.setDescription(description)
      navigation.navigate("Home")  // No need to pass params anymore
    } else {
      alert("Please enter a habit name.")
    }
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