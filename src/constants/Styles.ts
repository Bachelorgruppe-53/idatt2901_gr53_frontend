import { Platform, StyleSheet } from "react-native";
import { Colors } from "./Colors";

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
} as const;

const Typography = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const BaseStyles = StyleSheet.create({
    // Layout
    flex: { flex: 1 },
    row: { flexDirection: "row" },
    center: { justifyContent: "center", alignItems: "center" },

    rowCenter: { flexDirection: "row", justifyContent: "center", alignItems: "center" },

    // Spacing
    gap4: {gap: Spacing.xs},
    gap8: {gap: Spacing.sm},
    gap16: {gap: Spacing.md},
    gap24: {gap: Spacing.lg},
    gap32: {gap: Spacing.xl},
    gap48: {gap: Spacing.xxl},

    // padding
    p4: {padding: Spacing.xs},
    p8: {padding: Spacing.sm},
    p16: {padding: Spacing.md},
    p24: {padding: Spacing.lg},
    p32: {padding: Spacing.xl},
    p48: {padding: Spacing.xxl},

    px4: {paddingHorizontal: Spacing.xs},
    px8: {paddingHorizontal: Spacing.sm},
    px16: {paddingHorizontal: Spacing.md},
    px24: {paddingHorizontal: Spacing.lg},
    px32: {paddingHorizontal: Spacing.xl},
    px48: {paddingHorizontal: Spacing.xxl},

    py4: {paddingVertical: Spacing.xs},
    py8: {paddingVertical: Spacing.sm},
    py16: {paddingVertical: Spacing.md},
    py24: {paddingVertical: Spacing.lg},
    py32: {paddingVertical: Spacing.xl},
    py48: {paddingVertical: Spacing.xxl},

    // Margin
    m4: {margin: Spacing.xs},
    m8: {margin: Spacing.sm},
    m16: {margin: Spacing.md},
    m24: {margin: Spacing.lg},
    m32: {margin: Spacing.xl},
    m48: {margin: Spacing.xxl},

    mx4: {marginHorizontal: Spacing.xs},
    mx8: {marginHorizontal: Spacing.sm},
    mx16: {marginHorizontal: Spacing.md},
    mx24: {marginHorizontal: Spacing.lg},
    mx32: {marginHorizontal: Spacing.xl},
    mx48: {marginHorizontal: Spacing.xxl},

    my4: {marginVertical: Spacing.xs},
    my8: {marginVertical: Spacing.sm},
    my16: {marginVertical: Spacing.md},
    my24: {marginVertical: Spacing.lg},
    my32: {marginVertical: Spacing.xl},
    my48: {marginVertical: Spacing.xxl},

    // Border Radius
    rounded4: {borderRadius: BorderRadius.sm},
    rounded8: {borderRadius: BorderRadius.md},
    rounded12: {borderRadius: BorderRadius.lg},
    rounded16: {borderRadius: BorderRadius.xl},
    roundedFull: {borderRadius: BorderRadius.round},
    
    // typography
    textXs: { fontSize: Typography.xs },
    textSm: { fontSize: Typography.sm },
    textBase: { fontSize: Typography.base },
    textLg: { fontSize: Typography.lg },
    textXl: { fontSize: Typography.xl },
    textXxl: { fontSize: Typography.xxl },
    textXxxl: { fontSize: Typography.xxxl },
    
    fontRegular: { fontWeight: FontWeight.regular },
    fontMedium: { fontWeight: FontWeight.medium },
    fontSemibold: { fontWeight: FontWeight.semibold },
    fontBold: { fontWeight: FontWeight.bold },
    
    textCenter: { textAlign: "center" },
    textLeft: { textAlign: "left" },
    textRight: { textAlign: "right" },
})


// styles using themecolors
export const createThemedStyles = (theme: typeof Colors.light | typeof Colors.dark) =>
  StyleSheet.create({
    // containers
    container: {
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: theme.backgroundSecondary,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
    },

    
    // buttons
    button: {
        backgroundColor: theme.button,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: "center",
        justifyContent: "center",
        padding: Spacing.md,
        width: "80%",
        marginVertical: Spacing.sm,
    },
    buttonRed: {
        backgroundColor: Colors.brand.red,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: theme.buttontext,
        fontSize: 18,
        fontWeight: "medium",
    },
    buttonRound: {
        backgroundColor: theme.button,
        padding: Spacing.md,
        borderRadius: BorderRadius.round,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: Spacing.sm,
        width: 70,
        height: 70,
    },

    // text
    text: {
      color: theme.text,
      fontSize: Typography.base,
    },
    textSecondary: {
      color: theme.placeholder,
      fontSize: Typography.sm,
    },
    heading: {
      color: theme.text,
      fontSize: Typography.xxl,
      fontWeight: FontWeight.bold,
    },
    subheading: {
      color: theme.text,
      fontSize: Typography.xl,
      fontWeight: FontWeight.semibold,
    },
    boldText: {
      color: theme.text,
      fontSize: Typography.base,
      fontWeight: FontWeight.bold,
    },

    // inputs
    input: {
      backgroundColor: theme.backgroundSecondary,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: BorderRadius.md,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      color: theme.text,
      fontSize: Typography.base,
    },
    inputFocused: {
      borderColor: theme.accent,
      borderWidth: 2,
    },

    // dividers
    separator: {
      height: 1,
      backgroundColor: theme.border,
    },
    separatorVertical: {
      width: 1,
      backgroundColor: theme.border,
    },

    // segmented control
    segmentedControl: {
      height: 45,
      overflow: "hidden",
      marginBottom: Platform.OS === "ios" ? 80 : 10,
      borderRadius: Platform.OS === "ios" ? 20 : 8,
      backgroundColor: theme.background,

      
    },
    activeSegmentText: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.buttontext,
    },
    segmentText: {
      fontSize: 16,
      color: theme.text,
    },
    segmentedView: {
      paddingHorizontal: 40,
      paddingVertical: 15,
    },

    // modals
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      alignItems: "center",
      justifyContent: "center",
    },
    modalCard: {
      width: "80%",
      padding: 20,
      borderRadius: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 8,
    },
    modalCode: {
      fontSize: 22,
      fontWeight: "700",
      letterSpacing: 1,
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    modalButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
    },

})