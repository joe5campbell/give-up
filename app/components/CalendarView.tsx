import React, { useState, useCallback, useMemo, useEffect } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ScrollView,
} from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { Text } from "app/components"
import { colors, spacing } from "app/theme"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, parseISO } from "date-fns"
import { habitStore } from "app/store/habit-store"
import { reaction } from "mobx"

interface CalendarViewProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>
  streakData: {
    date: string
    slipUpCount: number
    maxSlipUpsForDay: number
  }[]
}

interface DayDetailPopup {
  date: string
  slipUpCount: number
  maxSlipUps: number
  x: number
  y: number
}

// Get the latest date in habitStore.dayStreak
const getLatestDate = () => {
  const lastDayStreak = habitStore.dayStreak[habitStore.dayStreak.length - 1]
  return lastDayStreak ? parseISO(lastDayStreak.date) : new Date()
}

// Helper to identify dates in the current streak
const getCurrentStreakDates = () => {
  const currentStreak = []
  for (let i = habitStore.dayStreak.length - 1; i >= 0; i--) {
    const day = habitStore.dayStreak[i]
    if (day.slipUpCount > habitStore.maxSlipUps) break
    currentStreak.unshift(day.date)
  }
  return currentStreak
}

export const CalendarView: React.FC<CalendarViewProps> = ({ bottomSheetModalRef, streakData }) => {
  const [selectedMonth, setSelectedMonth] = useState(getLatestDate()) 
  const [dayDetailPopup, setDayDetailPopup] = useState<DayDetailPopup | null>(null)
  const [currentStreakDates, setCurrentStreakDates] = useState<string[]>([])

  // Update current streak dates when dayStreak changes
  useEffect(() => {
    const disposeReaction = reaction(
      () => habitStore.dayStreak.length,
      () => setCurrentStreakDates(getCurrentStreakDates())
    )
    setCurrentStreakDates(getCurrentStreakDates())
    return () => disposeReaction()
  }, [])

  // Get calendar days for current month with Monday start
  const calendarDays = useMemo(() => {
    const start = startOfMonth(selectedMonth)
    const end = endOfMonth(selectedMonth)
    const days = eachDayOfInterval({ start, end })

    const firstDayOfWeek = getDay(start)
    const mondayAdjustedDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
    const emptyDays = Array(mondayAdjustedDay).fill(null)

    return [...emptyDays, ...days]
  }, [selectedMonth])

  // Calculate circle color based on slip-ups
  const getProgressColors = useCallback((slipUps: number, maxSlipUps: number) => {
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
  }, [])

  // Handle day press
  const handleDayPress = (date: Date, event: any, dayData: any) => {
    const layout = event.nativeEvent
    setDayDetailPopup({
      date: format(date, 'MMM d, yyyy'),
      slipUpCount: dayData?.slipUpCount || 0,
      maxSlipUps: dayData?.maxSlipUpsForDay || 0,
      x: layout.pageX,
      y: layout.pageY,
    })
  }

  // Navigate to previous and next months
  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => subMonths(prev, 1))
  }
  const handleNextMonth = () => {
    setSelectedMonth((prev) => addMonths(prev, 1))
  }

  const renderWeekHeader = () => (
    <View style={$weekHeader}>
      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
        <Text key={day} text={day.charAt(0)} style={$weekDayText} />
      ))}
    </View>
  )

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={['75%']}
      index={0}
    >
      <View style={$container}>
        {/* Month Navigation */}
        <View style={$monthNavigation}>
          <TouchableOpacity onPress={handlePreviousMonth}>
            <Text text="<" style={$navButton} />
          </TouchableOpacity>
          <Text text={format(selectedMonth, 'MMMM yyyy')} style={$monthHeader} />
          <TouchableOpacity onPress={handleNextMonth}>
            <Text text=">" style={$navButton} />
          </TouchableOpacity>
        </View>
        
        {renderWeekHeader()}

        <ScrollView>
          <View style={$calendarGrid}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={$dayCell} />
              }

              const dateString = format(day, 'yyyy-MM-dd')
              const dayData = streakData.find(d => d.date === dateString)
              const progress = dayData 
                ? ((dayData.maxSlipUpsForDay - dayData.slipUpCount) / dayData.maxSlipUpsForDay) * 100 
                : 0
              
              // Check if the date is part of the current streak
              const isInCurrentStreak = currentStreakDates.includes(dateString)
              const circleWidth = isInCurrentStreak ? 9 : 2 

              return (
                <TouchableOpacity
                  key={dateString}
                  style={$dayCell}
                  onPress={(event) => handleDayPress(day, event, dayData)}
                >
                  <View style={$dayContent}>
                    <Text text={format(day, 'd')} style={$dayText} />
                    <View style={$circleContainer}>
                      {dayData ? (
                        <AnimatedCircularProgress
                          size={24}
                          width={circleWidth}
                          fill={progress}
                          tintColor={getProgressColors(dayData.slipUpCount, dayData.maxSlipUpsForDay)}
                          backgroundColor={colors.palette.neutral300}
                          rotation={360}
                          style={{ marginTop: -1 }} // Small tweak to vertically align
                        />
                      ) : (
                        <View style={$placeholderCircle} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })}
          </View>
        </ScrollView>

        {/* Day Detail Popup */}
        {dayDetailPopup && (
          <View 
            style={[
              $popup, 
              { 
                left: dayDetailPopup.x - 100,
                top: dayDetailPopup.y - 80
              }
            ]}
          >
            <Text text={dayDetailPopup.date} style={$popupDate} />
            <Text 
              text={`Slip-ups: ${dayDetailPopup.slipUpCount}/${dayDetailPopup.maxSlipUps}`} 
              style={$popupDetails} 
            />
            <TouchableOpacity 
              style={$popupClose}
              onPress={() => setDayDetailPopup(null)}
            >
              <Text text="×" style={$popupCloseText} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </BottomSheetModal>
  )
}


