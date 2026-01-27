import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { Colors } from "../constants/Colors";
import { useTheme } from "../context/ThemeContext";
import { useThemeColor } from "../hooks/useThemeColor";


export default function Careers() {
  const theme = useThemeColor();
  return (
    <View style={[
        styles.container,
        { backgroundColor: theme.background },]}>
        <View style={styles.grid}>
            <Pressable style={styles.careerItem}>
                <Image
                    source={require("../../assets/images/careers/nurse.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Sykepleier</Text>
            </Pressable>
            <Pressable style={styles.careerItem}>
                <Image
                    source={require("../../assets/images/careers/midwife.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Jordmor</Text>
            </Pressable>
            <Pressable style={styles.careerItem}>
                <Image
                    source={require("../../assets/images/careers/developer.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Utvikler</Text>
            </Pressable>
            <Pressable style={styles.careerItem}>
                <Image
                    source={require("../../assets/images/careers/cleaner.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Renholder</Text>
            </Pressable>
            <Pressable style={styles.careerItem}>
                <Image
                    source={require("../../assets/images/careers/surgeon.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Kirurg</Text>
            </Pressable>
            <Pressable style={styles.careerItem}>
                <Image
                    source={require("../../assets/images/careers/doctor.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Lege</Text>
            </Pressable>
        </View>   
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 20,
    width: "100%",
    padding: 40,
    marginTop: 80,
  },
  careerItem: {
    alignItems: "center",
  },
  careerText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    alignContent: "center",
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    alignContent: "center",
  },
});
