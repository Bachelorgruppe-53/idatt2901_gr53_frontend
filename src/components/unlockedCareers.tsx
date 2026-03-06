import React from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/useThemeColor";
import AboutCareer from "./aboutCareer";
import Quiz from "./quiz/quiz";

/**
 * This component displays a grid of career options that users can select to view more information.
 *
 * @returns JSX.Element
 */

//TODO: implement functionality to fetch career data dynamically
export default function Careers() {
  const theme = useThemeColor();

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedCareer, setSelectedCareer] = React.useState<string | null>(
    null,
  );
  const [quizVisible, setQuizVisible] = React.useState(false);
  const quizScoreRef = React.useRef(0);

  const handlePress = (careerName: string) => {
    setSelectedCareer(careerName);
    setModalVisible(true);
  };

  // sample questions to pass to Quiz (matches the Quiz default set)
  const sampleQuestions = [
    {
      question: "Hva gjør en sykepleier?",
      options: ["Tar vare på pasienter", "Lager mat", "Kjører ambulanse"],
      correctIndex: 0,
    },
    {
      question: "Hvilken utdanning trenger man for å bli sykepleier?",
      options: ["Bachelorgrad", "Mastergrad", "Doktorgrad"],
      correctIndex: 0,
    },
    {
      question: "Hvor mange sykepleiere jobber på St. Olavs hospital?",
      options: ["500", "1000", "1500"],
      correctIndex: 1,
    },
  ];

  const handleAnswer = (questionIndex: number, selectedIndex: number) => {
    const correct = sampleQuestions[questionIndex]?.correctIndex;
    if (typeof correct === "number" && correct === selectedIndex) {
      quizScoreRef.current += 1;
    }
  };

  const handleQuizComplete = () => {
    // close only the quiz modal and show results; keep career modal open
    setQuizVisible(false);
    Alert.alert(
      "Quiz ferdig",
      `Du fikk ${quizScoreRef.current} av ${sampleQuestions.length} riktige.`,
    );
    // reset score for next time
    quizScoreRef.current = 0;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <AboutCareer
          careerName={selectedCareer}
          onClose={() => setModalVisible(false)}
          onClaim={() => {
            // open quiz when Claim is pressed in AboutCareer
            quizScoreRef.current = 0;
            setQuizVisible(true);
          }}
        />

        <Modal
          animationType="slide"
          transparent={false}
          visible={quizVisible}
          onRequestClose={() => setQuizVisible(false)}
        >
          <View
            style={[
              styles.quizModalContainer,
              { backgroundColor: theme.background },
            ]}
          >
            <Quiz
              key={`${selectedCareer}-${quizVisible}`}
              questions={sampleQuestions}
              onAnswer={handleAnswer}
              onComplete={handleQuizComplete}
            />
            {/* <Pressable
              onPress={() => setQuizVisible(false)}
              style={styles.closeQuizButton}
            >
              <Text style={styles.closeQuizText}>Lukk quiz</Text>
            </Pressable> */}
          </View>
        </Modal>
      </Modal>

      <ScrollView contentContainerStyle={styles.grid}>
        <Pressable
          style={styles.careerItem}
          onPress={() => handlePress("Sykepleier")}
        >
          <Image
            source={require("../../assets/images/careers/nurse.png")}
            style={styles.image}
          />
          <Text style={[styles.careerText, { color: theme.text }]}>
            Sykepleier
          </Text>
        </Pressable>
        <Pressable
          style={styles.careerItem}
          onPress={() => handlePress("Jordmor")}
        >
          <Image
            source={require("../../assets/images/careers/midwife.png")}
            style={styles.image}
          />
          <Text style={[styles.careerText, { color: theme.text }]}>
            Jordmor
          </Text>
        </Pressable>
        <Pressable
          style={styles.careerItem}
          onPress={() => handlePress("Utvikler")}
        >
          <Image
            source={require("../../assets/images/careers/developer.png")}
            style={styles.image}
          />
          <Text style={[styles.careerText, { color: theme.text }]}>
            Utvikler
          </Text>
        </Pressable>
        <Pressable
          style={styles.careerItem}
          onPress={() => handlePress("Renholder")}
        >
          <Image
            source={require("../../assets/images/careers/cleaner.png")}
            style={styles.image}
          />
          <Text style={[styles.careerText, { color: theme.text }]}>
            Renholder
          </Text>
        </Pressable>
        <Pressable
          style={styles.careerItem}
          onPress={() => handlePress("Kirurg")}
        >
          <Image
            source={require("../../assets/images/careers/surgeon.png")}
            style={styles.image}
          />
          <Text style={[styles.careerText, { color: theme.text }]}>Kirurg</Text>
        </Pressable>
        <Pressable
          style={styles.careerItem}
          onPress={() => handlePress("Lege")}
        >
          <Image
            source={require("../../assets/images/careers/doctor.png")}
            style={styles.image}
          />
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
  careerText: {
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
  startQuizButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 16,
  },
  startQuizText: {
    color: "#fff",
    fontWeight: "600",
  },
  quizModalContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "stretch",
  },
  closeQuizButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    backgroundColor: "#888",
  },
  closeQuizText: {
    color: "#fff",
    fontWeight: "600",
  },
});
