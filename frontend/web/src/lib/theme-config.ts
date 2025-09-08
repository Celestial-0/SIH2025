// Theme configuration for charts and components
export const themeConfig = {
  light: {
    background: {
      primary: "rgba(255, 255, 255, 0.8)",
      secondary: "rgba(249, 250, 251, 1)",
      tertiary: "rgba(243, 244, 246, 1)",
    },
    colors: {
      green: {
        50: "rgba(240, 253, 244, 1)",
        100: "rgba(220, 252, 231, 1)",
        500: "rgba(34, 197, 94, 1)",
        600: "rgba(22, 163, 74, 1)",
        700: "rgba(21, 128, 61, 1)",
      },
      blue: {
        50: "rgba(239, 246, 255, 1)",
        100: "rgba(219, 234, 254, 1)",
        500: "rgba(59, 130, 246, 1)",
        600: "rgba(37, 99, 235, 1)",
        700: "rgba(29, 78, 216, 1)",
      },
      text: {
        primary: "rgba(17, 24, 39, 1)",
        secondary: "rgba(107, 114, 128, 1)",
        tertiary: "rgba(156, 163, 175, 1)",
      }
    }
  },
  dark: {
    background: {
      primary: "rgba(31, 41, 55, 0.8)",
      secondary: "rgba(17, 24, 39, 1)",
      tertiary: "rgba(55, 65, 81, 0.5)",
    },
    colors: {
      green: {
        50: "rgba(21, 128, 61, 0.2)",
        100: "rgba(21, 128, 61, 0.5)",
        400: "rgba(74, 222, 128, 1)",
        500: "rgba(34, 197, 94, 1)",
        600: "rgba(22, 163, 74, 1)",
      },
      blue: {
        50: "rgba(29, 78, 216, 0.2)",
        100: "rgba(29, 78, 216, 0.5)",
        400: "rgba(96, 165, 250, 1)",
        500: "rgba(59, 130, 246, 1)",
        600: "rgba(37, 99, 235, 1)",
      },
      text: {
        primary: "rgba(249, 250, 251, 1)",
        secondary: "rgba(209, 213, 219, 1)",
        tertiary: "rgba(156, 163, 175, 1)",
      }
    }
  }
};

export const chartTheme = {
  light: {
    backgroundColor: [
      "rgba(34, 197, 94, 0.8)",  // Green for predicted
      "rgba(59, 130, 246, 0.6)", // Blue for others
    ],
    borderColor: [
      "rgba(34, 197, 94, 1)",
      "rgba(59, 130, 246, 0.8)",
    ],
    gridColor: "rgba(107, 114, 128, 0.1)",
    tickColor: "#6B7280",
  },
  dark: {
    backgroundColor: [
      "rgba(74, 222, 128, 0.8)",  // Light green for predicted
      "rgba(96, 165, 250, 0.6)",  // Light blue for others
    ],
    borderColor: [
      "rgba(74, 222, 128, 1)",
      "rgba(96, 165, 250, 0.8)",
    ],
    gridColor: "rgba(156, 163, 175, 0.1)",
    tickColor: "#9CA3AF",
  }
};
