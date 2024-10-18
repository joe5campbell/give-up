import { observer } from "mobx-react-lite"
import React, { FC, useState, useEffect } from "react"
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
import { habitStore } from "app/store/habit-store"

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
  const [slipUps, setSlipUps] = useState(0)

  const maxSlipUps = habitStore.maxSlipUps

  useEffect(() => {
    // Function to reset slip-ups and update streaks each day
    const resetDailyCounters = () => {
      habitStore.resetDailySlipUps(slipUps)
      setSlipUps(0)
    }

    // For simplicity, you can add logic here to reset daily at midnight using background tasks
    // resetDailyCounters() // For now, this could be called manually for testing
  }, [slipUps])

  const increaseSlipUps = () => {
    setSlipUps(slipUps + 1)
  }

  const fillPercentage = slipUps < maxSlipUps
    ? ((maxSlipUps - slipUps) / maxSlipUps) * 100
    : 0

  const habitName = habitStore.habitName

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <BottomSheetModalProvider>
        {/* Header */}
        <View style={$headerContainer}>
          <View style={$imageContainer}>
            <Image source={require("../../assets/images/Just Give Up Circle Logo.png")} style={$image} />
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

        {/* Habit Info or Add New Habit */}
        {!habitName ? (
          <View style={$addHabitContainer}>
            <Text style={{ marginBottom: spacing.lg }} size="lg" weight="bold">No habit set</Text>
            <TouchableOpacity onPress={() => navigation.navigate("CreateHabit")} style={$addHabitButton}>
              <Text text="Add New Habit" size="lg" weight="bold" style={$buttonText} />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
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
                    <Text text={`${slipUps}/${maxSlipUps}`} size="xl" />
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

            {/* Garbage Icon to remove the habit */}
            <TouchableOpacity
              onPress={() => {
                habitStore.clearHabit()
                setSlipUps(0)
              }}
              style={$removeHabitIcon}
            >
              <MaterialCommunityIcons name="trash-can" color={colors.error} size={28} />
            </TouchableOpacity>
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

const $removeHabitIcon: ViewStyle = {
  position: "absolute",
  top: spacing.md,
  right: spacing.lg,
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


