import React, { useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { API_BASE_URL } from "@/constants/api";

type PredictResponse = {
  risk_score: number;
  label_id: number;
  label: string;
  threshold: number;
  image_size: [number, number];
  disclaimer?: string;
};

export default function ScanScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const scorePct = useMemo(() => {
    if (!result) return null;
    return Math.round(result.risk_score * 1000) / 10; 
  }, [result]);

  const riskText = useMemo(() => {
    if (!result) return null;
    return result.label_id === 1 ? "Higher risk" : "Lower risk";
  }, [result]);

  async function pickImage() {
    setResult(null);

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow access to your photo library.");
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (picked.canceled) return;

    const uri = picked.assets[0].uri;
    setImageUri(uri);
  }

  async function analyze() {
    if (!imageUri) {
      Alert.alert("No image", "Pick an image first.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const form = new FormData();

      const lower = imageUri.toLowerCase();
      const isPng = lower.endsWith(".png");
      const mime = isPng ? "image/png" : "image/jpeg";
      const name = isPng ? "image.png" : "image.jpg";

      form.append("file", {
        uri: imageUri,
        name,
        type: mime,
      } as any);

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API error ${res.status}: ${txt}`);
      }

      const data = (await res.json()) as PredictResponse;
      setResult(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.brand}>SkinAI</Text>
      <Text style={styles.subtitle}>
        Minimal medical-style MVP. Educational use only — not a medical diagnosis.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>1) Select an image</Text>

        <Pressable onPress={pickImage} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Pick from gallery</Text>
        </Pressable>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 14 }]}>2) Analyze</Text>

        <Pressable
          onPress={analyze}
          disabled={!imageUri || loading}
          style={[styles.analyzeBtn, (!imageUri || loading) && styles.btnDisabled]}
        >
          <Text style={styles.analyzeBtnText}>{loading ? "Analyzing..." : "Analyze image"}</Text>
        </Pressable>

        <Text style={styles.hint}>
          Backend will resize to the model input (e.g., 128×128) and normalize.
        </Text>
      </View>

      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.sectionTitle}>Result</Text>

          <View style={styles.row}>
            <Text style={styles.k}>Prediction</Text>
            <Text style={styles.v}>{riskText}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.k}>Label</Text>
            <Text style={styles.v}>{result.label}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.k}>Risk score</Text>
            <Text style={styles.v}>{scorePct}%</Text>
          </View>

          <View style={styles.hr} />

          <Text style={styles.smallMuted}>
            Threshold: {result.threshold} • Input: {result.image_size[0]}×{result.image_size[1]}
          </Text>
          <Text style={styles.smallMuted}>
            {result.disclaimer ?? "Educational use only. Not a medical diagnosis."}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    gap: 14,
    backgroundColor: "white",
    flexGrow: 1,
  },
  brand: {
    fontSize: 30,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.2,
  },
  subtitle: {
    color: "#334155",
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#0ea5e9",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "white",
    fontWeight: "700",
  },
  preview: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
  },
  placeholder: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#64748b",
  },
  analyzeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#0f172a",
    alignItems: "center",
  },
  analyzeBtnText: {
    color: "white",
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  hint: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  resultCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    backgroundColor: "white",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  k: {
    color: "#475569",
  },
  v: {
    color: "#0f172a",
    fontWeight: "700",
  },
  hr: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 6,
  },
  smallMuted: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 16,
  },
});
