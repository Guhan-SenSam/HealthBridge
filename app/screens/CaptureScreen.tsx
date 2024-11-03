/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
// CaptureScreen.js
import React, { useState, useRef } from "react"
import { View, Button, Text, StyleSheet } from "react-native"
import { Camera, CameraView } from "expo-camera"
import { useNavigation } from "@react-navigation/native"
import TextRecognition from "@react-native-ml-kit/text-recognition"

export default function CaptureScreen() {
  const [hasPermission, setHasPermission] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const cameraRef = useRef(null)
  const navigation = useNavigation()

  React.useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const captureAndProcessImage = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync()

      // Call OCR function
      const text = await performOCR(photo.uri)

      // Send the text to endpoint and navigate to result screen
      const processedResult = await sendTextToEndpoint(text)
      navigation.navigate("ResultScreen", { result: processedResult })
    }
  }

  const performOCR = async (uri: string) => {
    console.log("Processing image for OCR:", uri)
    try {
      const recognizedText = await TextRecognition.recognize(uri)
      console.log("Recognized text:", recognizedText.blocks)
      return recognizedText.text
    } catch (error) {
      console.error("Error processing image for OCR:", error)
      return "Failed to recognize text"
    }
  }

  const sendTextToEndpoint = async (text: string): Promise<string> => {
    setIsProcessing(true)

    try {
      // Step 1: Start the translation job and get job_id
      const startResponse = await fetch(
        "https://tired-larger-keep-thumbs.trycloudflare.com/translate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        },
      )

      if (!startResponse.ok) {
        throw new Error("Failed to start translation")
      }

      const { job_id } = await startResponse.json()
      console.log("Translation job started, job_id:", job_id)

      // Step 2: Poll for translation result
      const pollForResult = async (): Promise<string> => {
        const resultResponse = await fetch(
          `https://tired-larger-keep-thumbs.trycloudflare.com/translate/result/${job_id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        )

        if (!resultResponse.ok) {
          throw new Error("Failed to fetch translation result")
        }

        const resultData = await resultResponse.json()

        if (resultData.status === "completed") {
          return resultData.result
        } else if (resultData.status === "pending") {
          // Wait a bit before the next poll
          await new Promise((resolve) => setTimeout(resolve, 2000))
          return await pollForResult()
        } else {
          throw new Error("Unexpected response status")
        }
      }

      // Call the polling function
      return await pollForResult()
    } catch (error) {
      console.error("Error processing translation:", error)
      return "Failed to process text"
    } finally {
      setIsProcessing(false)
    }
  }

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={{
          width: "100%",
          height: "100%",
        }}
        facing="back"
      >
        <Button
          title={isProcessing ? "Processing..." : "Capture and Process"}
          onPress={captureAndProcessImage}
          disabled={isProcessing}
        />
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
})
