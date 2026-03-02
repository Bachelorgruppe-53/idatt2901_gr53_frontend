import { StyleSheet, View } from "react-native";
import { BaseStyles } from "@/src/constants/Styles";
import Scoreboard from "./genericScoreboard";

/**
 * City-wide scoreboard showing a static list of schools.
 *
 * @returns JSX.Element
 */
export default function CityScoreboard() {
  return (
    <View style={BaseStyles.flex}>
      <Scoreboard
        // Static data placeholder; replace with API data when available.
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
        scoreboardType="cityScoreboard"
      />
    </View>
  );
}
