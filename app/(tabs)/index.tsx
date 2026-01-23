import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { QRScanner } from "../../components/QRScanner";
import { Colors } from "../../constants/Colors";

export default function Index() {
  const isReady = true; // Midlertidig hardkodet til true for testing, disable knapper hvis false
  const [isScanning, setIsScanning] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  const handleScan = (data: string) => {
    setIsScanning(false);
    alert(`Skannet data: ${data}`);
  };

  if (isScanning) {
    if (!permission?.granted) {
      requestPermission();
      return null;
    }
    return (
      <QRScanner onScan={handleScan} onClose={() => setIsScanning(false)} />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>St. Olavs hospital</Text>
      <View style={styles.row}>
        <MaterialIcons name="star" size={24} color={Colors.brand.darkYellow} />
        <Text style={styles.favourite}>Favorittyrke</Text>
      </View>
      <View style={styles.imageWrapper}>
        <Image
          source={require("../../assets/images/profile/1.png")}
          style={styles.image}
        />
      </View>
      <Text style={styles.name}> Hei, Ola Normann!</Text>
      <Pressable
        style={[styles.button, !isReady && styles.buttonDisabled]}
        onPress={() =>
          isReady ? alert("midlertidig alert - karrieretesten!") : null
        }
        disabled={!isReady}
      >
        <Text style={styles.buttonText}>Ta karrieretesten</Text>
      </Pressable>
      <Pressable
        style={[styles.button, !isReady && styles.buttonDisabled]}
        onPress={() =>
          isReady ? alert("midlertidig alert - klasse knapp!") : null
        }
        disabled={!isReady}
      >
        <Text style={styles.buttonText}>Klasseoversikt</Text>
      </Pressable>
      <Pressable
        style={[styles.buttonRound, !isReady && styles.buttonDisabled]}
        onPress={() => setIsScanning(true)}
        disabled={!isReady}
      >
        <MaterialIcons
          name="qr-code-scanner"
          size={35}
          color={Colors.dark.text || Colors.light.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: "center",
    backgroundColor: Colors.light.background || Colors.dark.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2.5,
    marginBottom: 15,
    color: Colors.light.accent || Colors.dark.accent,
  },
  favourite: {
    fontSize: 18,
    marginLeft: 10,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.light.text || Colors.dark.text,
  },
  imageWrapper: {
    marginTop: 20,
    borderRadius: 100,
  },
  image: {
    width: 200,
    height: 200,
  },
  name: {
    fontSize: 25,
    marginTop: 20,
    color: Colors.light.text || Colors.dark.text,
  },
  button: {
    marginTop: 30,
    backgroundColor: Colors.light.button || Colors.dark.button,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonRound: {
    marginTop: 30,
    backgroundColor: Colors.brand.purple || Colors.brand.green,
    padding: 15,
    borderRadius: 50,
  },
  buttonDisabled: {
    backgroundColor: Colors.brand.gray,
  },
  buttonText: {
    color: Colors.light.background || Colors.dark.background,
    fontSize: 18,
    fontWeight: "bold",
  },
});
