import { loadUnlockedCareers } from "@/services/career/loadUnlockedCareers";
import type { UnlockedCareer } from "@/services/types/career";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, ScrollView, Text, View } from "react-native";
import { BaseStyles } from "../../constants/Styles";
import { useThemedStyles } from "../../hooks/useStyleSheet";
import AboutCareer from "./aboutCareer";
import CareerBadge from "./careerBadge";

/**
 * This component displays a grid of career options that users can select to view more information.
 *
 * @returns JSX.Element
 */

export default function Careers() {
  const { i18n, t } = useTranslation();
  const themedStyles = useThemedStyles();

  const [careers, setCareers] = useState<UnlockedCareer[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const language = i18n.resolvedLanguage ?? i18n.language;

      try {
        const loadedCareers = await loadUnlockedCareers(language);

        if (loadedCareers.length === 0) {
          console.warn(
            `[Careers] No careers returned from backend for language ${language}`,
          );
          setCareers([]);
          setWarningMessage(t("fetchError"));
          return;
        }

        setWarningMessage(null);
        setCareers(loadedCareers);
      } catch (error) {
        console.warn(
          `[Careers] Failed to load careers for language ${language}`,
          error,
        );
        setCareers([]);
        setWarningMessage(t("fetchError"));
      }
    };

    void load();
  }, [i18n.language, i18n.resolvedLanguage]);

  const handlePress = (career_id: number) => {
    setSelectedCareerId(career_id);
    setModalVisible(true);
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
          careerId={selectedCareerId}
          onClose={() => setModalVisible(false)}
        />
      </Modal>

      {warningMessage ? (
        <Text style={BaseStyles.my8}>{warningMessage}</Text>
      ) : null}

      <ScrollView contentContainerStyle={BaseStyles.grid}>
        {careers.map((career) => (
          <CareerBadge
            key={career.career_id}
            career_id={career.career_id}
            careerName={career.name}
            iconName={career.iconName}
            colorCode={career.colorCode}
            onPress={handlePress}
          />
        ))}
      </ScrollView>
    </View>
  );
}
