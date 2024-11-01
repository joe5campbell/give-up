import { observer } from "mobx-react-lite"
import React, { FC, useState, useRef, useEffect } from "react"
import {
  View,
  Image,
  ImageStyle,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
  ScrollView,
  Alert,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { Text, Screen } from "app/components"
import { colors, spacing } from "../theme"
import { habitStore } from "app/store/habit-store"
import { CalendarView } from "app/components/CalendarView"

const getProgressColors = (slipUps: number, maxSlipUps: number) => {
  if (slipUps === 0) {
    return colors.superStreak
  }
  const progressPercentage = slipUps <= maxSlipUps ? ((maxSlipUps - slipUps) / maxSlipUps) * 100 : 0
  if (progressPercentage === 100) {
    return colors.success
  } else if (progressPercentage > 0) {
    return colors.tint
  } else {
    return colors.error
  }
}

// New helper to get current streak dates
const getCurrentStreakDates = () => {
  const currentStreak = []
  for (let i = habitStore.dayStreak.length - 1; i >= 0; i--) {
    const day = habitStore.dayStreak[i]
    if (day.slipUpCount > habitStore.maxSlipUps) break
    currentStreak.unshift(day.date)
  }
  return currentStreak
}

const createWeekArray = (currentStreakDates: string[]) => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const today = habitStore.getNextDate()
  const startOfWeek = new Date(today)
  const dayOfWeek = today.getDay()

  if (dayOfWeek === 1) {
    startOfWeek.setDate(today.getDate() - 7)
  } else {
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startOfWeek.setDate(today.getDate() + daysToMonday)
  }

  return days.map((day, index) => {
    const currentDay = new Date(startOfWeek)
    currentDay.setDate(startOfWeek.getDate() + index)
    const dateString = currentDay.toISOString().split('T')[0]
    const dayData = habitStore.dayStreak.find(
      (streakDay) => streakDay.date === dateString
    )
    const isInCurrentStreak = currentStreakDates.includes(dateString)

    return {
      letter: day,
      data: dayData || null,
      isInCurrentStreak,
    }
  })
}

