import React, { useCallback, useState, useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { Image, Pressable, View, Linking } from 'react-native';
import { router } from 'expo-router';
import { API_BASE_URL } from '~/lib/constants';
import { Text } from '../ui/text';
import { MediaPreview } from './MediaPreview';
import { Toast } from '../ui/toast';
import { LinkPreview } from './LinkPreview';
import type { Media, Post } from '../../lib/types';
import { extractMediaFromBody, validateUrl, isKnownDomain } from '~/lib/utils';

interface PostCardProps {
  post: Post;
  currentUsername?: string;
  onUrlPress?: (url: string) => void;
}

export function PostCard({ post, currentUsername, onUrlPress }: PostCardProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [voteCount, setVoteCount] = useState(post.votes.filter(vote => vote.weight > 0).length);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Check if user has already voted on this post
  useEffect(() => {
    if (currentUsername && post.votes) {
      const hasVoted = post.votes.some(vote => vote.voter === currentUsername && vote.weight > 0);
      setIsLiked(hasVoted);
    }
  }, [post.votes, currentUsername]);

  // Check for URLs in post content to create link previews
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = post.body.match(urlRegex);
    
    if (urls && urls.length > 0) {
      const firstUrl = urls[0];
      const { isUrl, sanitizedUrl } = validateUrl(firstUrl);
      
      if (isUrl && isKnownDomain(sanitizedUrl)) {
        setPreviewUrl(sanitizedUrl);
      }
    }
  }, [post.body]);

  const handleMediaPress = useCallback((media: Media) => {
    setSelectedMedia(media);
    setIsModalVisible(true);
  }, []);

  const handleVote = async () => {
    try {
      setIsVoting(true);
      setVoteError(null);

      if (!currentUsername) {
        setVoteError('Please login first');
        return;
      }

      if (currentUsername === "SPECTATOR") {
        setVoteError('Please login first');
        return;
      }

      const password = await SecureStore.getItemAsync(currentUsername);
      if (!password) {
        setVoteError('Invalid credentials');
        return;
      }

      // Trigger haptic feedback before the vote
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistically update the UI
      const previousLikedState = isLiked;
      setIsLiked(!isLiked);
      setVoteCount(prevCount => previousLikedState ? prevCount - 1 : prevCount + 1);

      const response = await fetch(`${API_BASE_URL}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voter: currentUsername,
          author: post.author,
          permlink: post.permlink,
          posting_key: password,
          weight: previousLikedState ? 0 : 10000 // Use previous state to determine weight
        })
      });

      if (!response.ok) {
        const error = await response.text();
        // Revert the optimistic update if the request failed
        setIsLiked(previousLikedState);
        setVoteCount(prevCount => previousLikedState ? prevCount + 1 : prevCount - 1);
        throw new Error(error);
      }
    } catch (error) {
      console.error('Vote error:', error);
      setVoteError(error instanceof Error ? error.message : 'Failed to vote');
    } finally {
      setIsVoting(false);
    }
  };

  const calculateTotalValue = (post: Post) => {
    const pending = parseFloat(post.pending_payout_value);
    const total = parseFloat(post.total_payout_value);
    const curator = parseFloat(post.curator_payout_value);
    return (pending + total + curator).toFixed(3);
  };

  const media = extractMediaFromBody(post.body);
  const postContent = post.body.replace(/<iframe.*?<\/iframe>|!\[.*?\]\(.*?\)/g, '').trim();

  const renderText = () => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = postContent.split(urlRegex);

    return (
      <Text className="text-foreground">
        {parts.map((part, index) => {
          if (part.match(urlRegex) && onUrlPress) {
            return (
              <Text
                key={index}
                className="text-primary underline"
                onPress={() => onUrlPress(part)}
              >
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  const handleProfilePress = () => {
    router.push({
      pathname: "/(tabs)/profile",
      params: { username: post.author }
    });
  };

  return (
    <>
      <View className="w-full mb-4">
        <Pressable onPress={handleProfilePress} className="flex-row items-center justify-between mb-3 px-2">
          <View className="flex-row items-center">
            <View className="h-12 w-12 mr-3 rounded-full overflow-hidden">
              <Image
                source={{ uri: `https://images.ecency.com/webp/u/${post.author}/avatar/small` }}
                className="w-full h-full border border-muted rounded-full"
                alt={`${post.author}'s avatar`}
              />
            </View>
            <View>
              <Text className="font-bold text-lg">@{post.author}</Text>
            </View>
          </View>
          <Text className="text-gray-500">
            {formatDistanceToNow(new Date(post.created), { addSuffix: true })}
          </Text>
        </Pressable>

        {postContent !== '' && (
          <Text className="px-2 mb-2">{renderText()}</Text>
        )}

        {/* Display LinkPreview if URL is detected in the post */}
        {previewUrl && onUrlPress && (
          <View className="px-2 mb-2">
            <LinkPreview
              url={previewUrl}
              onPress={() => onUrlPress(previewUrl)}
            />
          </View>
        )}

        {media.length > 0 && (
          <MediaPreview
            media={media}
            onMediaPress={handleMediaPress}
            selectedMedia={selectedMedia}
            isModalVisible={isModalVisible}
            onCloseModal={() => setIsModalVisible(false)}
          />
        )}

        <View className="flex-row justify-between items-center mx-2">
          <Text className={`font-bold text-xl ${parseFloat(calculateTotalValue(post)) > 0 ? 'text-green-500' : 'text-gray-500'}`}>
            ${calculateTotalValue(post)}
          </Text>
          <View>
            <Pressable
              onPress={handleVote}
              className="flex-row items-center gap-1"
              disabled={isVoting}
            >
              <Text className={`text-xl font-bold ${isLiked ? 'text-green-500' : 'text-gray-600'}`}>
                {voteCount}
              </Text>
              <FontAwesome
                name={"arrow-up"}
                size={20}
                color={isLiked ? "#32CD32" : "#666666"}
                style={{ marginRight: 4 }}
              />
            </Pressable>
          </View>
        </View>
      </View>
      {voteError && (
        <Toast
          message={voteError}
          type={'error'}
          onHide={() => setVoteError(null)}
        />
      )}
    </>
  );
}