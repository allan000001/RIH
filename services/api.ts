/**
 * API Service
 *
 * This file contains placeholder functions for all the backend API calls.
 * A backend developer can implement the actual API calls here.
 * The mock data is returned as a promise to simulate network latency.
 */

import { Badge } from '@/features/gamification/badge-system';

// --- Mock Data ---

const mockBadges: Badge[] = [
  {
    id: '1',
    name: 'First Share',
    description: 'Share your internet connection for the first time.',
    icon: 'share',
    rarity: 'common',
    unlockedAt: new Date(),
  },
  {
    id: '2',
    name: 'Power Host',
    description: 'Share your connection for over 24 hours.',
    icon: 'bolt.fill',
    rarity: 'rare',
    progress: 12,
    maxProgress: 24,
  },
  {
    id: '3',
    name: 'Community Helper',
    description: 'Help 5 friends get online.',
    icon: 'person.2.fill',
    rarity: 'epic',
    unlockedAt: new Date(),
  },
  {
    id: '4',
    name: 'Speed Demon',
    description: 'Reach a connection speed of over 50 Mbps.',
    icon: 'gauge.high',
    rarity: 'legendary',
    progress: 45,
    maxProgress: 50,
  },
];

// --- API Functions ---

export const api = {
  getDashboardStats: async () => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
    return {
      totalConnections: 12,
      activeConnections: 3,
      pendingRequests: 2,
      totalDataShared: '45.2 GB',
      currentBandwidth: '12.5 Mbps',
      uptimeHours: 72,
    };
  },

  getBandwidthData: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { timestamp: '12:00', upload: 8.2, download: 15.3 },
      { timestamp: '12:05', upload: 12.1, download: 18.7 },
      { timestamp: '12:10', upload: 15.5, download: 22.1 },
      { timestamp: '12:15', upload: 9.8, download: 16.4 },
      { timestamp: '12:20', upload: 18.2, download: 25.8 },
    ];
  },

  getRecentActivity: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { time: '2 min ago', action: 'Device connected', device: 'iPhone 14 Pro', type: 'connect' },
      { time: '15 min ago', action: 'Data transfer completed', device: 'MacBook Air', type: 'transfer' },
      { time: '1 hour ago', action: 'Device disconnected', device: 'iPad Pro', type: 'disconnect' },
    ];
  },

  getConnections: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        name: 'Sarah\'s iPhone',
        deviceType: 'iPhone 15 Pro',
        status: 'connected',
        connectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        dataUsed: 1250,
        bandwidth: 15.2,
        location: 'New York, NY',
        avatar: '👩‍💻',
        trustLevel: 'high',
      },
      {
        id: '2',
        name: 'John\'s MacBook',
        deviceType: 'MacBook Pro M3',
        status: 'connected',
        connectedAt: new Date(Date.now() - 45 * 60 * 1000),
        dataUsed: 2100,
        bandwidth: 22.8,
        location: 'San Francisco, CA',
        avatar: '👨‍💼',
        trustLevel: 'high',
      },
      {
        id: '3',
        name: 'Alex\'s Android',
        deviceType: 'Samsung Galaxy S24',
        status: 'pending',
        dataUsed: 0,
        bandwidth: 0,
        location: 'Los Angeles, CA',
        avatar: '🧑‍🎓',
        trustLevel: 'medium',
      },
    ];
  },

  getNotifications: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      {
        id: '1',
        type: 'connection_request',
        title: 'New Connection Request',
        message: 'John\'s iPhone wants to connect to your network',
        timestamp: new Date(Date.now() - 300000),
        read: false,
        actionable: true,
        priority: 'high',
      },
      {
        id: '2',
        type: 'achievement',
        title: '🎉 Achievement Unlocked!',
        message: 'Data Sharer - You\'ve shared 10GB of data this month',
        timestamp: new Date(Date.now() - 600000),
        read: false,
        priority: 'medium',
        reward: {
          type: 'badge',
          value: 'Data Sharer',
        },
      },
    ];
  },

  getBadges: async (): Promise<Badge[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBadges;
  },
};
