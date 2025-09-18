import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface QRCodeScannerProps {
  isVisible: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  title?: string;
}

export function QRCodeScanner({ isVisible, onClose, onScan, title = "Scan QR Code" }: QRCodeScannerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    if (isVisible) {
      getCameraPermissions();
    }
  }, [isVisible]);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    onScan(data);
    
    // Reset scanned state after a delay to allow rescanning
    setTimeout(() => {
      setScanned(false);
    }, 2000);
  };

  const handleClose = () => {
    setScanned(false);
    onClose();
  };

  if (hasPermission === null) {
    return (
      <Modal visible={isVisible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.message, { color: colors.text }]}>
            Requesting camera permission...
          </Text>
        </View>
      </Modal>
    );
  }

  if (hasPermission === false) {
    return (
      <Modal visible={isVisible} animationType="slide">
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Animated.View entering={FadeIn} style={styles.permissionContainer}>
            <IconSymbol name="camera.fill" size={64} color={colors.textSecondary} />
            <Text style={[styles.title, { color: colors.text }]}>
              Camera Permission Required
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              Please enable camera access to scan QR codes
            </Text>
            <Button
              title="Close"
              onPress={handleClose}
              variant="outline"
              style={styles.button}
            />
          </Animated.View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={isVisible} animationType="slide">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {title}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Camera View */}
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr', 'pdf417'],
            }}
          />
          
          {/* Scanning Overlay */}
          <View style={styles.overlay}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.topRight, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.bottomLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.bottomRight, { borderColor: colors.primary }]} />
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.instructions, { backgroundColor: colors.card }]}>
          <Text style={[styles.instructionText, { color: colors.text }]}>
            Position the QR code within the frame
          </Text>
          {scanned && (
            <Animated.View entering={FadeIn} exiting={FadeOut}>
              <Text style={[styles.scannedText, { color: colors.primary }]}>
                ✓ QR Code Scanned!
              </Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructions: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  scannedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    minWidth: 120,
  },
});
