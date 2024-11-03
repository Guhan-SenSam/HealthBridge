/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
// ResultScreen.js
import { Screen } from "@/components"
import React from "react"
import { Text } from "react-native"

export default function ResultScreen({ route }) {
  const { result } = route.params

  return (
    <Screen backgroundColor="white" safeAreaEdges={["top"]}>
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          margin: 20,
        }}
      >
        {result}
      </Text>
    </Screen>
  )
}
