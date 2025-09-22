import { Platform } from 'react-native';

const palette = {
  // Neutral Colors
  neutral100: '#FFFFFF',
  neutral200: '#F8FAFC',
  neutral300: '#F1F5F9',
  neutral400: '#E2E8F0',
  neutral500: '#CBD5E1',
  neutral600: '#94A3B8',
  neutral700: '#64748B',
  neutral800: '#334155',
  neutral900: '#1E293B',
  neutral1000: '#0F172A',

  // Host Colors (Green)
  host100: '#F0FDF4',
  host200: '#DCFCE7',
  host300: '#BBF7D0',
  host400: '#86EFAC',
  host500: '#4ADE80',
  host600: '#22C55E', // Primary
  host700: '#16A34A',
  host800: '#15803D',
  host900: '#166534',

  // Connector Colors (Blue)
  connector100: '#EFF6FF',
  connector200: '#DBEAFE',
  connector300: '#BFDBFE',
  connector400: '#93C5FD',
  connector500: '#60A5FA',
  connector600: '#3B82F6', // Primary
  connector700: '#2563EB',
  connector800: '#1D4ED8',
  connector900: '#1E40AF',

  // Semantic Colors
  success500: '#10B981',
  warning500: '#F59E0B',
  error500: '#EF4444',

  // Gamification & Accent
  badge500: '#8B5CF6',
  progress500: '#06B6D4',
};

const typography = {
  fonts: Platform.select({
    ios: {
      sans: 'system-ui',
      serif: 'ui-serif',
      rounded: 'ui-rounded',
      mono: 'ui-monospace',
    },
    default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
  }),
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16, // Base
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  fontWeights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    loose: 1.75,
  },
};

const spacing = {
  '0': 0,
  '1': 4,
  '2': 8,
  '3': 12,
  '4': 16,
  '5': 20,
  '6': 24,
  '8': 32,
  '10': 40,
  '12': 48,
  '16': 64,
};

const radii = {
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
};

const shadows = {
  sm: {
    shadowColor: palette.neutral1000,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: palette.neutral1000,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: palette.neutral1000,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
};

const lightTheme = {
  colors: {
    primary: palette.host600,
    primaryContrast: palette.neutral100,
    secondary: palette.neutral800,
    background: palette.neutral200,
    card: palette.neutral100,
    text: palette.neutral900,
    textSecondary: palette.neutral700,
    border: palette.neutral400,
    success: palette.success500,
    warning: palette.warning500,
    error: palette.error500,
    badge: palette.badge500,
    progress: palette.progress500,
  },
  ...typography,
  spacing,
  radii,
  shadows,
};

const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primary: palette.host600,
    background: palette.neutral1000,
    card: palette.neutral900,
    text: palette.neutral100,
    textSecondary: palette.neutral500,
    border: palette.neutral800,
  },
};

const themes = {
  light: lightTheme,
  dark: darkTheme,
  host: {
    light: {
      ...lightTheme,
      colors: {
        ...lightTheme.colors,
        primary: palette.host600,
      },
    },
    dark: {
      ...darkTheme,
      colors: {
        ...darkTheme.colors,
        primary: palette.host600,
      },
    },
  },
  connector: {
    light: {
      ...lightTheme,
      colors: {
        ...lightTheme.colors,
        primary: palette.connector600,
      },
    },
    dark: {
      ...darkTheme,
      colors: {
        ...darkTheme.colors,
        primary: palette.connector600,
      },
    },
  },
};

export type Theme = typeof lightTheme;
export default themes;
