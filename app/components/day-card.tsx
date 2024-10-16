import React from "react"
import { View, ViewStyle } from "react-native"
import { AnimatedCircularProgress } from "react-native-circular-progress"
import { Text } from "app/components"
import { colors, spacing } from "../theme"

// Interface for the DayCard component props
interface DayCardProps {
  day: string  // Day label (e.g., "Day 1", "Day 2")
  progress: number  // Progress will be in percentage (0-100)
}

export const DayCard: React.FC<DayCardProps> = ({ day, progress }) => {
  return (
    <View style={$dayCard}>
      {/* Day Label */}
      <Text text={day} />
      
      {/* Circular Progress Indicator */}
      <AnimatedCircularProgress
        size={50} // Size of the circular progress
        width={5} // Thickness of the circle
        fill={progress} // Fill percentage based on slip-ups
        tintColor={colors.palette.primary400} // The color of the filled part of the progress
        backgroundColor={colors.palette.neutral100} // Background color
      >
        {/* We no longer need to pass date; simply render an empty child */}
        {() => <></>}
      </AnimatedCircularProgress>
    </View>
  )
}

// Styles for the DayCard
const $dayCard: ViewStyle = {
  alignItems: "center",
  gap: spacing.sm,
}
