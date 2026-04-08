import { loadUnlockedCareers } from "@/services/career/loadUnlockedCareers";
import type { PaginationInfo, UnlockedCareer } from "@/services/types/career";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Modal, Text, View } from "react-native";
import SearchBar from "../../../components/searchBar";
import { Colors } from "../../constants/Colors";
import { BaseStyles } from "../../constants/Styles";
import { useThemedStyles } from "../../hooks/useStyleSheet";
import AboutCareer from "./aboutCareer";
import CareerBadge from "./careerBadge";

/**
 * This component displays a list of unlocked/claimed careers.
 */
export default function Careers() {
  const { i18n, t } = useTranslation("aboutCareer");
  const themedStyles = useThemedStyles();

  const [careers, setCareers] = useState<UnlockedCareer[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCareerId, setSelectedCareerId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const language = i18n.resolvedLanguage ?? i18n.language;
      setIsLoading(true);

      try {
        const result = await loadUnlockedCareers(language, 0);

        if (result.careers.length === 0) {
          console.warn(
            `[Careers] No careers returned from backend for language ${language}`,
          );
          setCareers([]);
          setPagination(result.pagination);
          setCurrentPage(0);
          setWarningMessage(t("noCareers"));
          return;
        }

        setWarningMessage(null);
        setCareers(result.careers);
        setPagination(result.pagination);
        setCurrentPage(0);
      } catch (error) {
        console.warn(
          `[Careers] Failed to load careers for language ${language}`,
          error,
        );
        setCareers([]);
        setWarningMessage(t("noCareers"));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [i18n.language, i18n.resolvedLanguage, t]);

  const handleEndReached = async () => {
    if (isLoading || !pagination || currentPage >= pagination.totalPages - 1) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoading(true);

    try {
      const language = i18n.resolvedLanguage ?? i18n.language;
      const result = await loadUnlockedCareers(language, nextPage);

      if (result.careers.length > 0) {
        setCareers((prev) => [...prev, ...result.careers]);
        setPagination(result.pagination);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.warn("[Careers] Failed to load next page", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = (career_id: number) => {
    setSelectedCareerId(career_id);
    setModalVisible(true);
  };

  const filteredCareers = careers.filter((career) =>
    career.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );
  const noResultsFound =
    searchQuery.trim().length > 0 && filteredCareers.length === 0;

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
        <View
          style={[
            BaseStyles.flex,
            BaseStyles.center,
            BaseStyles.p24,
            BaseStyles.gap16,
          ]}
        >
          <MaterialIcons
            name="sentiment-very-dissatisfied"
            size={64}
            color={Colors.brand.black}
          />
          <Text style={[themedStyles.subheading, BaseStyles.textCenter]}>
            {warningMessage}
          </Text>
        </View>
      ) : (
        <>
          <Text
            style={[themedStyles.heading, BaseStyles.mt16, BaseStyles.mb16]}
          >
            {t("unlockedCareersTitle", {
              count: pagination?.totalElements ?? careers.length,
            })}
          </Text>

          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t("searchPlaceholder")}
          />

          {noResultsFound ? (
            <View
              style={[
                { width: "100%" },
                { padding: 32 },
                { flexDirection: "column" },
                { alignItems: "center" },
                BaseStyles.my16,
              ]}
            >
              <MaterialIcons
                name="search-off"
                size={64}
                color={Colors.brand.gray}
              />
              <Text
                style={[
                  BaseStyles.my16,
                  BaseStyles.textCenter,
                  themedStyles.boldText,
                  { fontSize: 18 },
                ]}
              >
                {t("noResultsHeading")}
              </Text>
              <Text
                style={[
                  BaseStyles.textCenter,
                  themedStyles.text,
                  { fontSize: 14 },
                ]}
              >
                {t("noResultsDesc")}
              </Text>
            </View>
          ) : null}

          <FlatList
            data={filteredCareers}
            style={{ width: "100%" }}
            renderItem={({ item: career }) => (
              <CareerBadge
                career_id={career.career_id}
                careerName={career.name}
                iconName={career.iconName}
                colorCode={career.colorCode}
                onPress={handlePress}
              />
            )}
            keyExtractor={(item) => item.career_id.toString()}
            numColumns={1}
            contentContainerStyle={{
              paddingHorizontal: 0,
              paddingTop: 20,
              paddingBottom: 40,
              gap: 20,
            }}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoading ? (
                <ActivityIndicator size="large" style={BaseStyles.my8} />
              ) : null
            }
            scrollEnabled={true}
          />
        </>
      )}
    </View>
  );
}
