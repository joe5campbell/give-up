import React, { useState, useCallback, useMemo, useEffect } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native"
import { BottomSheetModal } from "@gorhom/bottom-sheet"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { Text } from "app/components"
import { colors, spacing } from "app/theme"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, parseISO, isBefore } from "date-fns"
import { habitStore } from "app/store/habit-store"
import { reaction } from "mobx"

const screenWidth = Dimensions.get('window').width

interface CalendarViewProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal>
}

interface DayDetailPopup {
  date: string
  slipUpCount: number
  maxSlipUps: number
}

// Get the latest date in habitStore's slip-up history
const getLatestDate = () => {
  const dates = Object.keys(habitStore.slipUpHistory)
  return dates.length > 0 
    ? parseISO(dates[dates.length - 1])
    : habitStore.getEffectiveDate()
}

export const CalendarView: React.FC<CalendarViewProps> = ({ bottomSheetModalRef }) => {
  const [selectedMonth, setSelectedMonth] = useState(getLatestDate())
  const [dayDetailPopup, setDayDetailPopup] = useState<DayDetailPopup | null>(null)

  // Update selected month when days are added in development mode
  useEffect(() => {
    const disposeReaction = reaction(
      () => habitStore.daysOffset,
      () => setSelectedMonth(habitStore.getEffectiveDate())
    )
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
  const handleDayPress = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd')
    const slipUpCount = habitStore.getSlipUpsForDate(dateString)
    const maxSlipUps = habitStore.getMaxSlipUpsForDate(dateString)

    setDayDetailPopup({
      date: format(date, 'MMM d, yyyy'),
      slipUpCount,
      maxSlipUps,
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
          <TouchableOpacity onPress={handlePreviousMonth} style={$navButton}>
            <Text text="<" style={$navButtonText} />
          </TouchableOpacity>
          <Text text={format(selectedMonth, 'MMMM yyyy')} style={$monthHeader} />
          <TouchableOpacity onPress={handleNextMonth} style={$navButton}>
            <Text text=">" style={$navButtonText} />
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
              const isBeforeTracking = isBefore(parseISO(dateString), parseISO(habitStore.trackingStartDate))
              const isPastDay = !isBeforeTracking && habitStore.isDateBeforeToday(dateString)
              const slipUpCount = isBeforeTracking ? 0 : habitStore.getSlipUpsForDate(dateString)
              const maxSlipUps = isBeforeTracking ? 0 : habitStore.getMaxSlipUpsForDate(dateString)
              const isInStreak = !isBeforeTracking && habitStore.isDateInCurrentStreak(dateString)
              const progress = slipUpCount <= maxSlipUps 
                ? ((maxSlipUps - slipUpCount) / maxSlipUps) * 100 
                : 0

              return (
                <TouchableOpacity
                  key={dateString}
                  style={$dayCell}
                  onPress={() => handleDayPress(day)}
                  disabled={isBeforeTracking}
                >
                  <View style={$dayContent}>
                    <Text text={format(day, 'd')} style={$dayText} />
                    <View style={$circleContainer}>
                      {isPastDay ? (
                        <AnimatedCircularProgress
                          size={24}
                          width={isInStreak ? 8 : 2}
                          fill={progress}
                          tintColor={getProgressColors(slipUpCount, maxSlipUps)}
                          backgroundColor={colors.palette.neutral300}
                          rotation={360}
                          style={{ marginTop: -1 }}
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

        {dayDetailPopup && (
          <View style={$popupOverlay}>
            <View style={$popup}>
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

const $navButton: ViewStyle = {
  padding: spacing.md,
  width: 50,
  height: 50,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.sm,
}

const $navButtonText: TextStyle = {
  fontSize: 24,
  color: colors.palette.primary600,
  fontWeight: "bold",
}

const $monthHeader: TextStyle = {
  fontSize: 20,
  fontWeight: "bold",
  textAlign: "center",
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
  height: 70,
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
  textAlign: "center",
}

const $circleContainer: ViewStyle = {
  width: 24,
  height: 24,
  alignItems: "center",
  justifyContent: "center",
  marginLeft: -3,
}

const $placeholderCircle: ViewStyle = {
  width: 24,
  height: 24,
  opacity: 0,
}

const $popupOverlay: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
}

const $popup: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: spacing.md,
  width: screenWidth * 0.8,
  maxWidth: 300,
  shadowColor: colors.palette.neutral900,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
}

const $popupDate: TextStyle = {
  fontWeight: "bold",
  marginBottom: spacing.xs,
  textAlign: "center",
}

const $popupDetails: TextStyle = {
  color: colors.textDim,
  textAlign: "center",
}

const $popupClose: ViewStyle = {
  position: "absolute",
  top: spacing.xs,
  right: spacing.xs,
  padding: spacing.sm,
}

const $popupCloseText: TextStyle = {
  fontSize: 24,
  color: colors.textDim,
}