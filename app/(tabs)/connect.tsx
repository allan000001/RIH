import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  Modal,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
  SlideOutDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '@/lib/useTheme';
import { useApp } from '@/lib/app-context';
import { Card, CardContent, CardHeader } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { Input } from '@/components/design-system/input';
import { IconSymbol } from '@/components/design-system/icon-symbol';
import { StatusIndicator } from '@/components/design-system/status-indicator';
import { Theme } from '@/constants/theme';
import { api } from '@/services/api';

const { width, height } = Dimensions.get('window');

// --- Interfaces ---
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

interface Connection {
  id: string;
  name: string;
  deviceType: string;
  status: 'connected' | 'connecting' | 'disconnected' | 'pending';
  connectedAt?: Date;
  dataUsed: number;
  bandwidth: number;
  location: string;
  avatar: string;
  trustLevel: 'high' | 'medium' | 'low';
}

type FilterType = 'all' | 'connected' | 'pending' | 'disconnected';
type SortType = 'name' | 'dataUsed' | 'connectedAt' | 'trustLevel';

// --- Main Component ---
export default function ConnectScreen() {
  const { state } = useApp();
  const { userRole } = state;

  if (userRole === 'host') {
    return <HostConnectionsScreen />;
  }

  return <ConnectorConnectScreen />;
}

