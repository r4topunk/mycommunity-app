import React, { useState } from 'react';
import { Image, Modal, Pressable, View, Dimensions } from 'react-native';
import { VideoPlayer } from './VideoPlayer';
import type { Media } from '../../lib/types';
import { FontAwesome } from '@expo/vector-icons';

interface MediaPreviewProps {
  media: Media[];
  onMediaPress: (media: Media) => void;
  selectedMedia: Media | null;
  isModalVisible: boolean;
  onCloseModal: () => void;
}

// For calculating image dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const MAX_IMAGE_HEIGHT = screenHeight * 0.75;

export function MediaPreview({
  media,
  onMediaPress,
  selectedMedia,
  isModalVisible,
  onCloseModal,
}: MediaPreviewProps) {
  // console.log('Media Type', media[0].type);
  // Track dimensions for each image to maintain proper aspect ratio
  const [imageDimensions, setImageDimensions] = useState<Record<number, { width: number, height: number }>>({});
  // Track which videos are playing
  const [playingVideos, setPlayingVideos] = useState<Record<number, boolean>>({});
  // Track which videos have had their initial interaction (play button clicked)
  const [interactedVideos, setInteractedVideos] = useState<Record<number, boolean>>({});

  // Handle initial video play - this will only work for the first interaction
  const handleInitialPlay = (index: number) => {
    // Only handle the press if the video hasn't been interacted with
    if (!interactedVideos[index]) {
      // Start playing the video
      setPlayingVideos(prev => ({
        ...prev,
        [index]: true
      }));

      // Mark this video as interacted with
      setInteractedVideos(prev => ({
        ...prev,
        [index]: true
      }));
    }
  };

  // Determine if a specific video is playing
  const isVideoPlaying = (index: number) => {
    return !!playingVideos[index];
  };

  // Determine if a specific video has been interacted with
  const hasVideoBeenInteracted = (index: number) => {
    return !!interactedVideos[index];
  };

  // Calculate appropriate dimensions when image loads
  const handleImageLoad = (index: number, width: number, height: number) => {
    setImageDimensions(prev => ({
      ...prev,
      [index]: { width, height }
    }));
  };

  // Calculate display width based on number of media items
  const getContainerWidth = (index: number) => {
    const containerWidth = media.length === 1
      ? screenWidth - 16 // Full width (minus padding)
      : (screenWidth - 24) / 2; // Half width (minus padding and gap)

    return containerWidth;
  };

  // Calculate height based on image's aspect ratio with a maximum constraint
  const getImageHeight = (index: number) => {
    const dimensions = imageDimensions[index];
    if (!dimensions) return 200; // Default height until image loads

    const containerWidth = getContainerWidth(index);
    const aspectRatio = dimensions.width / dimensions.height;
    const calculatedHeight = containerWidth / aspectRatio;

    // Apply maximum height constraint (3/4 of screen height)
    return Math.min(calculatedHeight, MAX_IMAGE_HEIGHT);
  };

  return (
    <>
      {/* Preview */}
      <View className="flex-row flex-wrap gap-1 mb-3">
        {media.map((item, index) => (
          <View
            key={index}
            className={`${media.length === 1 ? 'w-full' : 'w-[49%]'} overflow-hidden relative bg-gray-100`}
            style={{ height: item.type === 'video' ? 200 : getImageHeight(index) }}
          >
            {item.type === 'video' ? (
              hasVideoBeenInteracted(index) ? (
                <VideoPlayer url={item.url} playing={isVideoPlaying(index)} />
              ) : (
                <Pressable
                  className="w-full h-full"
                  onPress={() => handleInitialPlay(index)}
                >
                  <VideoPlayer url={item.url} playing={false} />
                  <View className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <FontAwesome name="play-circle" size={50} color="white" />
                  </View>
                </Pressable>
              )
            ) : item.type === 'gif' ? (
              <Image
                source={{ uri: item.url }}
                className="w-full h-full"
                resizeMode="cover"
                onLoad={(e) => {
                  const { width, height } = e.nativeEvent.source;
                  handleImageLoad(index, width, height);
                }}
              />
            ) : (
              <Pressable
                onPress={() => onMediaPress(item)}
                className="w-full h-full"
              >
                <Image
                  source={{ uri: item.url }}
                  className="w-full h-full"
                  resizeMode="cover"
                  onLoad={(e) => {
                    const { width, height } = e.nativeEvent.source;
                    handleImageLoad(index, width, height);
                  }}
                />
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        onRequestClose={onCloseModal}
      >
        <Pressable
          className="flex-1 bg-black/80 justify-center items-center"
          onPress={onCloseModal}
        >
          <View className="w-full h-[80%] justify-center">
            {selectedMedia?.type === 'image' ? (
              <Image
                source={{ uri: selectedMedia.url }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : selectedMedia?.type === 'video' ? (
              <VideoPlayer url={selectedMedia.url} playing={true} />
            ) : null}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}