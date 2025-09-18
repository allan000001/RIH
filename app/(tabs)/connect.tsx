import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInDown,
  SlideInUp,
  SlideOutDown,
  BounceIn,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useApp } from '@/contexts/app-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StatusIndicator } from '@/components/ui/status-indicator';

const { width, height } = Dimensions.get('window');

// TypeScript interfaces
interface ConnectionData {
  id: string;
  hostId: string;
  hostName: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  connectedAt: Date;
  bandwidth?: number;
  dataUsed?: number;
  latency?: number;
  signalStrength?: number;
}

interface HostHistory {
  id: string;
  hostId: string;
  hostName: string;
  lastConnected: Date;
  connectionCount: number;
  averageSpeed?: number;
  isFavorite?: boolean;
}

interface QRData {
  type: string;
  hostId: string;
  hostName: string;
  deviceType: string;
  timestamp: string;
  version: string;
}

export default function ConnectScreen() {
  const colorScheme = 'dark'; // Force dark mode
  const colors = Colors.dark;
  const { state, setUserRole } = useApp();
  const { userRole } = state;
  const roleColors = userRole ? Colors[userRole].dark : colors;

  // Safe colors with fallbacks
  const safeColors = {
    ...colors,
    text: colors.text || '#000000',
    tabIconDefault: colors.tabIconDefault || '#666666',
  };

  // State for connector functionality
  const [hostId, setHostId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [currentConnection, setCurrentConnection] = useState<ConnectionData | null>(null);
  const [connectionHistory, setConnectionHistory] = useState<HostHistory[]>([
    {
      id: '1',
      hostId: 'SwiftLink123',
      hostName: 'John\'s iPhone',
      lastConnected: new Date(Date.now() - 3600000),
      connectionCount: 5,
      averageSpeed: 25.4,
      isFavorite: true,
    },
    {
      id: '2',
      hostId: 'FastHub456',
      hostName: 'Coffee Shop WiFi',
      lastConnected: new Date(Date.now() - 86400000),
      connectionCount: 2,
      averageSpeed: 18.2,
      isFavorite: false,
    },
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Animation values
  const scanAnimation = useSharedValue(0);
  const connectingAnimation = useSharedValue(0);
  const successAnimation = useSharedValue(0);
  const errorAnimation = useSharedValue(0);
  const pulseAnimation = useSharedValue(1);
  const slideAnimation = useSharedValue(0);
  const rotateAnimation = useSharedValue(0);
  const scaleAnimation = useSharedValue(1);
  const shimmerAnimation = useSharedValue(0);

  useEffect(() => {
    scanAnimation.value = withTiming(isScanning ? 1 : 0, { duration: 200 });
  }, [isScanning]);

  useEffect(() => {
    connectingAnimation.value = withTiming(isConnecting ? 1 : 0, { duration: 200 });
  }, [isConnecting]);

  // Initialize animations
  useEffect(() => {
    // Shimmer animation for loading states
    shimmerAnimation.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    // Pulse animation for interactive elements
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  // Camera permission is handled by useCameraPermissions hook

  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'error') => {
    switch (type) {
      case 'light':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  };

  const handleConnect = async () => {
    if (!hostId.trim()) {
      triggerHapticFeedback('error');
      errorAnimation.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
      Alert.alert('Error', 'Please enter a Host ID');
      return;
    }

    triggerHapticFeedback('medium');
    setIsConnecting(true);
    
    // Animate connecting state
    rotateAnimation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
    
    // Mock connection process with enhanced feedback
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      if (success) {
        // Success animation
        successAnimation.value = withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 300 })
        );
        
        triggerHapticFeedback('success');
        
        const newConnection: ConnectionData = {
          id: Date.now().toString(),
          hostId: hostId,
          hostName: `Host ${hostId}`,
          status: 'connected',
          connectedAt: new Date(),
          bandwidth: Math.random() * 50 + 10,
          latency: Math.random() * 50 + 20,
          signalStrength: Math.random() * 30 + 70,
        };
        
        setCurrentConnection(newConnection);
        
        // Add to history
        const existingIndex = connectionHistory.findIndex(h => h.hostId === hostId);
        if (existingIndex >= 0) {
          const updated = [...connectionHistory];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastConnected: new Date(),
            connectionCount: updated[existingIndex].connectionCount + 1,
          };
          setConnectionHistory(updated);
        } else {
          setConnectionHistory(prev => [{
            id: Date.now().toString(),
            hostId,
            hostName: `Host ${hostId}`,
            lastConnected: new Date(),
            connectionCount: 1,
            isFavorite: false,
          }, ...prev]);
        }
        
        Alert.alert('Success', 'Connected successfully!');
      } else {
        // Error animation
        errorAnimation.value = withSequence(
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 100 }),
          withTiming(1, { duration: 100 }),
          withTiming(0, { duration: 100 })
        );
        
        triggerHapticFeedback('error');
        Alert.alert('Error', 'Connection failed. Please try again.');
      }
      
      rotateAnimation.value = withTiming(0, { duration: 300 });
      setIsConnecting(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    triggerHapticFeedback('medium');
    
    // Disconnect animation
    scaleAnimation.value = withSequence(
      withTiming(0.9, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
    
    setCurrentConnection(null);
    Alert.alert('Disconnected', 'Connection terminated');
  };

  const handleQRCodeScanned = ({ type, data }: { type: string; data: string }) => {
    try {
      const qrData: QRData = JSON.parse(data);
      if (qrData.type === 'airlink-host' && qrData.hostId) {
        triggerHapticFeedback('success');
        setHostId(qrData.hostId);
        setShowCamera(false);
        setIsScanning(false);
        
        // Success animation
        successAnimation.value = withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 300 })
        );
        
        Alert.alert('QR Code Scanned', `Found host: ${qrData.hostName}`);
      } else {
        triggerHapticFeedback('error');
        Alert.alert('Invalid QR Code', 'This is not a valid AirLink host QR code.');
      }
    } catch (error) {
      triggerHapticFeedback('error');
      Alert.alert('Invalid QR Code', 'Could not read QR code data.');
    }
  };

  const handleImagePicker = async () => {
    triggerHapticFeedback('light');
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      // In a real implementation, you would process the image to extract QR code
      // For now, we'll simulate QR code detection
      triggerHapticFeedback('success');
      Alert.alert('Photo Processed', 'QR code detection from photos will be implemented in the next update.');
      setShowPhotoUpload(false);
    }
  };

  const handleCameraLaunch = async () => {
    if (!permission) {
      triggerHapticFeedback('error');
      Alert.alert('Permission Required', 'Camera permission is required to scan QR codes.');
      return;
    }
    
    if (!permission.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        triggerHapticFeedback('error');
        Alert.alert('No Camera Access', 'Please enable camera access in your device settings.');
        return;
      }
    }

    triggerHapticFeedback('light');
    setShowCamera(true);
    setIsScanning(true);
  };

  const toggleFavorite = (hostId: string) => {
    triggerHapticFeedback('light');
    setConnectionHistory(prev => 
      prev.map(host => 
        host.hostId === hostId 
          ? { ...host, isFavorite: !host.isFavorite }
          : host
      )
    );
  };

  const connectToHistoryHost = (host: HostHistory) => {
    triggerHapticFeedback('medium');
    setHostId(host.hostId);
    setShowHistory(false);
    
    // Animate the input field
    slideAnimation.value = withSequence(
      withTiming(1, { duration: 200 }),
      withTiming(0, { duration: 200 })
    );
  };

  // Animated styles
  const scanAnimatedStyle = useAnimatedStyle(() => ({
    opacity: scanAnimation.value,
    transform: [{ scale: 0.8 + scanAnimation.value * 0.2 }],
  }));

  const connectingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: connectingAnimation.value,
    transform: [{ translateY: (1 - connectingAnimation.value) * 20 }],
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successAnimation.value }],
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorAnimation.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const rotateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnimation.value}deg` }],
  }));

  const scaleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  const shimmerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + shimmerAnimation.value * 0.7,
  }));

  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnimation.value * 10 }],
  }));

  // Role selection if no role is set
  if (!userRole) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.roleSelection}>
          <Animated.View entering={FadeIn} style={styles.roleHeader}>
            <Text style={[styles.roleTitle, { color: safeColors.text }]}>
              How do you want to use AirLink?
            </Text>
            <Text style={[styles.roleSubtitle, { color: safeColors.tabIconDefault }]}>
              Choose your role to get started
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.roleOptions}>
            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: Colors.host.light.primary + '10', borderColor: Colors.host.light.primary }]}
              onPress={() => {
                triggerHapticFeedback('medium');
                setUserRole('host');
              }}
            >
              <View style={[styles.roleIcon, { backgroundColor: Colors.host.light.primary }]}>
                <Text style={styles.roleEmoji}>📡</Text>
              </View>
              <Text style={[styles.roleCardTitle, { color: Colors.host.light.primary }]}>
                Share Internet
              </Text>
              <Text style={[styles.roleCardDesc, { color: safeColors.tabIconDefault }]}>
                Share your internet connection with others
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, { backgroundColor: Colors.connector.light.primary + '10', borderColor: Colors.connector.light.primary }]}
              onPress={() => {
                triggerHapticFeedback('medium');
                setUserRole('connector');
              }}
            >
              <View style={[styles.roleIcon, { backgroundColor: Colors.connector.light.primary }]}>
                <Text style={styles.roleEmoji}>📱</Text>
              </View>
              <Text style={[styles.roleCardTitle, { color: Colors.connector.light.primary }]}>
                Connect to Internet
              </Text>
              <Text style={[styles.roleCardDesc, { color: safeColors.tabIconDefault }]}>
                Connect to shared internet connections
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  // Host mode - simplified message
  if (userRole === 'host') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <IconSymbol name="wifi" size={64} color={safeColors.tabIconDefault} />
          <Text style={[styles.emptyTitle, { color: safeColors.text }]}>
            Host Mode
          </Text>
          <Text style={[styles.emptySubtitle, { color: safeColors.tabIconDefault }]}>
            You're sharing your internet connection. Check the Home tab to manage your hosting.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Connector functionality - full connect interface
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
        <Text style={[styles.title, { color: safeColors.text }]}>
          Connect to Host
        </Text>
        <Text style={[styles.subtitle, { color: safeColors.tabIconDefault }]}>
          Find and connect to nearby hosts
        </Text>
      </Animated.View>

      {/* QR Scanner Overlay */}
      {isScanning && (
        <Animated.View style={[styles.scannerOverlay, scanAnimatedStyle]}>
          <View style={styles.scannerContent}>
            <IconSymbol name="qrcode.viewfinder" size={100} color={roleColors.primary} />
            <Text style={[styles.scannerText, { color: safeColors.text }]}>
              Scanning QR Code...
            </Text>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setIsScanning(false)}
            />
          </View>
        </Animated.View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Connection Form */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.connectionForm}>
          <Card variant="elevated">
            <CardContent>
              <View style={styles.inputRow}>
                <Input
                  value={hostId}
                  onChangeText={setHostId}
                  placeholder="Enter Host ID (e.g., SwiftLink123)"
                  style={styles.hostInput}
                  autoCapitalize="none"
                />
                <View style={styles.qrButtonContainer}>
                  <Animated.View style={pulseAnimatedStyle}>
                    <TouchableOpacity
                      style={[styles.qrButton, { backgroundColor: roleColors.primary }]}
                      onPress={handleCameraLaunch}
                      disabled={isScanning}
                    >
                      <IconSymbol 
                        name="qrcode.viewfinder" 
                        size={24} 
                        color="white" 
                      />
                    </TouchableOpacity>
                  </Animated.View>
                  
                  <TouchableOpacity
                    style={[styles.photoButton, { backgroundColor: colors.surface }]}
                    onPress={() => setShowPhotoUpload(true)}
                  >
                    <IconSymbol 
                      name="photo" 
                      size={20} 
                      color={roleColors.primary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Connection History Button */}
              <TouchableOpacity
                style={[styles.historyButton, { borderColor: roleColors.primary }]}
                onPress={() => {
                  triggerHapticFeedback('light');
                  setShowHistory(true);
                }}
              >
                <IconSymbol name="clock" size={16} color={roleColors.primary} />
                <Text style={[styles.historyButtonText, { color: roleColors.primary }]}>Recent Hosts</Text>
              </TouchableOpacity>

              <Button
                title={isConnecting ? 'Connecting...' : 'Connect'}
                variant="primary"
                size="large"
                fullWidth
                onPress={handleConnect}
                loading={isConnecting}
                disabled={!hostId.trim() || isConnecting}
              />

              {isConnecting && (
                <Animated.View style={[styles.connectingStatus, connectingAnimatedStyle]}>
                  <Animated.View style={rotateAnimatedStyle}>
                    <StatusIndicator
                      status="connecting"
                      customText="Establishing secure connection..."
                      size="medium"
                    />
                  </Animated.View>
                  
                  {/* Loading skeleton */}
                  <View style={styles.loadingSkeleton}>
                    <Animated.View style={[styles.skeletonBar, shimmerAnimatedStyle]} />
                    <Animated.View style={[styles.skeletonBar, styles.skeletonBarShort, shimmerAnimatedStyle]} />
                  </View>
                </Animated.View>
              )}
            </CardContent>
          </Card>
        </Animated.View>

        {/* Current Connection */}
        {currentConnection && (
          <Animated.View entering={SlideInDown.delay(300)} style={styles.currentConnection}>
            <Animated.View style={successAnimatedStyle}>
              <Card variant="elevated" style={{ borderColor: roleColors.primary, borderWidth: 2 }}>
                <CardContent>
                  <View style={styles.connectionHeader}>
                    <View style={styles.connectionInfo}>
                      <Text style={[styles.connectionTitle, { color: safeColors.text }]}>
                        Connected to {currentConnection.hostName}
                      </Text>
                      <StatusIndicator
                        status={currentConnection.status}
                        size="small"
                      />
                    </View>
                    <Animated.View style={scaleAnimatedStyle}>
                      <Button
                        title="Disconnect"
                        variant="outline"
                        size="small"
                        onPress={handleDisconnect}
                      />
                    </Animated.View>
                  </View>
                  
                  {/* Connection Metrics */}
                  <View style={styles.connectionMetrics}>
                    <View style={styles.metric}>
                      <Text style={[styles.metricLabel, { color: safeColors.tabIconDefault }]}>Speed</Text>
                      <Text style={[styles.metricValue, { color: roleColors.primary }]}>
                        {currentConnection.bandwidth?.toFixed(1)} Mbps
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={[styles.metricLabel, { color: safeColors.tabIconDefault }]}>Latency</Text>
                      <Text style={[styles.metricValue, { color: colors.success }]}>
                        {currentConnection.latency?.toFixed(0)}ms
                      </Text>
                    </View>
                    <View style={styles.metric}>
                      <Text style={[styles.metricLabel, { color: safeColors.tabIconDefault }]}>Signal</Text>
                      <Text style={[styles.metricValue, { color: colors.success }]}>
                        {currentConnection.signalStrength?.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide" presentationStyle="fullScreen">
        <SafeAreaView style={styles.cameraContainer}>
          {permission?.granted && (
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr'],
              }}
              onBarcodeScanned={handleQRCodeScanned}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.scanFrame}>
                  <View style={[styles.corner, styles.topLeft]} />
                  <View style={[styles.corner, styles.topRight]} />
                  <View style={[styles.corner, styles.bottomLeft]} />
                  <View style={[styles.corner, styles.bottomRight]} />
                </View>
                
                <Text style={styles.scanInstructions}>
                  Position QR code within the frame
                </Text>
                
                <TouchableOpacity
                  style={styles.closeCameraButton}
                  onPress={() => {
                    triggerHapticFeedback('light');
                    setShowCamera(false);
                    setIsScanning(false);
                  }}
                >
                  <IconSymbol name="xmark" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </CameraView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Photo Upload Modal */}
      <Modal visible={showPhotoUpload} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View entering={SlideInUp} exiting={SlideOutDown} style={[styles.photoModal, { backgroundColor: colors.card }]}>
            <View style={styles.photoModalHeader}>
              <Text style={[styles.photoModalTitle, { color: safeColors.text }]}>
                Upload QR Code Photo
              </Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  setShowPhotoUpload(false);
                }}
              >
                <IconSymbol name="xmark" size={24} color={safeColors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.photoModalDescription, { color: safeColors.tabIconDefault }]}>
              Select a photo containing a QR code from your gallery
            </Text>
            
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: roleColors.primary }]}
              onPress={handleImagePicker}
            >
              <IconSymbol name="photo" size={24} color="white" />
              <Text style={styles.uploadButtonText}>Choose Photo</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Connection History Modal */}
      <Modal visible={showHistory} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Animated.View entering={SlideInUp} exiting={SlideOutDown} style={[styles.historyModal, { backgroundColor: colors.card }]}>
            <View style={styles.historyModalHeader}>
              <Text style={[styles.historyModalTitle, { color: safeColors.text }]}>
                Recent Hosts
              </Text>
              <TouchableOpacity
                onPress={() => {
                  triggerHapticFeedback('light');
                  setShowHistory(false);
                }}
              >
                <IconSymbol name="xmark" size={24} color={safeColors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.historyList}>
              {connectionHistory.map((host, index) => (
                <Animated.View
                  key={host.id}
                  entering={FadeInDown.delay(index * 100)}
                  style={styles.historyItem}
                >
                  <TouchableOpacity
                    style={[styles.historyItemContent, { backgroundColor: colors.surface }]}
                    onPress={() => connectToHistoryHost(host)}
                  >
                    <View style={styles.historyItemInfo}>
                      <View style={styles.historyItemHeader}>
                        <Text style={[styles.historyItemName, { color: safeColors.text }]}>
                          {host.hostName}
                        </Text>
                        <TouchableOpacity
                          onPress={() => toggleFavorite(host.hostId)}
                          style={styles.favoriteButton}
                        >
                          <IconSymbol
                            name={host.isFavorite ? "heart.fill" : "heart"}
                            size={16}
                            color={host.isFavorite ? colors.error : safeColors.tabIconDefault}
                          />
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={[styles.historyItemId, { color: safeColors.tabIconDefault }]}>
                        {host.hostId}
                      </Text>
                      
                      <View style={styles.historyItemStats}>
                        <Text style={[styles.historyItemStat, { color: safeColors.tabIconDefault }]}>
                          {host.connectionCount} connections
                        </Text>
                        {host.averageSpeed && (
                          <Text style={[styles.historyItemStat, { color: roleColors.primary }]}>
                            {host.averageSpeed} Mbps avg
                          </Text>
                        )}
                        <Text style={[styles.historyItemStat, { color: safeColors.tabIconDefault }]}>
                          {formatTimeAgo(host.lastConnected)}
                        </Text>
                      </View>
                    </View>
                    
                    <IconSymbol name="chevron.right" size={16} color={safeColors.tabIconDefault} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  } else {
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  roleSelection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  roleHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  roleTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  roleSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  roleOptions: {
    width: '100%',
    gap: 20,
  },
  roleCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  roleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleEmoji: {
    fontSize: 28,
  },
  roleCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roleCardDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  connectionForm: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  hostInput: {
    flex: 1,
  },
  qrButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectingStatus: {
    marginTop: 16,
    alignItems: 'center',
  },
  currentConnection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionInfo: {
    flex: 1,
    marginRight: 12,
  },
  connectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  scannerContent: {
    alignItems: 'center',
    gap: 20,
  },
  scannerText: {
    fontSize: 18,
    fontWeight: '600',
  },
  qrButtonContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  photoButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 6,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingSkeleton: {
    marginTop: 12,
    gap: 8,
  },
  skeletonBar: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  skeletonBarShort: {
    width: '60%',
  },
  connectionMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Camera styles
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 3,
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
  scanInstructions: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  closeCameraButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  photoModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 200,
  },
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  photoModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  photoModalDescription: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // History modal styles
  historyModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
    minHeight: height * 0.5,
  },
  historyModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  historyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  historyList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  historyItem: {
    marginBottom: 12,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  historyItemInfo: {
    flex: 1,
  },
  historyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 4,
  },
  historyItemId: {
    fontSize: 14,
    marginBottom: 8,
  },
  historyItemStats: {
    flexDirection: 'row',
    gap: 12,
  },
  historyItemStat: {
    fontSize: 12,
  },
});
