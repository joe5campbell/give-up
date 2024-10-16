import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import {
  View,
  Image,
  ImageStyle,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { Text, Screen } from "app/components"
import { colors, spacing } from "../theme"
import { DayCard } from "../components/day-card"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { habitStore } from "app/store/habit-store"  // Import the habit store

// Number of allowed slip-ups per day
const MAX_SLIPUPS = 10

// Sample weekly progress data
const weeklyProgress = [
  { day: "Mon", date: "1", progress: 50 },
  { day: "Tue", date: "2", progress: 75 },
  { day: "Wed", date: "3", progress: 25 },
  { day: "Thu", date: "4", progress: 100 },
  { day: "Fri", date: "5", progress: 60 },
  { day: "Sat", date: "6", progress: 80 },
  { day: "Sun", date: "7", progress: 90 },
]

interface HomeScreenProps {
  navigation: any
}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  // Track the number of slip-ups
  const [slipUps, setSlipUps] = useState(0)

  const increaseSlipUps = () => {
    // Keep incrementing slip-ups even after reaching MAX_SLIPUPS
    setSlipUps(slipUps + 1)
  }

  // Calculate the percentage for the circular progress.
  // Once it exceeds the maximum slip-ups, the circle will remain full.
  const fillPercentage = slipUps < MAX_SLIPUPS 
    ? ((MAX_SLIPUPS - slipUps) / MAX_SLIPUPS) * 100 
    : 0

  // Get habit data from the store
  const habitName = habitStore.habitName

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <BottomSheetModalProvider>
        {/* Header with Avatar and Plus Icon */}
        <View style={$headerContainer}>
          <View style={$imageContainer}>
            <Image source={require("../../assets/images/avatar-2.png")} style={$image} />
            <Text text="Today" size="xl" weight="bold" />
          </View>
          <View style={$headerBtn}>
            <MaterialCommunityIcons
              name="plus"
              color={colors.palette.neutral100}
              size={28}
              onPress={() => navigation.navigate("CreateHabit")}
            />
          </View>
        </View>

        {/* Weekly Tracker */}
        <View style={$topContainer}>
          {weeklyProgress.map((day, index) => (
            <DayCard key={index} day={day.day} date={day.date} progress={day.progress} />
          ))}
        </View>

        {/* Conditionally Render Habit Info or Add New Habit */}
        {!habitName ? (
          <View style={$addHabitContainer}>
            <Text style={{ marginBottom: spacing.lg }} size="lg" weight="bold">No habit set</Text>
            <TouchableOpacity onPress={() => navigation.navigate("CreateHabit")} style={$addHabitButton}>
            <Text text="Add New Habit" size="lg" weight="bold" style={$buttonText} />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Slip-up Counter */}
            <View style={$centerContainer}>
              <Text text={`${habitName} Tracker`} size="lg" weight="bold" />
              <AnimatedCircularProgress
                size={200}
                width={15}
                fill={fillPercentage}
                rotation={360}
                tintColor={colors.success}
                backgroundColor={colors.error}
                style={$circularProgress}
              >
                {() => (
                  <View style={$circularContent}>
                    <Text text={`${slipUps}/${MAX_SLIPUPS}`} size="xl" />
                    <Text text="Slip-ups" size="sm" />
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>

            {/* Add Slip-up Button */}
            <View style={$slipUpButtonContainer}>
              <TouchableOpacity onPress={increaseSlipUps} style={$slipUpButton}>
                <Text text={`Count ${habitName}`} size="lg" weight="bold" style={$buttonText} />
              </TouchableOpacity>
            </View>
            {/* Remove Habit Button */}
            <View style={$removeHabitButtonContainer}>
              <TouchableOpacity
                onPress={() => {
                  habitStore.clearHabit() // Clear the habit from the store
                  setSlipUps(0) // Reset slip-ups
                }}
                style={$removeHabitButton}
              >
                <Text text="Remove Habit" size="lg" weight="bold" style={$buttonText} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </BottomSheetModalProvider>
    </Screen>
  )
})

// Styles
const $container: ViewStyle = {
  paddingHorizontal: spacing.lg,
  gap: spacing.md,
  paddingBottom: spacing.xxl,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $imageContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
}

const $headerBtn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 99,
}

const $image: ImageStyle = {
  width: 50,
  height: 50,
}

const $topContainer: ViewStyle = {
  flexDirection: "row",
  gap: spacing.sm,
  marginTop: spacing.lg,
}

const $centerContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  marginVertical: spacing.xl,
}

const $circularProgress: ViewStyle = {
  alignSelf: "center",
}

const $circularContent: ViewStyle = {
  alignItems: "center",
}

const $slipUpButtonContainer: ViewStyle = {
  marginTop: spacing.md,
  justifyContent: "center",
  alignItems: "center",
}

const $slipUpButton: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xxl,
  borderRadius: spacing.sm,
}

const $removeHabitButtonContainer: ViewStyle = {
  marginTop: spacing.md,
  justifyContent: "center",
  alignItems: "center",
}

const $removeHabitButton: ViewStyle = {
  backgroundColor: colors.error,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xxl,
  borderRadius: spacing.sm,
}

const $addHabitContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  marginTop: spacing.xl,
}

const $addHabitButton: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xxl,
  borderRadius: spacing.sm,
}

const $buttonText: TextStyle = {
  color: colors.palette.neutral100,
}