interface HomeScreenProps {
  navigation: any
}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const [slipUps, setSlipUps] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [currentStreakDates, setCurrentStreakDates] = useState<string[]>([])

  const handleOpenCalendar = () => {
    bottomSheetModalRef.current?.present()
  }

  useEffect(() => {
    setCurrentStreakDates(getCurrentStreakDates())
  }, [habitStore.dayStreak.length])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollViewRef.current && habitStore.dayStreak.length > 0) {
        scrollViewRef.current.scrollToEnd({ animated: true })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const increaseSlipUps = () => {
    setSlipUps(slipUps + 1)
  }

  const addCurrentDayToStreak = () => {
    habitStore.resetDailySlipUps(slipUps)
    setSlipUps(0)

    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true })
      }
    }, 10)
  }

  const handleDeleteHabit = () => {
    if (habitStore.dayStreak.length > 0) {
      Alert.alert(
        "Reset Streak?",
        "You have an existing streak. Do you want to reset it as well?",
        [
          {
            text: "Yes",
            onPress: () => {
              habitStore.hasSeenStreakPrompt = true
              habitStore.hasSelectedClearHabit = true
              navigation.navigate("CreateHabit", { hasAcknowledgedStreak: true, hasSelectedClearHabit: true })
            },
          },
          {
            text: "No",
            onPress: () => {
              habitStore.hasSeenStreakPrompt = true
              habitStore.hasSelectedClearHabit = false
              navigation.navigate("CreateHabit", { hasAcknowledgedStreak: true, hasSelectedClearHabit: false })
            },
            style: "cancel",
          },
        ]
      )
    } else {
      clearHabit(false)
      navigation.navigate("CreateHabit")
    }
  }

  const clearHabit = (resetStreak: boolean) => {
    if (resetStreak) {
      habitStore.clearStreaks()
    }
    habitStore.clearHabit()
    setSlipUps(0)
  }

  const fillPercentage = slipUps < habitStore.maxSlipUps
    ? ((habitStore.maxSlipUps - slipUps) / habitStore.maxSlipUps) * 100
    : 0

  const habitName = habitStore.habitName
  const streakDisplay = habitStore.superStreak > 0
    ? `Super Streak: ${habitStore.superStreak} days`
    : `Current Streak: ${habitStore.streak} days`

  return (
    <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
      <BottomSheetModalProvider>
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

        <View style={$streakWrapper}>
          <View style={$streakContainer}>
            {createWeekArray(currentStreakDates).map((day, index) => (
              <TouchableOpacity key={index} style={$dayCard} onPress={handleOpenCalendar}>
                <Text text={day.letter} size="xs" style={$dayLetter} />
                {day.data ? (
                  <AnimatedCircularProgress
                    size={30}
                    width={day.isInCurrentStreak ? 8 : 3}  // Thicker width for current streak
                    fill={day.data.slipUpCount <= day.data.maxSlipUpsForDay 
                      ? ((day.data.maxSlipUpsForDay - day.data.slipUpCount) / day.data.maxSlipUpsForDay) * 100 
                      : 0}
                    tintColor={getProgressColors(day.data.slipUpCount, day.data.maxSlipUpsForDay)}
                    backgroundColor={colors.palette.neutral300}
                    rotation={360}
                  />
                ) : (
                  <View style={$placeholderCircle} />
                )}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleOpenCalendar} style={$calendarButton}>
            <MaterialCommunityIcons 
              name="calendar-month" 
              size={24} 
              color={colors.palette.primary600} 
            />
          </TouchableOpacity>
        </View>

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
              <View style={$headerRow}>
                <Text text={`${habitName} Tracker`} size="lg" weight="bold" style={$centeredHabitName} />
                <TouchableOpacity
                  onPress={handleDeleteHabit}
                  style={$garbageIcon}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    color={colors.error}
                    size={24}
                  />
                </TouchableOpacity>
              </View>

              <AnimatedCircularProgress
                size={200}
                width={15}
                fill={fillPercentage}
                rotation={360}
                tintColor={getProgressColors(slipUps, habitStore.maxSlipUps)}
                backgroundColor={colors.error}
                style={$circularProgress}
              >
                {(fill) => (
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
                <Text text="Add Day to Streak" size="lg" weight="bold" style={$buttonText} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <CalendarView 
          bottomSheetModalRef={bottomSheetModalRef}
          streakData={habitStore.dayStreak}
        />
      </BottomSheetModalProvider>
    </Screen>
  )
})

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
  borderRadius: 99,
}

const $headerRow: ViewStyle = {
  justifyContent: "center",
  position: "relative",
  alignItems: "center",
}

const $centeredHabitName: TextStyle = {
  textAlign: "center",
}

const $garbageIcon: ViewStyle = {
  position: "absolute",
  right: 0,
  padding: spacing.sm,
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

const $streakWrapper: ViewStyle = {
  position: "relative", // Enables absolute positioning within
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.sm,
  paddingRight: spacing.sm,
  paddingLeft: spacing.xs,
  paddingVertical: spacing.xs, // Adjust as needed for padding around items
}

const $streakContainer: ViewStyle = {
  flexDirection: "row",
  justifyContent: "flex-start", // Align items to the left
  paddingHorizontal: spacing.sm,
  right: spacing.sm,
  flex: 1,
}

const $dayCard: ViewStyle = {
  alignItems: "center",
  gap: spacing.xxs,
  width:37, // Fixed width for each day
}

const $dayLetter: TextStyle = {
  color: colors.textDim,
}

const $streakDisplayContainer: ViewStyle = {
  justifyContent: "center",
  alignItems: "center",
  marginVertical: spacing.md,
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

const $calendarButton: ViewStyle = {
  padding: spacing.xxxs,
  marginLeft: spacing.xs,
}

const $placeholderCircle: ViewStyle = {
  width: 30,
  height: 30,
  opacity: 0,
}