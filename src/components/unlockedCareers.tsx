import React from "react";
import { StyleSheet, Text, View, Image, Pressable, Modal, ScrollView } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import AboutCareer from "./aboutCareer";

/**
 * This component displays a grid of career options that users can select to view more information.
 * 
 * @returns JSX.Element
 */

//TODO: implement functionality to fetch career data dynamically
export default function Careers() {
  const theme = useThemeColor();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedCareer, setSelectedCareer] = React.useState<string | null>(null);

  const handlePress = (careerName: string) => {
    setSelectedCareer(careerName);
    setModalVisible(true);
  }

  return (
    <View style={[
        styles.container,
        { backgroundColor: theme.background },]}>

        <Modal
            animationType="slide"
            transparent={false}
            visible={modalVisible}
            onRequestClose={() => {setModalVisible(!modalVisible);
            }}>
            <AboutCareer 
                careerName={selectedCareer} 
                onClose={() => setModalVisible(false)} />

        </Modal>

        <ScrollView contentContainerStyle={styles.grid}>
            <Pressable style={styles.careerItem}
                onPress={() => handlePress("Sykepleier")}>
                <Image
                    source={require("../../assets/images/careers/nurse.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Sykepleier</Text>
            </Pressable>
            <Pressable style={styles.careerItem}
                onPress={() => handlePress("Jordmor")}>
                <Image
                    source={require("../../assets/images/careers/midwife.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Jordmor</Text>
            </Pressable>
            <Pressable style={styles.careerItem}
                onPress={() => handlePress("Utvikler")}>
                <Image
                    source={require("../../assets/images/careers/developer.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Utvikler</Text>
            </Pressable>
            <Pressable style={styles.careerItem}
                onPress={() => handlePress("Renholder")}>
                <Image
                    source={require("../../assets/images/careers/cleaner.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Renholder</Text>
            </Pressable>
            <Pressable style={styles.careerItem}
                onPress={() => handlePress("Kirurg")}>
                <Image
                    source={require("../../assets/images/careers/surgeon.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Kirurg</Text>
            </Pressable>
            <Pressable style={styles.careerItem}
                onPress={() => handlePress("Lege")}>
                <Image
                    source={require("../../assets/images/careers/doctor.png")}
                    style={styles.image}/> 
                <Text style={[styles.careerText, { color: theme.text }]}>Lege</Text>
            </Pressable>
        </ScrollView>   
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
    justifyContent: "flex-start",
    gap: 20,
    width: "100%",
    padding: 40,
    marginTop: 80,
  },
  careerItem: {
    alignItems: "center",
    width: "28%",
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