// --- Connector's Connect Screen ---
function ConnectorConnectScreen() {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { state, setUserRole, openCamera, closeCamera } = useApp();
    const { userRole, isCameraOpen } = state;

    const [hostId, setHostId] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [showPhotoUpload, setShowPhotoUpload] = useState(false);
    const [currentConnection, setCurrentConnection] = useState<ConnectionData | null>(null);
    const [connectionHistory, setConnectionHistory] = useState<HostHistory[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    
    // Animation values
    const connectingAnimation = useSharedValue(0);
    const successAnimation = useSharedValue(0);
    const errorAnimation = useSharedValue(0);
    const rotateAnimation = useSharedValue(0);
    const scaleAnimation = useSharedValue(1);
    const shimmerAnimation = useSharedValue(0);
    const slideAnimation = useSharedValue(0);

    useEffect(() => {
        connectingAnimation.value = withTiming(isConnecting ? 1 : 0, { duration: 200 });
    }, [isConnecting]);

    useEffect(() => {
        shimmerAnimation.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
        );
    }, []);

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
        
        rotateAnimation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
        );
        
        setTimeout(() => {
        const success = Math.random() > 0.2;
        
        if (success) {
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
        
        scaleAnimation.value = withSequence(
        withTiming(0.9, { duration: 150 }),
        withTiming(1, { duration: 150 })
        );
        
        setCurrentConnection(null);
        Alert.alert('Disconnected', 'Connection terminated');
    };

    const handleQRCodeScanned = ({ data }: { data: string }) => {
        try {
        const qrData: QRData = JSON.parse(data);
        if (qrData.type === 'airlink-host' && qrData.hostId) {
            triggerHapticFeedback('success');
            setHostId(qrData.hostId);
            closeCamera();

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
        triggerHapticFeedback('success');
        Alert.alert('Photo Processed', 'QR code detection from photos will be implemented in the next update.');
        setShowPhotoUpload(false);
        }
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

        slideAnimation.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(0, { duration: 200 })
        );
    };

    const connectingAnimatedStyle = useAnimatedStyle(() => ({
        opacity: connectingAnimation.value,
        transform: [{ translateY: (1 - connectingAnimation.value) * 20 }],
    }));

    const successAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: successAnimation.value }],
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

    return (
        <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
            <Text style={styles.title}>
            Connect to Host
            </Text>
            <Text style={styles.subtitle}>
            Find and connect to nearby hosts
            </Text>
        </Animated.View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                    <TouchableOpacity
                    style={[styles.photoButton, { backgroundColor: theme.colors.card }]}
                    onPress={() => setShowPhotoUpload(true)}
                    >
                    <IconSymbol 
                        name="photo"
                        size={20}
                        color={theme.colors.primary}
                    />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.historyButton}
                    onPress={() => {
                    triggerHapticFeedback('light');
                    setShowHistory(true);
                    }}
                >
                    <IconSymbol name="clock" size={16} color={theme.colors.primary} />
                    <Text style={styles.historyButtonText}>Recent Hosts</Text>
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

                    <View style={styles.loadingSkeleton}>
                        <Animated.View style={[styles.skeletonBar, shimmerAnimatedStyle]} />
                        <Animated.View style={[styles.skeletonBar, styles.skeletonBarShort, shimmerAnimatedStyle]} />
                    </View>
                    </Animated.View>
                )}
                </CardContent>
            </Card>
            </Animated.View>

            {currentConnection && (
            <Animated.View entering={SlideInUp.delay(300)} style={styles.currentConnection}>
                <Animated.View style={successAnimatedStyle}>
                <Card variant="elevated" style={{ borderColor: theme.colors.primary, borderWidth: 2 }}>
                    <CardContent>
                    <View style={styles.connectionHeader}>
                        <View style={styles.connectionInfo}>
                        <Text style={styles.connectionTitle}>
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

                    <View style={styles.connectionMetrics}>
                        <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Speed</Text>
                        <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                            {currentConnection.bandwidth?.toFixed(1)} Mbps
                        </Text>
                        </View>
                        <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Latency</Text>
                        <Text style={[styles.metricValue, { color: theme.colors.success }]}>
                            {currentConnection.latency?.toFixed(0)}ms
                        </Text>
                        </View>
                        <View style={styles.metric}>
                        <Text style={styles.metricLabel}>Signal</Text>
                        <Text style={[styles.metricValue, { color: theme.colors.success }]}>
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

        <Modal visible={isCameraOpen} animationType="slide" presentationStyle="fullScreen">
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
                        closeCamera();
                    }}
                    >
                    <IconSymbol name="xmark" size={24} color="white" />
                    </TouchableOpacity>
                </View>
                </CameraView>
            )}
            </SafeAreaView>
        </Modal>

        <Modal visible={showPhotoUpload} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
            <Animated.View entering={SlideInUp} exiting={SlideOutDown} style={styles.photoModal}>
                <View style={styles.photoModalHeader}>
                <Text style={styles.photoModalTitle}>
                    Upload QR Code Photo
                </Text>
                <TouchableOpacity
                    onPress={() => {
                    triggerHapticFeedback('light');
                    setShowPhotoUpload(false);
                    }}
                >
                    <IconSymbol name="xmark" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                </View>
                
                <Text style={styles.photoModalDescription}>
                Select a photo containing a QR code from your gallery
                </Text>
                
                <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleImagePicker}
                >
                <IconSymbol name="photo" size={24} color="white" />
                <Text style={styles.uploadButtonText}>Choose Photo</Text>
                </TouchableOpacity>
            </Animated.View>
            </View>
        </Modal>

        <Modal visible={showHistory} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
            <Animated.View entering={SlideInUp} exiting={SlideOutDown} style={styles.historyModal}>
                <View style={styles.historyModalHeader}>
                <Text style={styles.historyModalTitle}>
                    Recent Hosts
                </Text>
                <TouchableOpacity
                    onPress={() => {
                    triggerHapticFeedback('light');
                    setShowHistory(false);
                    }}
                >
                    <IconSymbol name="xmark" size={24} color={theme.colors.text} />
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
                        style={styles.historyItemContent}
                        onPress={() => connectToHistoryHost(host)}
                    >
                        <View style={styles.historyItemInfo}>
                        <View style={styles.historyItemHeader}>
                            <Text style={styles.historyItemName}>
                            {host.hostName}
                            </Text>
                            <TouchableOpacity
                            onPress={() => toggleFavorite(host.hostId)}
                            style={styles.favoriteButton}
                            >
                            <IconSymbol
                                name={host.isFavorite ? "heart.fill" : "heart"}
                                size={16}
                                color={host.isFavorite ? theme.colors.error : theme.colors.textSecondary}
                            />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.historyItemId}>
                            {host.hostId}
                        </Text>

                        <View style={styles.historyItemStats}>
                            <Text style={styles.historyItemStat}>
                            {host.connectionCount} connections
                            </Text>
                            {host.averageSpeed && (
                            <Text style={[styles.historyItemStat, { color: theme.colors.primary }]}>
                                {host.averageSpeed} Mbps avg
                            </Text>
                            )}
                            <Text style={styles.historyItemStat}>
                            {formatTimeAgo(host.lastConnected)}
                            </Text>
                        </View>
                        </View>

                        <IconSymbol name="chevron.right" size={16} color={theme.colors.textSecondary} />
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

