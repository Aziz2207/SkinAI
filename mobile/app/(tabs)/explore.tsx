import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>About SkinAI</Text>
      <Text style={styles.text}>
        SkinAI is a minimal demo app that sends a photo to a FastAPI backend and returns a risk score
        computed by a CNN model.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Disclaimer</Text>
        <Text style={styles.text}>
          Educational use only. This is not a medical diagnosis. If you have concerns, consult a
          qualified healthcare professional.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How it works</Text>
        <Text style={styles.text}>1) Pick an image</Text>
        <Text style={styles.text}>2) Upload to /predict</Text>
        <Text style={styles.text}>3) Display label + risk score</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 12,
    backgroundColor: "white",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0f172a",
  },
  text: {
    color: "#334155",
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "white",
    gap: 8,
  },
  cardTitle: {
    fontWeight: "800",
    color: "#0f172a",
    fontSize: 16,
  },
  smallMuted: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 6,
  },
});
