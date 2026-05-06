import { View } from "react-native";
import { MapComponent } from "@/src/components/map/mapComponent";
import { BaseStyles } from "@/src/constants/Styles";

/**
 * This component renders the Map screen, which displays a map using the MapComponent.
 * @returns JSX.Element
 */

export default function MapScreen() {
  return (
    <View style={BaseStyles.flex}>
      <MapComponent style={BaseStyles.flex} />
    </View>
  );
}