// --- Host's Connections Screen ---
function HostConnectionsScreen() {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { state } = useApp();
    const { userRole } = state;

    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
    const [sortBy, setSortBy] = useState<SortType>('connectedAt');
    const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
    const [showBulkActions, setShowBulkActions] = useState(false);

    const filterAnimations = Array.from({ length: 4 }, () => useSharedValue(0));
    const bulkActionsAnimation = useSharedValue(0);

    useEffect(() => {
        fetchConnections();
    }, []);

    useEffect(() => {
        filterAnimations.forEach((anim, index) => {
        anim.value = withDelay(index * 100, withSpring(1, { damping: 15 }));
        });
    }, []);

    useEffect(() => {
        bulkActionsAnimation.value = withSpring(showBulkActions ? 1 : 0, { damping: 15 });
    }, [showBulkActions]);

    const fetchConnections = async () => {
        setLoading(true);
        const fetchedConnections = await api.getConnections();
        setConnections(fetchedConnections);
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchConnections();
        setRefreshing(false);
    };

    const filteredConnections = connections.filter(conn => {
        const matchesSearch = conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            conn.deviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            conn.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = selectedFilter === 'all' || conn.status === selectedFilter;

        return matchesSearch && matchesFilter;
    });

    const sortedConnections = [...filteredConnections].sort((a, b) => {
        switch (sortBy) {
        case 'name':
            return a.name.localeCompare(b.name);
        case 'dataUsed':
            return b.dataUsed - a.dataUsed;
        case 'connectedAt':
            if (!a.connectedAt && !b.connectedAt) return 0;
            if (!a.connectedAt) return 1;
            if (!b.connectedAt) return -1;
            return b.connectedAt.getTime() - a.connectedAt.getTime();
        case 'trustLevel':
            const trustOrder = { high: 3, medium: 2, low: 1 };
            return trustOrder[b.trustLevel] - trustOrder[a.trustLevel];
        default:
            return 0;
        }
    });

    const handleApprove = (id: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const handleReject = (id: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    };

    const handleDisconnect = (id: string) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    };

    const toggleConnectionSelection = (id: string) => {
        setSelectedConnections(prev =>
        prev.includes(id)
            ? prev.filter(connId => connId !== id)
            : [...prev, id]
        );
        setShowBulkActions(selectedConnections.length > 0 || !selectedConnections.includes(id));
    };

    const handleBulkApprove = () => {
        selectedConnections.forEach(handleApprove);
        setSelectedConnections([]);
        setShowBulkActions(false);
    };

    const getTrustLevelColor = (level: Connection['trustLevel']) => {
        switch (level) {
        case 'high': return theme.colors.success;
        case 'medium': return theme.colors.warning;
        case 'low': return theme.colors.error;
        default: return theme.colors.textSecondary;
        }
    };

    const formatDataUsage = (bytes: number) => {
        if (bytes === 0) return '0 MB';
        if (bytes < 1024) return `${bytes} MB`;
        return `${(bytes / 1024).toFixed(1)} GB`;
    };

    const formatTimeAgo = (date?: Date) => {
        if (!date) return 'Never';
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };

    const bulkActionsStyle = useAnimatedStyle(() => ({
        opacity: bulkActionsAnimation.value,
        transform: [{ translateY: (1 - bulkActionsAnimation.value) * 50 }],
    }));

    const ConnectionSkeleton = () => (
        <Animated.View entering={FadeIn} style={styles.skeletonCard}>
        <Card variant="default">
            <CardContent>
            <View style={styles.skeletonContent}>
                <View style={styles.skeletonHeader}>
                <View style={[styles.skeletonAvatar, { backgroundColor: theme.colors.border }]} />
                <View style={styles.skeletonInfo}>
                    <View style={[styles.skeletonLine, styles.skeletonTitle, { backgroundColor: theme.colors.border }]} />
                    <View style={[styles.skeletonLine, styles.skeletonSubtitle, { backgroundColor: theme.colors.border }]} />
                </View>
                <View style={[styles.skeletonStatus, { backgroundColor: theme.colors.border }]} />
                </View>
                <View style={styles.skeletonStats}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={[styles.skeletonStat, { backgroundColor: theme.colors.border }]} />
                ))}
                </View>
            </View>
            </CardContent>
        </Card>
        </Animated.View>
    );

    const SwipeableConnectionCard = React.memo(({
        connection,
        onApprove,
        onReject,
        onDisconnect,
    }: {
        connection: Connection;
        onApprove?: (id: string) => void;
        onReject?: (id: string) => void;
        onDisconnect?: (id: string) => void;
    }) => {
        const translateX = useSharedValue(0);
        const opacity = useSharedValue(1);
        const scale = useSharedValue(1);

        const gestureHandler = Gesture.Pan()
        .onStart(() => {
            scale.value = withSpring(0.95);
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            scale.value = withSpring(1);
            const shouldDismiss = Math.abs(event.translationX) > width * 0.3;
            
            if (shouldDismiss) {
            const direction = event.translationX > 0 ? 1 : -1;
            translateX.value = withTiming(direction * width);
            opacity.value = withTiming(0, undefined, () => {
                if (direction > 0 && connection.status === 'pending' && onApprove) {
                runOnJS(onApprove)(connection.id);
                } else if (direction < 0) {
                if (connection.status === 'pending' && onReject) {
                    runOnJS(onReject)(connection.id);
                } else if (connection.status === 'connected' && onDisconnect) {
                    runOnJS(onDisconnect)(connection.id);
                }
                }
            });
            } else {
            translateX.value = withSpring(0);
            }
        });

        const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: scale.value }
        ],
        opacity: opacity.value,
        }));

        const leftActionStyle = useAnimatedStyle(() => ({
        opacity: translateX.value > 50 ? 1 : 0,
        transform: [{ scale: translateX.value > 50 ? 1 : 0.8 }],
        }));

        const rightActionStyle = useAnimatedStyle(() => ({
        opacity: translateX.value < -50 ? 1 : 0,
        transform: [{ scale: translateX.value < -50 ? 1 : 0.8 }],
        }));

        return (
        <View style={styles.swipeContainer}>
            {connection.status === 'pending' && (
            <Animated.View style={[styles.swipeAction, styles.leftAction, leftActionStyle]}>
                <IconSymbol name="checkmark.circle.fill" size={32} color={theme.colors.primaryContrast} />
                <Text style={[styles.swipeActionText, { color: theme.colors.primaryContrast }]}>Approve</Text>
            </Animated.View>
            )}

            <Animated.View style={[styles.swipeAction, styles.rightAction, rightActionStyle]}>
            <IconSymbol
                name={connection.status === 'connected' ? "xmark.circle.fill" : "trash.circle.fill"}
                size={32}
                color={theme.colors.primaryContrast}
            />
            <Text style={[styles.swipeActionText, { color: theme.colors.primaryContrast }]}>
                {connection.status === 'connected' ? 'Disconnect' : 'Reject'}
            </Text>
            </Animated.View>

            <GestureDetector gesture={gestureHandler}>
            <Animated.View style={cardStyle}>
                <Card
                variant="default"
                style={[
                    styles.connectionCard,
                    selectedConnections.includes(connection.id) && {
                    borderColor: theme.colors.primary,
                    borderWidth: 2,
                    },
                ]}
                >
                <CardContent>
                    <TouchableOpacity
                    style={styles.connectionContent}
                    onLongPress={() => toggleConnectionSelection(connection.id)}
                    onPress={() => selectedConnections.length > 0 && toggleConnectionSelection(connection.id)}
                    >
                    <View style={styles.connectionHeader}>
                        <View style={styles.connectionInfo}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatar}>{connection.avatar}</Text>
                            <View style={[
                            styles.trustBadge,
                            { backgroundColor: getTrustLevelColor(connection.trustLevel) + '20' }
                            ]}>
                            <View style={[
                                styles.trustDot,
                                { backgroundColor: getTrustLevelColor(connection.trustLevel) }
                            ]} />
                            </View>
                        </View>

                        <View style={styles.connectionDetails}>
                            <Text style={styles.connectionName}>
                            {connection.name}
                            </Text>
                            <Text style={styles.connectionDevice}>
                            {connection.deviceType}
                            </Text>
                            <Text style={styles.connectionLocation}>
                            📍 {connection.location}
                            </Text>
                        </View>
                        </View>

                        <View style={styles.connectionStatus}>
                        <StatusIndicator
                            status={connection.status as any}
                            size="small"
                            showText={false}
                        />
                        </View>
                    </View>

                    <View style={styles.connectionStats}>
                        <View style={styles.statItem}>
                        <IconSymbol name="arrow.up.circle" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.statLabel}>
                            Data Used
                        </Text>
                        <Text style={styles.statValue}>
                            {formatDataUsage(connection.dataUsed)}
                        </Text>
                        </View>

                        {connection.status === 'connected' && (
                        <View style={styles.statItem}>
                            <IconSymbol name="arrow.clockwise.circle" size={16} color={theme.colors.success} />
                            <Text style={styles.statLabel}>
                            Speed
                            </Text>
                            <Text style={styles.statValue}>
                            {connection.bandwidth.toFixed(1)} Mbps
                            </Text>
                        </View>
                        )}

                        <View style={styles.statItem}>
                        <IconSymbol name="clock" size={16} color={theme.colors.textSecondary} />
                        <Text style={styles.statLabel}>
                            Last Seen
                        </Text>
                        <Text style={styles.statValue}>
                            {formatTimeAgo(connection.connectedAt)}
                        </Text>
                        </View>
                    </View>

                    {connection.status === 'pending' && (
                        <View style={styles.connectionActions}>
                        <Button
                            title="Approve"
                            variant="primary"
                            size="small"
                            role="host"
                            onPress={() => handleApprove(connection.id)}
                        />
                        <Button
                            title="Reject"
                            variant="outline"
                            size="small"
                            onPress={() => handleReject(connection.id)}
                        />
                        </View>
                    )}

                    {connection.status === 'connected' && (
                        <View style={styles.connectionActions}>
                        <Button
                            title="Manage"
                            variant="outline"
                            size="small"
                            onPress={() => {}}
                        />
                        <Button
                            title="Details"
                            variant="outline"
                            size="small"
                            onPress={() => {}}
                        />
                        </View>
                    )}
                    </TouchableOpacity>
                </CardContent>
                </Card>
            </Animated.View>
            </GestureDetector>
        </View>
        );
    });

    return (
        <SafeAreaView style={styles.container}>
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
            <View>
            <Text style={styles.title}>
                Connections
            </Text>
            <Text style={styles.subtitle}>
                {filteredConnections.length} total • {filteredConnections.filter(c => c.status === 'connected').length} active
            </Text>
            </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.searchSection}>
            <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="magnifyingglass"
            style={styles.searchInput}
            />

            <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}
            >
            {[
                { key: 'all', label: 'All', count: connections.length },
                { key: 'connected', label: 'Connected', count: connections.filter(c => c.status === 'connected').length },
                { key: 'pending', label: 'Pending', count: connections.filter(c => c.status === 'pending').length },
                { key: 'disconnected', label: 'Offline', count: connections.filter(c => c.status === 'disconnected').length },
            ].map((filter, index) => {
                const animatedStyle = useAnimatedStyle(() => ({
                opacity: filterAnimations[index].value,
                transform: [{ scale: filterAnimations[index].value }],
                }));

                return (
                <Animated.View key={filter.key} style={animatedStyle}>
                    <TouchableOpacity
                    style={[
                        styles.filterButton,
                        selectedFilter === filter.key && {
                        backgroundColor: theme.colors.primary,
                        }
                    ]}
                    onPress={() => setSelectedFilter(filter.key as FilterType)}
                    >
                    <Text style={[
                        styles.filterButtonText,
                        { color: selectedFilter === filter.key ? theme.colors.primaryContrast : theme.colors.text }
                    ]}>
                        {filter.label} ({filter.count})
                    </Text>
                    </TouchableOpacity>
                </Animated.View>
                );
            })}
            </ScrollView>
        </Animated.View>

        {showBulkActions && (
            <Animated.View style={[styles.bulkActions, bulkActionsStyle]}>
            <Card variant="elevated">
                <CardContent>
                <View style={styles.bulkActionsContent}>
                    <Text style={styles.bulkActionsText}>
                    {selectedConnections.length} selected
                    </Text>
                    <View style={styles.bulkActionsButtons}>
                    <Button
                        title="Approve All"
                        variant="primary"
                        size="small"
                        role="host"
                        onPress={handleBulkApprove}
                    />
                    <Button
                        title="Disconnect All"
                        variant="outline"
                        size="small"
                        onPress={() => {}}
                    />
                    </View>
                </View>
                </CardContent>
            </Card>
            </Animated.View>
        )}

        <ScrollView
            style={styles.scrollView}
            refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.connectionsList}>
            {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                <ConnectionSkeleton key={`skeleton-${index}`} />
                ))
            ) : (
                sortedConnections.map((connection, index) => (
                <SwipeableConnectionCard
                    key={connection.id}
                    connection={connection}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onDisconnect={handleDisconnect}
                />
                ))
            )}
            </View>

            {sortedConnections.length === 0 && !loading && (
            <Animated.View entering={FadeIn.delay(600)} style={styles.emptyState}>
                <IconSymbol name="magnifyingglass" size={64} color={theme.colors.textSecondary} />
                <Text style={styles.emptyTitle}>
                No connections found
                </Text>
                <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search or filters' : 'Share your Host ID to get started'}
                </Text>
            </Animated.View>
            )}
        </ScrollView>
        </SafeAreaView>
    );
}

