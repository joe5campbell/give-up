import React from "react"
import { View, ViewStyle } from "react-native"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { Text } from "app/components"
import { colors, spacing } from "../theme"

// Interface for the DayCard component props
interface DayCardProps {
  day: string
  progress: number
  tintColor: string // Add this line
}
// DayCard Component
export const DayCard: React.FC<{ day: string, progress: number, tintColor: string }> = ({ day, progress, tintColor }) => {
  return (
    <View style={$dayCard}>
      <Text text={day} />
      <AnimatedCircularProgress
        size={50}
        width={5}
        fill={progress}
        tintColor={tintColor} // Use the tintColor prop passed down
        backgroundColor={colors.palette.neutral100}
      >
      </AnimatedCircularProgress>
    </View>
  )
}

// Add styles for DayCard container
const $dayCard: ViewStyle = {
  alignItems: "center",
  margin: spacing.md,
} 