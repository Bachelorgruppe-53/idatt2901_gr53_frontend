import { StyleSheet, Text, Image, Pressable, ImageSourcePropType } from "react-native";
import { useThemedStyles } from "../../hooks/useStyleSheet";
import { BaseStyles } from "../../constants/Styles";

/**
 * CareerBadge component that displays a badge for a career/POI.
 * @props career_id - Unique identifier for the career.
 * @props careerName - Name of the career to display.
 * @props imageSource - Image source for the career badge.
 * @props onPress - Callback function to handle press events, receives career_id and careerName as arguments.
 * @returns JSX.Element
 * 
 * TODO: Implement dynamic image fetching based on career_id when backend support is available.
 */

type CareerBadgeProps = {
  career_id: number;
  careerName: string;
  imageSource: ImageSourcePropType;
  onPress: (career_id: number, careerName: string) => void;
};

export default function CareerBadge({ career_id, careerName, imageSource, onPress }: CareerBadgeProps) {
  const themedStyles = useThemedStyles();

  return (
    <Pressable
      style={[BaseStyles.alignCenter, { width: "28%" }]}
      onPress={() => onPress(career_id, careerName)}
    >
      <Image source={imageSource} style={styles.image} />
      <Text style={[themedStyles.boldText, BaseStyles.my8]}>{careerName}</Text>
    </Pressable>
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