// --- Styles ---
const getStyles = (theme: Theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    roleSelection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing[5],
    },
    roleHeader: {
        alignItems: 'center',
        marginBottom: theme.spacing[10],
    },
    roleTitle: {
        fontSize: theme.fontSizes['3xl'],
        fontWeight: theme.fontWeights.bold,
        textAlign: 'center',
        marginBottom: theme.spacing[2],
        color: theme.colors.text,
    },
    roleSubtitle: {
        fontSize: theme.fontSizes.lg,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    roleOptions: {
        width: '100%',
        gap: theme.spacing[5],
    },
    roleCard: {
        padding: theme.spacing[6],
        borderRadius: theme.radii.lg,
        borderWidth: 2,
        alignItems: 'center',
    },
    roleIcon: {
        width: 60,
        height: 60,
        borderRadius: theme.radii.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing[4],
    },
    roleEmoji: {
        fontSize: theme.fontSizes['3xl'],
    },
    roleCardTitle: {
        fontSize: theme.fontSizes.xl,
        fontWeight: theme.fontWeights.bold,
        marginBottom: theme.spacing[2],
    },
    roleCardDesc: {
        fontSize: theme.fontSizes.sm,
        textAlign: 'center',
        color: theme.colors.textSecondary,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing[10],
    },
    emptyTitle: {
        fontSize: theme.fontSizes['2xl'],
        fontWeight: theme.fontWeights.bold,
        marginTop: theme.spacing[5],
        marginBottom: theme.spacing[2],
        textAlign: 'center',
        color: theme.colors.text,
    },
    emptySubtitle: {
        fontSize: theme.fontSizes.md,
        textAlign: 'center',
        lineHeight: theme.lineHeights.loose,
        color: theme.colors.textSecondary,
    },
    header: {
        paddingHorizontal: theme.spacing[5],
        paddingVertical: theme.spacing[4],
    },
    title: {
        fontSize: theme.fontSizes['3xl'],
        fontWeight: theme.fontWeights.bold,
        marginBottom: theme.spacing[1],
        color: theme.colors.text,
    },
    scrollView: {
        flex: 1,
    },
    connectionForm: {
        paddingHorizontal: theme.spacing[5],
        marginBottom: theme.spacing[5],
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
        marginBottom: theme.spacing[4],
    },
    hostInput: {
        flex: 1,
    },
    photoButton: {
        width: 48,
        height: 48,
        borderRadius: theme.radii.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing[2],
        paddingHorizontal: theme.spacing[3],
        borderRadius: theme.radii.md,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginBottom: theme.spacing[4],
        gap: theme.spacing[2],
    },
    historyButtonText: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.primary,
    },
    connectingStatus: {
        marginTop: theme.spacing[4],
        alignItems: 'center',
    },
    currentConnection: {
        paddingHorizontal: theme.spacing[5],
        marginBottom: theme.spacing[5],
    },
    connectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    connectionInfo: {
        flex: 1,
        marginRight: theme.spacing[3],
    },
    connectionTitle: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
        marginBottom: theme.spacing[1],
        color: theme.colors.text,
    },
    loadingSkeleton: {
        marginTop: theme.spacing[3],
        gap: theme.spacing[2],
    },
    skeletonBar: {
        height: 12,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radii.sm,
    },
    skeletonBarShort: {
        width: '60%',
    },
    connectionMetrics: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.spacing[4],
        paddingTop: theme.spacing[4],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    metric: {
        alignItems: 'center',
    },
    metricLabel: {
        fontSize: theme.fontSizes.xs,
        marginBottom: theme.spacing[1],
        color: theme.colors.textSecondary,
    },
    metricValue: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
    },
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
        backgroundColor: theme.colors.card,
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
        color: theme.colors.text,
    },
    photoModalDescription: {
        fontSize: 16,
        marginBottom: 24,
        lineHeight: 22,
        color: theme.colors.textSecondary,
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
    historyModal: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: height * 0.8,
        minHeight: height * 0.5,
        backgroundColor: theme.colors.card,
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
        color: theme.colors.text,
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
        backgroundColor: theme.colors.background,
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
        color: theme.colors.text,
    },
    favoriteButton: {
        padding: 4,
    },
    historyItemId: {
        fontSize: 14,
        marginBottom: 8,
        color: theme.colors.textSecondary,
    },
    historyItemStats: {
        flexDirection: 'row',
        gap: 12,
    },
    historyItemStat: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    searchSection: {
        paddingHorizontal: theme.spacing[6],
        marginBottom: theme.spacing[5],
    },
    searchInput: {
        marginBottom: theme.spacing[4],
    },
    filtersContainer: {
        marginBottom: theme.spacing[2],
    },
    filtersContent: {
        paddingRight: theme.spacing[6],
        gap: theme.spacing[3],
    },
    filterButton: {
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[2],
        borderRadius: theme.radii.full,
        backgroundColor: theme.colors.card,
    },
    filterButtonText: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.semibold,
    },
    bulkActions: {
        marginHorizontal: theme.spacing[6],
        marginBottom: theme.spacing[4],
    },
    bulkActionsContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    bulkActionsText: {
        fontSize: theme.fontSizes.md,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.text,
    },
    bulkActionsButtons: {
        flexDirection: 'row',
        gap: theme.spacing[3],
    },
    connectionsList: {
        paddingHorizontal: theme.spacing[4],
        gap: theme.spacing[3],
        paddingBottom: 120,
    },
    connectionCard: {
        marginBottom: 0,
    },
    connectionContent: {
        gap: theme.spacing[3],
        padding: theme.spacing[1],
    },
    connectionStatus: {
        alignItems: 'flex-end',
    },
    connectionStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: theme.spacing[3],
        marginTop: theme.spacing[2],
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    statItem: {
        alignItems: 'center',
        gap: theme.spacing[1],
        flex: 1,
    },
    statLabel: {
        fontSize: theme.fontSizes.xs,
        color: theme.colors.textSecondary,
    },
    statValue: {
        fontSize: theme.fontSizes.sm,
        fontWeight: theme.fontWeights.semibold,
        color: theme.colors.text,
    },
    connectionActions: {
        flexDirection: 'row',
        gap: theme.spacing[2],
        justifyContent: 'flex-end',
        marginTop: theme.spacing[3],
        paddingTop: theme.spacing[2],
    },
    swipeContainer: {
        position: 'relative',
        marginBottom: theme.spacing[4],
    },
    swipeAction: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    leftAction: {
        left: 0,
        backgroundColor: theme.colors.success,
        borderTopLeftRadius: theme.radii.lg,
        borderBottomLeftRadius: theme.radii.lg,
    },
    rightAction: {
        right: 0,
        backgroundColor: theme.colors.error,
        borderTopRightRadius: theme.radii.lg,
        borderBottomRightRadius: theme.radii.lg,
    },
    swipeActionText: {
        fontSize: theme.fontSizes.xs,
        fontWeight: theme.fontWeights.semibold,
        marginTop: theme.spacing[1],
    },
    skeletonCard: {
        marginBottom: theme.spacing[4],
    },
    skeletonContent: {
        gap: theme.spacing[4],
    },
    skeletonHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing[3],
    },
    skeletonAvatar: {
        width: 48,
        height: 48,
        borderRadius: theme.radii.full,
    },
    skeletonInfo: {
        flex: 1,
        gap: theme.spacing[2],
    },
    skeletonLine: {
        height: 12,
        borderRadius: theme.radii.sm,
    },
    skeletonTitle: {
        width: '70%',
    },
    skeletonSubtitle: {
        width: '50%',
    },
    skeletonStatus: {
        width: 60,
        height: 24,
        borderRadius: theme.radii.full,
    },
    skeletonStats: {
        flexDirection: 'row',
        gap: theme.spacing[4],
    },
    skeletonStat: {
        flex: 1,
        height: 40,
        borderRadius: theme.radii.md,
    },
});
