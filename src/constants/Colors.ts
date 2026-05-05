
/**
 * A palette of color values used throughout the application.
 */

const palette = {
  darkBlue: "#003087",
  lightBlue: "#6CACE4",
  black: "#000000",
  white: "#FFFFFF",
  gray: "#BFCED6",
  paleblue: "#C8EAE4",
  sage: "#6FA287",
  lightGreen: "#ADDFB3",
  turquoise: "#00C19F",
  green: "#93C90E",
  yellow: "#FFC845",
  darkYellow: "#F7A700",
  orange: "#FF671F",
  brown: "#A76E5E",
  red: "#CB333B",
  purple: "#87189D",
};

export const Colors = {
  brand: palette,

  light: {
    text: palette.black,
    background: "#EFEEE6",
    backgroundSecondary: "#D6D6D6",
    accent: palette.darkBlue,
    accentSecondary: palette.lightBlue,
    button: palette.darkBlue,
    buttontext: palette.white,
    placeholder: "#6C6C6C",
    border: "#535353",
    barTrack: "#D6D6D6",
    barFill: "#3c3c3c",
    errorRed: palette.red,
  },
  dark: {
    text: palette.white,
    background: "#141414",
    backgroundSecondary: "#2C2C2C",
    accent: palette.lightBlue,
    accentSecondary: palette.darkBlue,
    button: palette.lightBlue,
    buttontext: palette.black,
    placeholder: "#AFAFAF",
    border: "#8a8988",
    barTrack: "#3c3c3c",
    barFill: "#D6D6D6",
    errorRed: "#f05860",
  },
};
