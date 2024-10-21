import { observer } from "mobx-react-lite"
import React, { FC } from "react"
import { View, ViewStyle, TouchableOpacity } from "react-native"

import { Text, Screen, Icon, Toggle, IconTypes, TextField, Button } from "app/components"
import layout from "app/utils/layout"

import { Link } from "app/screens/settings"
import { colors, spacing } from "app/theme"
import { SettingsScreenProps } from "app/navigators/types"

export const EditPersonalInfoScreen: FC<SettingsScreenProps<"EditPersonalInfo">> = observer(
  function EditPersonalInfoScreen({ navigation }) {
    const [info, setInfo] = React.useState({
      fullName: "Joe Campbell",
      email: "joe.w.campbell@icloud.com",
      bio: "",
      twitter: "",
      linkedin: "",
      instagram: "",
      facebook: "",
    })

    return (
      <Screen preset="scroll" safeAreaEdges={["top", "bottom"]} contentContainerStyle={$container}>
        <View style={$headerContainer}>
          <Icon icon="back" color={colors.text} onPress={() => navigation.goBack()} />
          <Text text="Edit personal info" preset="heading" size="lg" />
        </View>

        <View style={$generalContainer}>
          <Text text="General" preset="formLabel" />
          <View style={$generalLinksContainer}>
            <TextField
              label="FullName"
              value={info.fullName}
              onChangeText={(text) => setInfo({ ...info, ["fullName"]: text })}
              inputWrapperStyle={{
                borderRadius: spacing.xs,
                backgroundColor: colors.palette.neutral100,
              }}
            />
            <TextField
              label="Email"
              keyboardType="email-address"
              value={info.email}
              onChangeText={(text) => setInfo({ ...info, ["email"]: text })}
              inputWrapperStyle={{
                borderRadius: spacing.xs,
                backgroundColor: colors.palette.neutral100,
              }}
            />
            <TextField
              label="Bio"
              value={info.bio}
              onChangeText={(text) => setInfo({ ...info, ["bio"]: text })}
              multiline
              inputWrapperStyle={{
                borderRadius: spacing.xs,
                backgroundColor: colors.palette.neutral100,
              }}
            />
          </View>
        </View>

        <View style={$generalContainer}>
          <Text text="Social Links" preset="formLabel" />
          <View style={$generalLinksContainer}>
            <TextField
              label="Twitter/X"
              value={info.twitter}
              onChangeText={(text) => setInfo({ ...info, ["twitter"]: text })}
              inputWrapperStyle={{
                borderRadius: spacing.xs,
                backgroundColor: colors.palette.neutral100,
              }}
            />
            <TextField
              label="Linkedin"
              value={info.linkedin}
              onChangeText={(text) => setInfo({ ...info, ["linkedin"]: text })}
              inputWrapperStyle={{
                borderRadius: spacing.xs,
                backgroundColor: colors.palette.neutral100,
              }}
            />
            <TextField
              label="Facebook"
              value={info.facebook}
              onChangeText={(text) => setInfo({ ...info, ["facebook"]: text })}
              inputWrapperStyle={{
                borderRadius: spacing.xs,
                backgroundColor: colors.palette.neutral100,
              }}
            />
            <TextField
              label="Instagram"
              value={info.instagram}
              onChangeText={(text) => setInfo({ ...info, ["instagram"]: text })}
              inputWrapperStyle={{
                borderRadius: spacing.xs,
                backgroundColor: colors.palette.neutral100,
              }}
            />
          </View>
        </View>

        <Button
          style={$btn}
          textStyle={{ color: colors.palette.neutral100 }}
          onPress={() => navigation.navigate("PersonalInfo")}
        >
          Save changes
        </Button>
      </Screen>
    )
  },
)

const $container: ViewStyle = {
  paddingHorizontal: spacing.md,
  gap: spacing.xl,
  paddingBottom: 70,
}

const $headerContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
}

const $generalContainer: ViewStyle = {
  gap: spacing.md,
}

const $generalLinksContainer: ViewStyle = {
  backgroundColor: colors.palette.neutral100,
  borderRadius: spacing.xs,
  padding: spacing.md,
  gap: spacing.lg,
}

const $btn: ViewStyle = {
  backgroundColor: colors.palette.primary600,
  borderWidth: 0,
  borderRadius: spacing.xs,
}
