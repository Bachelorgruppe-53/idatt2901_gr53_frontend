import { View } from "react-native";
import { MapComponent } from "../../src/components/map/mapComponent";
import { BaseStyles } from "@/src/constants/Styles";

export default function MapScreen() {
  return (
    <View style={BaseStyles.flex}>
      <MapComponent style={BaseStyles.flex} />
    </View>
  );
}
