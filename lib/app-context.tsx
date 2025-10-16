import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'host' | 'connector' | null;
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface Connection {
  id: string;
  name: string;
  deviceType: string;
  status: ConnectionStatus;
  bandwidth?: number;
  latency?: number;
  dataUsed?: number;
  connectedAt?: Date;
}

interface AppState {
  userRole: UserRole;
  connections: Connection[];
  currentConnection?: Connection;
  hostId?: string;
  deviceName?: string;
  isSharing: boolean;
  isCameraOpen: boolean;
}

interface AppContextType {
  state: AppState;
  setUserRole: (role: UserRole) => void;
  addConnection: (connection: Connection) => void;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  removeConnection: (id: string) => void;
  setCurrentConnection: (connection?: Connection) => void;
  toggleSharing: () => void;
  generateHostId: () => string;
  openCamera: () => void;
  closeCamera: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_ROLE: '@airlink_user_role',
  HOST_ID: '@airlink_host_id',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    userRole: 'host', // Default to host role to skip onboarding
    connections: [],
    currentConnection: undefined,
    hostId: undefined,
    deviceName: 'My Device',
    isSharing: false,
    isCameraOpen: false,
  });

  // Load persisted data on app start
  useEffect(() => {
    loadPersistedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPersistedData = async () => {
    try {
      const [userRole, hostId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE),
        AsyncStorage.getItem(STORAGE_KEYS.HOST_ID),
      ]);

      setState(prev => ({
        ...prev,
        userRole: (userRole as UserRole) || null,
        hostId: hostId || undefined,
      }));
    } catch (error) {
      console.error('Failed to load persisted data:', error);
    }
  };

  const setUserRole = async (role: UserRole) => {
    try {
      setState(prev => ({ ...prev, userRole: role }));
      if (role) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
        
        // Generate host ID if user is a host
        if (role === 'host' && !state.hostId) {
          const newHostId = generateHostId();
          setState(prev => ({ ...prev, hostId: newHostId }));
          await AsyncStorage.setItem(STORAGE_KEYS.HOST_ID, newHostId);
        }
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_ROLE);
      }
    } catch (error) {
      console.error('Failed to save user role:', error);
    }
  };


  const addConnection = (connection: Connection) => {
    setState(prev => ({
      ...prev,
      connections: [...prev.connections, connection],
    }));
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.map(conn =>
        conn.id === id ? { ...conn, ...updates } : conn
      ),
      currentConnection: prev.currentConnection?.id === id
        ? { ...prev.currentConnection, ...updates }
        : prev.currentConnection,
    }));
  };

  const removeConnection = (id: string) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.filter(conn => conn.id !== id),
      currentConnection: prev.currentConnection?.id === id
        ? undefined
        : prev.currentConnection,
    }));
  };

  const setCurrentConnection = (connection?: Connection) => {
    setState(prev => ({ ...prev, currentConnection: connection }));
  };

  const toggleSharing = () => {
    setState(prev => ({ ...prev, isSharing: !prev.isSharing }));
  };

  const openCamera = () => {
    setState(prev => ({ ...prev, isCameraOpen: true }));
  };

  const closeCamera = () => {
    setState(prev => ({ ...prev, isCameraOpen: false }));
  };

  const generateHostId = (): string => {
    // Generate a human-readable host ID
    const adjectives = ['Swift', 'Secure', 'Fast', 'Reliable', 'Strong', 'Quick'];
    const nouns = ['Link', 'Bridge', 'Hub', 'Node', 'Gate', 'Port'];
    const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${adjective}${noun}${numbers}`;
  };

  const contextValue: AppContextType = {
    state,
    setUserRole,
    addConnection,
    updateConnection,
    removeConnection,
    setCurrentConnection,
    toggleSharing,
    generateHostId,
    openCamera,
    closeCamera,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Mock data for development
export const mockConnections: Connection[] = [
  {
    id: '1',
    name: 'John\'s iPhone',
    deviceType: 'mobile',
    status: 'connected',
    bandwidth: 2.5,
    latency: 45,
    dataUsed: 156,
    connectedAt: new Date(Date.now() - 1800000), // 30 minutes ago
  },
  {
    id: '2',
    name: 'Sarah\'s MacBook',
    deviceType: 'laptop',
    status: 'connecting',
  },
  {
    id: '3',
    name: 'Mike\'s Android',
    deviceType: 'mobile',
    status: 'connected',
    bandwidth: 1.8,
    latency: 62,
    dataUsed: 89,
    connectedAt: new Date(Date.now() - 900000), // 15 minutes ago
  },
];
