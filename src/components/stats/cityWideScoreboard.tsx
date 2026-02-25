import { StyleSheet, View } from "react-native";
import Scoreboard from "./genericScoreboard";

export default function CityScoreboard() {
  return (
    <View style={styles.screen}>
      <Scoreboard
        entities={[
          "Cissi Klein vgs",
          "Thora Storm vgs",
          "Malvik vgs",
          "Rosenborg ungdomskole",
          "Byåsen vgs",
          "Nidelven ungdomskole",
          "Strindheim videregående",
          "Stavne ungdomskole",
          "Trondheim vgs",
          "Heimdal ungdomskole",
          "Flatåsen videregående",
          "Tiller ungdomskole",
        ]}
        scores={[1200, 950, 800, 750, 600, 580, 520, 480, 450, 420, 380, 340]}
        scoreboardType="cityWide"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
