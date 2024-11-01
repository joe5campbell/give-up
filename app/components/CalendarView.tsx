import React, { useState, useCallback, useMemo } from "react"
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns"

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

export const CalendarView: React.FC<CalendarViewProps> = ({ bottomSheetModalRef, streakData }) => {
  const [selectedMonth] = useState(new Date(2024, 0, 1)) // Start from January 2024
  const [dayDetailPopup, setDayDetailPopup] = useState<DayDetailPopup | null>(null)

  // Get calendar days for current month with Monday start
  const calendarDays = useMemo(() => {
    const start = startOfMonth(selectedMonth)
    const end = endOfMonth(selectedMonth)
    const days = eachDayOfInterval({ start, end })

    // Adjust for Monday start (Monday = 1, Sunday = 0)
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
        <Text text={format(selectedMonth, 'MMMM yyyy')} style={$monthHeader} />
        
        {renderWeekHeader()}

        <ScrollView>
          <View style={$calendarGrid}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={$dayCell} />
              }

              const dateString = format(day, 'yyyy-MM-dd')
              const dayData = streakData.find(d => d.date === dateString)
              const progress = dayData ? 
                ((dayData.maxSlipUpsForDay - dayData.slipUpCount) / dayData.maxSlipUpsForDay) * 100 : 0

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
                          width={2}
                          fill={progress}
                          tintColor={getProgressColors(dayData.slipUpCount, dayData.maxSlipUpsForDay)}
                          backgroundColor={colors.palette.neutral300}
                          rotation={360}
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
  gap: spacing.xs,
}

const $dayText: TextStyle = {
  color: colors.text,
}

const $circleContainer: ViewStyle = {
  height: 24,
  justifyContent: "center",
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