const $container: ViewStyle = {
  flex: 1,
  padding: spacing.md,
}

const $monthNavigation: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: spacing.md,
  marginBottom: spacing.sm,
}

const $navButton: TextStyle = {
  fontSize: 20,
  color: colors.palette.primary600,
}

const $monthHeader: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: spacing.sm,
}

const $weekHeader: ViewStyle = {
  flexDirection: "row",
  justifyContent: "space-around",
  marginBottom: spacing.xs,
}

const $weekDayText: TextStyle = {
  color: colors.textDim,
  width: 40,
  textAlign: "center",
}

const $calendarGrid: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "flex-start",
}

const $dayCell: ViewStyle = {
  width: `${100 / 7}%`,
  aspectRatio: 1,
  padding: spacing.xs,
  height: 70, // Fixed height to accommodate number and circle
}

const $dayContent: ViewStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  padding: 0,
}

const $dayText: TextStyle = {
  color: colors.text,
  textAlign: "center", // Ensure the number is centered within the day cell
}

const $circleContainer: ViewStyle = {
  width: 24, // Match this with the size of the circle
  height: 24, // Match height to width for perfect centering
  alignItems: "center",
  justifyContent: "center",
  marginLeft: -3, // Slight nudge to the left for better centering
}

const $placeholderCircle: ViewStyle = {
  width: 24,
  height: 24,
  opacity: 0,
}

const $popup: ViewStyle = {
  position: "absolute",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderRadius: spacing.sm,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
  width: 200,
}

const $popupDate: TextStyle = {
  fontWeight: "bold",
  marginBottom: spacing.xs,
}

const $popupDetails: TextStyle = {
  color: colors.textDim,
}

const $popupClose: ViewStyle = {
  position: "absolute",
  top: spacing.xs,
  right: spacing.xs,
  padding: spacing.xs,
}

const $popupCloseText: TextStyle = {
  fontSize: 20,
  color: colors.textDim,
}
