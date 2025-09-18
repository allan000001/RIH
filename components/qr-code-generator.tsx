import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  title?: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

export function QRCodeGenerator({ 
  value, 
  size = 200, 
  title,
  backgroundColor,
  foregroundColor 
}: QRCodeGeneratorProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: colors.text }]}>
          {title}
        </Text>
      )}
      <View style={[styles.qrContainer, { backgroundColor: backgroundColor || colors.card }]}>
        <QRCode
          value={value}
          size={size}
          backgroundColor={backgroundColor || colors.card}
          color={foregroundColor || colors.text}
          logoSize={30}
          logoBackgroundColor="transparent"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
