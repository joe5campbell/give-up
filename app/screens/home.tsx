import { observer } from "mobx-react-lite"
import React, { FC, useState } from "react"
import {
  View,
  Image,
  ImageStyle,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
  ScrollView,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { Text, Screen } from "app/components"
import { colors, spacing } from "../theme"
import { habitStore } from "app/store/habit-store"
import { DayCard } from "../components/day-card"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

interface HomeScreenProps {
  navigation: any
}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const [slipUps, setSlipUps] = useState(0)

  const increaseSlipUps = () => {
    setSlipUps(slipUps + 1)
  }

  const addCurrentDayToStreak = () => {
    // Update streaks in the store based on the number of slip-ups
    habitStore.resetDailySlipUps(slipUps)

    // Reset slip-ups counter for the next day
    setSlipUps(0)
  }

  const fillPercentage = slipUps < habitStore.maxSlipUps ? ((habitStore.maxSlipUps - slipUps) / habitStore.maxSlipUps) * 100 : 0

  const habitName = habitStore.habitName
  const streakDisplay = habitStore.superStreak > 0
    ? `Super Streak: ${habitStore.superStreak} days`
    : `Current Streak: ${habitStore.streak} days`

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <BottomSheetModalProvider>
        {/* Header with Avatar and Plus Icon */}
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

        {/* Streak Circles */}
        <ScrollView horizontal contentContainerStyle={$streakContainer}>
          {habitStore.dayStreak.map((dayData, index) => (
            <DayCard
              key={index}
              day={`Day ${index + 1}`}
              // Calculate the progress based on the max slip-ups for that specific day
              progress={dayData.slipUpCount <= dayData.maxSlipUpsForDay 
                ? ((dayData.maxSlipUpsForDay - dayData.slipUpCount) / dayData.maxSlipUpsForDay) * 100 
                : 0}
            />
          ))}
        </ScrollView>

        {/* Streak Display */}
        <View style={$streakDisplayContainer}>
          <Text text={streakDisplay} size="lg" weight="bold" />
        </View>

        {!habitName ? (
          <View style={$addHabitContainer}>
            <Text style={{ marginBottom: spacing.lg }} size="lg" weight="bold">No habit set</Text>
            <TouchableOpacity onPress={() => navigation.navigate("CreateHabit")} style={$addHabitButton}>
              <Text text="Add New Habit" size="lg" weight="bold" style={$buttonText} />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View>
              {/* Container for the habit name and the garbage icon */}
              <View style={$headerRow}>
                <Text text={`${habitName} Tracker`} size="lg" weight="bold" style={$centeredHabitName} />
                <TouchableOpacity
                  onPress={() => {
                    habitStore.clearHabit()  // Clear the habit when clicked
                    setSlipUps(0)  // Reset slip-ups
                  }}
                  style={$garbageIcon}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    color={colors.error}
                    size={24}  // Adjust size if needed
                  />
                </TouchableOpacity>
              </View>

              {/* The Circular Progress */}
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
                    <Text text={`${slipUps}/${habitStore.maxSlipUps}`} size="xl" />
                    <Text text="Slip-ups" size="sm" />
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>

            <View style={$slipUpButtonContainer}>
              <TouchableOpacity onPress={increaseSlipUps} style={$slipUpButton}>
                <Text text={`Count ${habitName}`} size="lg" weight="bold" style={$buttonText} />
              </TouchableOpacity>
            </View>

            <View style={$streakButtonContainer}>
              <TouchableOpacity onPress={addCurrentDayToStreak} style={$streakButton}>
                <Text text="Add Current Day to Streak" size="lg" weight="bold" style={$buttonText} />
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
  borderRadius: 99, // Make the image circular
}

const $headerRow: ViewStyle = {
  justifyContent: "center", // Center the habit namqe
  position: "relative",     // Necessary for absolute positioning of the trash icon
  alignItems: "center",      // Center items vertically
}

const $centeredHabitName: TextStyle = {
  textAlign: "center", // Ensure the habit name is centered
}

const $garbageIcon: ViewStyle = {
  position: "absolute", // Position the garbage icon absolutely
  right: 0,             // Align it to the right of the header row
  padding: spacing.sm,  // Add padding for a better touch area
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

const $streakButtonContainer: ViewStyle = {
  marginTop: spacing.md,
  justifyContent: "center",
  alignItems: "center",
}

const $streakButton: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  paddingVertical: spacing.md,
  paddingHorizontal: spacing.xxl,
  borderRadius: spacing.sm,
}

const $streakContainer: ViewStyle = {
  flexDirection: "row",
  marginTop: spacing.lg,
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

const $streakDisplayContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  marginVertical: spacing.md,
}

const $buttonText: TextStyle = {
  color: colors.palette.neutral100,
}
