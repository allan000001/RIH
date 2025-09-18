/**
 * airLink Design System - Role-based theming for Host (Green) and Connector (Blue)
 * Enhanced color palette with semantic colors for connection states and gamification
 */

import { Platform } from 'react-native';

// Role-based primary colors
const hostColorLight = '#22C55E'; // Green for Host
const hostColorDark = '#16A34A';
const connectorColorLight = '#3B82F6'; // Blue for Connector  
const connectorColorDark = '#2563EB';

// Semantic colors for connection states
const successColor = '#10B981';
const warningColor = '#F59E0B';
const errorColor = '#EF4444';
const neutralColor = '#6B7280';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#fff',
    card: '#fff',
    tint: '#0a7ea4', // Default tint, overridden by role
    primary: '#0a7ea4', // Default primary color
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',
    
    // Semantic colors
    success: successColor,
    warning: warningColor,
    error: errorColor,
    neutral: neutralColor,
    
    // Surface colors
    surface: '#F8FAFC',
    surfaceSecondary: '#F1F5F9',
    border: '#E2E8F0',
    
    // Connection status colors
    connected: successColor,
    connecting: warningColor,
    disconnected: neutralColor,
    
    // Gamification colors
    badge: '#8B5CF6',
    progress: '#06B6D4',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    card: '#1F2937',
    tint: '#fff',
    primary: '#fff', // Default primary color for dark mode
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
    
    // Semantic colors (adjusted for dark mode)
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    neutral: '#9CA3AF',
    
    // Surface colors
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    border: '#475569',
    
    // Connection status colors
    connected: '#059669',
    connecting: '#D97706',
    disconnected: '#9CA3AF',
    
    // Gamification colors
    badge: '#7C3AED',
    progress: '#0891B2',
  },
  
  // Role-specific themes
  host: {
    light: {
      primary: '#10B981', // Emerald green
      primaryDark: '#059669',
      accent: '#34D399', // Light green accent
      tint: '#10B981',
      tabIconSelected: '#10B981',
      surface: '#F0FDF4', // Very light green
      surfaceSecondary: '#DCFCE7',
      background: '#FAFFFE', // Almost white with green tint
      cardBackground: '#FFFFFF',
      text: '#0F172A', // Dark slate
      textSecondary: '#475569',
      border: '#E2E8F0',
      shadow: 'rgba(16, 185, 129, 0.1)',
    },
    dark: {
      primary: '#10B981',
      primaryDark: '#059669', 
      accent: '#6EE7B7',
      tint: '#10B981',
      tabIconSelected: '#10B981',
      surface: '#0F1419', // Very dark with green tint
      surfaceSecondary: '#1A1F25',
      background: '#0A0E13', // Deep black-green
      cardBackground: '#151B20',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155',
      shadow: 'rgba(16, 185, 129, 0.2)',
    }
  },
  
  connector: {
    light: {
      primary: '#3B82F6', // Blue
      primaryDark: '#2563EB',
      accent: '#60A5FA', // Light blue accent
      tint: '#3B82F6',
      tabIconSelected: '#3B82F6',
      surface: '#EFF6FF', // Very light blue
      surfaceSecondary: '#DBEAFE',
      background: '#FAFBFF', // Almost white with blue tint
      cardBackground: '#FFFFFF',
      text: '#0F172A', // Dark slate
      textSecondary: '#475569',
      border: '#E2E8F0',
      shadow: 'rgba(59, 130, 246, 0.1)',
    },
    dark: {
      primary: '#3B82F6',
      primaryDark: '#2563EB',
      accent: '#93C5FD',
      tint: '#3B82F6',
      tabIconSelected: '#3B82F6',
      surface: '#0F1419', // Very dark with blue tint
      surfaceSecondary: '#1A1F25',
      background: '#0A0E13', // Deep black-blue
      cardBackground: '#151B20',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155',
      shadow: 'rgba(59, 130, 246, 0.2)',
    }
  }
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
});
