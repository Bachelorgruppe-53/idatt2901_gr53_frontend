import React, { useEffect, useState } from "react";
import {
  ImageSourcePropType,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Image } from 'expo-image';
import { BaseStyles } from "../../constants/Styles";
import { useThemedStyles } from "../../hooks/useStyleSheet";
import { useThemeColor } from "../../hooks/useThemeColor";
import AboutCareer from "./aboutCareer";
import CareerBadge from "./careerBadge";

interface Career {
  career_id: number;
  name: string;
  imageSource?: ImageSourcePropType;
}

const DEFAULT_CAREER_IMAGE = require("../../../assets/images/careers/default.png");

/**
 * This component displays a grid of career options that users can select to view more information.
 *
 * @returns JSX.Element
 */

//TODO: implement functionality to fetch career data dynamically
export default function Careers() {
  const theme = useThemeColor();
  const themedStyles = useThemedStyles();

  const [careers, setCareers] = useState<Career[]>([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedCareer, setSelectedCareer] = React.useState<number | null>(
    null,
  );

  const hardcodedCareers: Career[] = [
    { career_id: 1, name: "Sykepleier"},
    { career_id: 2, name: "Jordmor" },
    { career_id: 3, name: "Utvikler" },
    { career_id: 4, name: "Renholder" },
    { career_id: 5, name: "Kirurg" },
    { career_id: 6, name: "Lege" },
  ];

  useEffect(() => {
    // TODO: Replace with actual backend fetch when available
    // For now, using hardcoded data
    setCareers(hardcodedCareers);
  }, []);

  const handlePress = (career_id: number) => {
    setSelectedCareer(career_id);
    setModalVisible(true);
  };

  const getImageSource = (career: Career): ImageSourcePropType => {
    if (career.imageSource) {
      return career.imageSource;
    }
    return DEFAULT_CAREER_IMAGE;
  };  

  return (
    <View style={themedStyles.container}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <AboutCareer
          careerName={careers.find((c) => c.career_id === selectedCareer)?.name || ""}
          onClose={() => setModalVisible(false)}
        />
      </Modal>

      <ScrollView contentContainerStyle={BaseStyles.grid}>
        {hardcodedCareers.map((career) => (
          <CareerBadge
            key={career.career_id}
            career_id={career.career_id}
            careerName={career.name}
            imageSource={getImageSource(career)}
            onPress={handlePress}
          />
        ))}
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
