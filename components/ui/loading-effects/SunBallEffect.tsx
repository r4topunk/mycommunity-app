import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';
import { Svg, Circle } from 'react-native-svg';
import { useColorScheme } from '~/lib/useColorScheme';
import type { LoadingEffect } from './types';

const { width, height } = Dimensions.get('window');

export function SunBallEffect() {
  const { isDarkColorScheme } = useColorScheme();
  const translateX = useRef(new Animated.Value(-100)).current;
  const translateY = useRef(new Animated.Value(height * 0.5)).current;

  useEffect(() => {
    const animate = () => {
      translateX.setValue(-100);
      translateY.setValue(height * 0.5);
      
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width + 100,
          duration: 8000, // Faster
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height * 0.2,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]).start(() => {
        animate(); // Loop manually
      });
    };

    animate();
  }, []);

  return (
    <Animated.View
      className="absolute"
      style={{
        transform: [
          { translateX },
          { translateY },
        ],
      }}
    >
      <Svg width={60} height={60}>
        <Circle
          cx={30}
          cy={30}
          r={28}
          fill={isDarkColorScheme ? '#FFC107' : '#FF9800'}
        />
      </Svg>
    </Animated.View>
  );
}

export const sunBallEffect: LoadingEffect = {
  id: 'sunball',
  component: SunBallEffect,
};
