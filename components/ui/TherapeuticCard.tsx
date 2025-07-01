import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/Colors";
import { Spacing } from "../../constants/Spacing";

interface TherapeuticCardProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "neutral" | "calming";
  style?: ViewStyle;
  elevation?: "none" | "subtle" | "medium" | "high";
  padding?: "none" | "small" | "medium" | "large";
  borderRadius?: "small" | "medium" | "large" | "xl";
  useGradient?: boolean;
  darkMode?: boolean;
  testID?: string;
}

const TherapeuticCard: React.FC<TherapeuticCardProps> = ({
  children,
  variant = "primary",
  style,
  elevation = "subtle",
  padding = "medium",
  borderRadius = "medium",
  useGradient = false,
  darkMode = false,
  testID,
}) => {
  const getVariantColors = () => {
    if (useGradient) {
      switch (variant) {
        case "primary":
          return darkMode
            ? Colors.gradients.darkPrimary
            : Colors.gradients.primary;
        case "secondary":
          return darkMode
            ? Colors.gradients.darkSecondary
            : Colors.gradients.secondary;
        case "accent":
          return darkMode
            ? Colors.gradients.darkAccent
            : Colors.gradients.accent;
        case "neutral":
          return darkMode
            ? Colors.gradients.darkNeutral
            : Colors.gradients.neutral;
        case "calming":
          return darkMode
            ? Colors.gradients.darkPrimary
            : Colors.gradients.primary;
        default:
          return Colors.gradients.primary;
      }
    } else {
      switch (variant) {
        case "primary":
          return darkMode
            ? Colors.background.darkPrimary
            : Colors.background.primary;
        case "secondary":
          return darkMode
            ? Colors.background.darkSecondary
            : Colors.background.secondary;
        case "accent":
          return darkMode
            ? Colors.background.darkAccent
            : Colors.background.accent;
        case "neutral":
          return darkMode
            ? Colors.background.darkNeutral
            : Colors.background.neutral;
        case "calming":
          return darkMode ? Colors.primary[100] : Colors.primary[50];
        default:
          return Colors.background.primary;
      }
    }
  };

  const getElevationStyle = () => {
    switch (elevation) {
      case "none":
        return {};
      case "subtle":
        return {
          shadowColor: Colors.shadow.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 1,
        };
      case "medium":
        return {
          shadowColor: Colors.shadow.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 3,
        };
      case "high":
        return {
          shadowColor: Colors.shadow.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        };
      default:
        return {};
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case "none":
        return { padding: 0 };
      case "small":
        return { padding: Spacing.sm };
      case "medium":
        return { padding: Spacing.md };
      case "large":
        return { padding: Spacing.lg };
      default:
        return { padding: Spacing.md };
    }
  };

  const getBorderRadiusStyle = () => {
    switch (borderRadius) {
      case "small":
        return { borderRadius: 8 };
      case "medium":
        return { borderRadius: 12 };
      case "large":
        return { borderRadius: 16 };
      case "xl":
        return { borderRadius: 24 };
      default:
        return { borderRadius: 12 };
    }
  };

  const cardStyle = [
    styles.card,
    getPaddingStyle(),
    getBorderRadiusStyle(),
    getElevationStyle(),
    style,
  ];

  if (useGradient) {
    const gradientColors = getVariantColors();
    return (
      <LinearGradient
        colors={gradientColors}
        style={cardStyle}
        testID={testID}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View
      style={[cardStyle, { backgroundColor: getVariantColors() }]}
      testID={testID}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // Base card styles
    overflow: "hidden",
  },
});

export default TherapeuticCard;