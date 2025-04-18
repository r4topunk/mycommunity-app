import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import type { LoadingEffect } from './types';

const { width, height } = Dimensions.get('window');
// Increased base font size from 14 to 20
const BASE_FONT_SIZE = 20;
// Random font size variation for more visual interest
const getRandomFontSize = () => BASE_FONT_SIZE + Math.floor(Math.random() * 12) - 6; // Between 14-26

// More spaced out columns for better distribution
const COLUMN_SPACING = 1.8; // Spacing multiplier
const NUM_COLUMNS = Math.floor(width / (BASE_FONT_SIZE * COLUMN_SPACING));

// Start with max drops immediately
const MAX_DROPS = 40;

// Enhanced character set for more authentic Matrix effect
const CHARACTERS = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン";

interface RainDrop {
  x: number;
  y: Animated.Value;
  speed: number;
  length: number;
  chars: string[];
  startDelay: number;
  fontSize: number;
}

interface MatrixRainProps {
  intensity?: number; // Controls drop density
  speed?: number; // Animation speed multiplier
  color?: string; // Override default color
  opacity?: number; // Override default opacity
}

export function MatrixRain({ 
  intensity = 1,
  speed = 1,
  color,
  opacity: customOpacity
}: MatrixRainProps = {}) {
  const { isDarkColorScheme } = useColorScheme();
  const rainDrops = useRef<RainDrop[]>([]);
  const [animationReady, setAnimationReady] = useState(false);
  const maxDrops = Math.floor(MAX_DROPS * intensity);
  
  // Calculate default colors based on theme
  const defaultColor = isDarkColorScheme ? '#00ff00' : '#008000';
  const finalColor = color || defaultColor;
  const finalOpacity = customOpacity !== undefined ? customOpacity : 0.15;

  // Initialize drops with full-screen distribution to simulate already-running animation
  if (rainDrops.current.length === 0) {
    // Ensure drops cover the entire width evenly
    const columnPositions = Array(NUM_COLUMNS).fill(0)
      .map((_, i) => i * (width / NUM_COLUMNS))
      // Add some randomness to column positions for more natural look
      .map(pos => pos + (Math.random() * BASE_FONT_SIZE * 0.5));
    
    // Create drops that are already distributed across the entire screen
    rainDrops.current = Array(maxDrops).fill(0).map((_, i) => {
      const fontSize = getRandomFontSize();
      const dropLength = Math.floor(Math.random() * 20) + 5;
      
      // Distribute drops randomly throughout the entire screen height
      // This simulates that the animation has already been running
      const initialPosition = Math.random() * (height + fontSize * dropLength * 2) - fontSize * dropLength;
      
      return {
        // Assign position from columns, then add randomness for repeated positions
        x: columnPositions[i % columnPositions.length] + (Math.random() * 10 - 5),
        y: new Animated.Value(initialPosition),
        speed: (Math.random() * 2 + 1) * speed,
        length: dropLength,
        chars: Array(dropLength)
          .fill(0)
          .map(() => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]),
        // Almost no delay - start animation immediately
        startDelay: Math.random() * 100, // Very minimal delay
        fontSize: fontSize
      };
    });
  }

  // Periodically refresh characters for a more dynamic look
  useEffect(() => {
    const charRefreshInterval = setInterval(() => {
      rainDrops.current.forEach(drop => {
        // Randomly update some characters in each drop
        for (let i = 0; i < drop.chars.length; i++) {
          if (Math.random() > 0.8) {
            drop.chars[i] = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
          }
        }
      });
    }, 500);

    return () => clearInterval(charRefreshInterval);
  }, []);

  useEffect(() => {
    // Start animations for all drops immediately
    const animations = rainDrops.current.map(drop => {
      const cycleTime = (12000 / drop.speed) / speed;
      
      return Animated.loop(
        Animated.sequence([
          // Minimal initial delay
          Animated.delay(drop.startDelay),
          // Falling animation
          Animated.timing(drop.y, {
            toValue: height + drop.fontSize * drop.length,
            duration: cycleTime,
            useNativeDriver: true,
          }),
          // Reset position
          Animated.timing(drop.y, {
            toValue: -drop.fontSize * drop.length,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      );
    });

    // Start all animations at once
    const animation = Animated.parallel(animations);
    animation.start(() => setAnimationReady(true));

    return () => {
      animation.stop();
    };
  }, [speed, intensity]);

  return (
    <View 
      className="absolute inset-0 overflow-hidden"
      style={{ opacity: finalOpacity }} // No fade-in animation, start with full opacity
    >
      {rainDrops.current.map((drop, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: drop.x,
            transform: [{ translateY: drop.y }],
          }}
        >
          {drop.chars.map((char, j) => (
            <Animated.Text
              key={j}
              style={{
                color: finalColor,
                fontSize: drop.fontSize,
                fontFamily: 'monospace',
                // Enhanced fade effect - first character is brightest
                opacity: j === 0 
                  ? 1 
                  : Math.max(1 - (j / drop.length) * 1.2, 0.1),
                fontWeight: j === 0 ? 'bold' : 'normal',
                // Add slight glow effect to make characters pop more
                textShadowColor: finalColor,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: j === 0 ? 3 : 1,
              }}
            >
              {char}
            </Animated.Text>
          ))}
        </Animated.View>
      ))}
    </View>
  );
}

export const matrixEffect: LoadingEffect = {
  id: 'matrix',
  component: MatrixRain
};