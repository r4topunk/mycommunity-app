import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import type { LoadingEffect } from './types';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width, height } = Dimensions.get('window');
// const CHARACTERS = '01';
// const FONT_SIZE = 14;
// const NUM_COLUMNS = Math.floor(width / FONT_SIZE);
// const INITIAL_DROPS = 10; // Start with fewer drops
// const MAX_DROPS = 25;

interface RainDrop {
  x: number;
  y: Animated.Value;
  speed: number;
  length: number;
  chars: string[];
}

export function VideoBackgorundEffect() {
  const { isDarkColorScheme } = useColorScheme();
  const player = useVideoPlayer(
      require("~/assets/videos/background.mp4"),
      (player) => {
        player.loop = true;
        player.play();
      }
    );
  
    return (
      <View className="absolute inset-0">
        <VideoView
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          player={player}
        />
        <View className="absolute inset-0 bg-black/20" />
      </View>
    );
}

export const videobgEffect: LoadingEffect = {
  id: 'videobg',
  component: VideoBackgorundEffect
};