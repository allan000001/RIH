import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface ConfettiEffectProps {
  active: boolean;
  onComplete?: () => void;
  colors?: string[];
  particleCount?: number;
  duration?: number;
}

const ConfettiParticle: React.FC<{
  piece: ConfettiPiece;
  active: boolean;
  duration: number;
  onComplete?: () => void;
}> = ({ piece, active, duration, onComplete }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0);

  useEffect(() => {
    if (active) {
      // Initial burst
      scale.value = withSequence(
        withTiming(piece.scale, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(piece.scale * 0.8, { duration: duration - 200 })
      );
      
      opacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(duration - 800, withTiming(0, { duration: 600 }))
      );

      // Falling animation
      translateY.value = withTiming(
        height + 100,
        { 
          duration: duration,
          easing: Easing.out(Easing.quad)
        },
        (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        }
      );

      // Horizontal drift
      translateX.value = withTiming(
        piece.x + (Math.random() - 0.5) * 200,
        { 
          duration: duration,
          easing: Easing.inOut(Easing.quad)
        }
      );

      // Rotation
      rotation.value = withRepeat(
        withTiming(360, { 
          duration: 1000,
          easing: Easing.linear
        }),
        -1,
        false
      );
    } else {
      // Reset values
      translateY.value = -50;
      translateX.value = 0;
      rotation.value = 0;
      opacity.value = 0;
      scale.value = 0;
    }
  }, [active, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.confettiPiece,
        {
          backgroundColor: piece.color,
          left: piece.x,
          top: piece.y,
        },
        animatedStyle,
      ]}
    />
  );
};

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  active,
  onComplete,
  colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
  particleCount = 50,
  duration = 3000,
}) => {
  const [pieces, setPieces] = React.useState<ConfettiPiece[]>([]);
  const [completedCount, setCompletedCount] = React.useState(0);

  useEffect(() => {
    if (active) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < particleCount; i++) {
        newPieces.push({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          x: Math.random() * width,
          y: -50 - Math.random() * 100,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.8,
        });
      }
      setPieces(newPieces);
      setCompletedCount(0);
    }
  }, [active, colors, particleCount]);

  const handleParticleComplete = () => {
    setCompletedCount(prev => {
      const newCount = prev + 1;
      if (newCount >= particleCount && onComplete) {
        onComplete();
      }
      return newCount;
    });
  };

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiParticle
          key={piece.id}
          piece={piece}
          active={active}
          duration={duration}
          onComplete={handleParticleComplete}
        />
      ))}
    </View>
  );
};

// Burst effect for achievements
export const GlowBurst: React.FC<{
  active: boolean;
  color?: string;
  size?: number;
}> = ({ active, color = '#FFD700', size = 200 }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withTiming(1.5, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(2, { duration: 300 })
      );
      
      opacity.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(0.4, { duration: 400 }),
        withTiming(0, { duration: 300 })
      );
    } else {
      scale.value = 0;
      opacity.value = 0;
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!active) return null;

  return (
    <View style={styles.burstContainer} pointerEvents="none">
      <Animated.View
        style={[
          styles.burstEffect,
          {
            backgroundColor: color,
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  burstContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  burstEffect: {
    position: 'absolute',
  },
});
