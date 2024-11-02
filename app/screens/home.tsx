import { observer } from "mobx-react-lite"
import React, { FC, useRef } from "react"
import {
  View,
  Image,
  ImageStyle,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
  Alert,
} from "react-native"
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { BottomSheetModal, BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { Text, Screen } from "app/components"
import { colors, spacing } from "../theme"
import { habitStore } from "app/store/habit-store"
import { CalendarView } from "app/components/CalendarView"
import { format, startOfWeek, addDays, isBefore, parseISO } from "date-fns"

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

const createWeekArray = () => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const mondayOfWeek = startOfWeek(habitStore.getEffectiveDate(), { weekStartsOn: 1 })
  
  return days.map((letter, index) => {
    const currentDate = addDays(mondayOfWeek, index)
    const dateString = format(currentDate, 'yyyy-MM-dd')
    
    // Check if the date is before tracking started
    const isBeforeTracking = isBefore(parseISO(dateString), parseISO(habitStore.trackingStartDate))
    
    // Only get data if date is after tracking started
    const slipUpCount = isBeforeTracking ? 0 : habitStore.getSlipUpsForDate(dateString)
    const maxSlipUps = isBeforeTracking ? 0 : habitStore.getMaxSlipUpsForDate(dateString)
    const isInCurrentStreak = !isBeforeTracking && habitStore.isDateInCurrentStreak(dateString)
    const isPastDay = !isBeforeTracking && habitStore.isDateBeforeToday(dateString)
    
    return {
      letter,
      date: dateString,
      slipUpCount,
      maxSlipUps,
      isInCurrentStreak,
      shouldShow: isPastDay,
      isBeforeTracking
    }
  })
}

interface HomeScreenProps {
  navigation: any
}

export const HomeScreen: FC<HomeScreenProps> = observer(function HomeScreen({ navigation }) {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  const handleOpenCalendar = () => {
    bottomSheetModalRef.current?.present()
  }

  const handleCountSlipUp = () => {
    habitStore.incrementSlipUpCount()
  }

  const handleDeleteHabit = () => {
    if (Object.keys(habitStore.slipUpHistory).length > 0) {
      Alert.alert(
        "Delete Habit?",
        "This will remove all slip-up history and streak data.",
        [
          {
            text: "Yes",
            onPress: () => {
              habitStore.clearHabit()
              navigation.navigate("CreateHabit")
            },
          },
          {
            text: "No",
            style: "cancel",
          },
        ]
      )
    } else {
      habitStore.clearHabit()
      navigation.navigate("CreateHabit")
    }
  }

  const currentDate = format(habitStore.getEffectiveDate(), 'yyyy-MM-dd')
  const currentSlipUps = habitStore.getSlipUpsForDate(currentDate)
  const habitName = habitStore.habitName
  const streakDisplay = habitStore.superStreak > 0
    ? `Super Streak: ${habitStore.superStreak} days`
    : `Current Streak: ${habitStore.streak} days`

  const weekData = createWeekArray()

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

        {habitStore.developmentMode && (
          <View style={$devModeContainer}>
            <Text text="Development Mode" style={$devModeText} />
            <TouchableOpacity 
              style={$devModeButton} 
              onPress={() => habitStore.addTestDay()}
            >
              <Text text="Add Test Day" style={$devModeButtonText} />
            </TouchableOpacity>
          </View>
        )}

        <View style={$streakWrapper}>
          <View style={$streakContainer}>
            {weekData.map((day, index) => (
              <TouchableOpacity key={index} style={$dayCard} onPress={handleOpenCalendar}>
                <Text text={day.letter} size="xs" style={$dayLetter} />
                {day.shouldShow && !day.isBeforeTracking ? (
                  <AnimatedCircularProgress
                    size={30}
                    width={day.isInCurrentStreak ? 8 : 3}
                    fill={day.slipUpCount <= day.maxSlipUps 
                      ? ((day.maxSlipUps - day.slipUpCount) / day.maxSlipUps) * 100 
                      : 0}
                    tintColor={getProgressColors(day.slipUpCount, day.maxSlipUps)}
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
              size={20} 
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
                fill={currentSlipUps <= habitStore.maxSlipUps 
                  ? ((habitStore.maxSlipUps - currentSlipUps) / habitStore.maxSlipUps) * 100 
                  : 0}
                rotation={360}
                tintColor={getProgressColors(currentSlipUps, habitStore.maxSlipUps)}
                backgroundColor={colors.error}
                style={$circularProgress}
              >
                {(fill) => (
                  <View style={$circularContent}>
                    <Text text={`${currentSlipUps}/${habitStore.maxSlipUps}`} size="xl" />
                    <Text text="Slip-ups" size="sm" />
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>

            <View style={$slipUpButtonContainer}>
              <TouchableOpacity onPress={handleCountSlipUp} style={$slipUpButton}>
                <Text text={`Count ${habitName}`} size="lg" weight="bold" style={$buttonText} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <CalendarView 
          bottomSheetModalRef={bottomSheetModalRef}
        />
      </BottomSheetModalProvider>
    </Screen>
  )
})

// All your existing styles remain the same, just add:
const $devModeContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral200,
  padding: spacing.xs,
  borderRadius: spacing.sm,
  marginBottom: spacing.sm,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $devModeText: TextStyle = {
  color: colors.palette.neutral600,
  fontStyle: "italic",
}

const $devModeButton: ViewStyle = {
  backgroundColor: colors.palette.neutral300,
  padding: spacing.xs,
  borderRadius: spacing.xs,
}

const $devModeButtonText: TextStyle = {
  color: colors.palette.neutral700,
  fontSize: 12,
}

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

const $placeholderCircle: ViewStyle = {
  width: 30,
  height: 30,
  opacity: 0,
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
