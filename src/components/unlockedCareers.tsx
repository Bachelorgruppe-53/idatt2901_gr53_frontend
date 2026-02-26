import React from "react";
import { StyleSheet, Text, View, Image, Pressable, Modal, ScrollView } from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import { useThemedStyles } from "../hooks/useStyleSheet";
import { BaseStyles } from "../constants/Styles";
import AboutCareer from "./aboutCareer";

/**
 * This component displays a grid of career options that users can select to view more information.
 * 
 * @returns JSX.Element
 */

//TODO: implement functionality to fetch career data dynamically
export default function Careers() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedCareer, setSelectedCareer] = React.useState<string | null>(null);

  const handlePress = (careerName: string) => {
    setSelectedCareer(careerName);
    setModalVisible(true);
  }

  return (
    <View style={themedStyles.container}>

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

        <ScrollView contentContainerStyle={BaseStyles.grid}>
            <Pressable style={[BaseStyles.alignCenter, { width: "28%" }]}
                onPress={() => handlePress("Sykepleier")}>
                <Image
                    source={require("../../assets/images/careers/nurse.png")}
                    style={styles.image}/> 
                <Text style={[themedStyles.boldText, BaseStyles.my8]}>Sykepleier</Text>
            </Pressable>
            
            <Pressable style={[BaseStyles.alignCenter, { width: "28%" }]}
                onPress={() => handlePress("Jordmor")}>
                <Image
                    source={require("../../assets/images/careers/midwife.png")}
                    style={styles.image}/> 
                <Text style={[themedStyles.boldText, BaseStyles.my8]}>Jordmor</Text>
            </Pressable>
            <Pressable style={[BaseStyles.alignCenter, { width: "28%" }]}
                onPress={() => handlePress("Utvikler")}>
                <Image
                    source={require("../../assets/images/careers/developer.png")}
                    style={styles.image}/> 
                <Text style={[themedStyles.boldText, BaseStyles.my8]}>Utvikler</Text>
            </Pressable>
            <Pressable style={[BaseStyles.alignCenter, { width: "28%" }]}
                onPress={() => handlePress("Renholder")}>
                <Image
                    source={require("../../assets/images/careers/cleaner.png")}
                    style={styles.image}/> 
                <Text style={[themedStyles.boldText, BaseStyles.my8]}>Renholder</Text>
            </Pressable>
            <Pressable style={[BaseStyles.alignCenter, { width: "28%" }]}
                onPress={() => handlePress("Kirurg")}>
                <Image
                    source={require("../../assets/images/careers/surgeon.png")}
                    style={styles.image}/> 
                <Text style={[themedStyles.boldText, BaseStyles.my8]}>Kirurg</Text>
            </Pressable>
            <Pressable style={[BaseStyles.alignCenter, { width: "28%" }]}
                onPress={() => handlePress("Lege")}>
                <Image
                    source={require("../../assets/images/careers/doctor.png")}
                    style={styles.image}/> 
                <Text style={[themedStyles.boldText, BaseStyles.my8]}>Lege</Text>
            </Pressable>
        </ScrollView>   
    </View>
);
}

const styles = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    alignContent: "center",
  },
});
