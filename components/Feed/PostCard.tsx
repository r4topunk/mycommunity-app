import React, { useCallback, useState, useEffect } from 'react';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import { Image, Pressable, View, Linking, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { API_BASE_URL } from '~/lib/constants';
import { Text } from '../ui/text';
import { MediaPreview } from './MediaPreview';
import { useToast } from '~/lib/toast-provider';
import type { Media, Post } from '../../lib/types';
import { extractMediaFromBody } from '~/lib/utils';
import { FollowButton } from '../Follow/FollowButton';
// import { MiniFollowButton } from '../Follow/MiniFollowButton';
import { useComments } from '~/lib/hooks/useComments';
import { CommentsScreen } from './Comments';

interface PostCardProps {
  post: Post;
  currentUsername: string | null;
}

export function PostCard({ post, currentUsername }: PostCardProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isVoted, setIsVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(post.votes.filter(vote => vote.weight > 0).length);
  const { showToast } = useToast();

  const [showComments, setShowComments] = useState(false);
  // const { comments, loading: loadingComments } = useComments(post.author, post.permlink);
  const { comments, refetch } = useComments(post.author, post.permlink);

  // Check if user has already voted on this post
  useEffect(() => {
    if (currentUsername && post.votes) {
      const hasVoted = post.votes.some(vote => vote.voter === currentUsername && vote.weight > 0);
      setIsVoted(hasVoted);
    }
  }, [post.votes, currentUsername]);

  const handleMediaPress = useCallback((media: Media) => {
    setSelectedMedia(media);
    setIsModalVisible(true);
  }, []);

  const handleVote = async () => {
    try {
      setIsVoting(true);

      if (!currentUsername) {
        showToast('Please login first', 'error');
        return;
      }

      if (currentUsername === "SPECTATOR") {
        showToast('Please login first', 'error');
        return;
      }

      const password = await SecureStore.getItemAsync(currentUsername);
      if (!password) {
        showToast('Invalid credentials', 'error');
        return;
      }

      // Trigger haptic feedback before the vote
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Optimistically update the UI
      const previousLikedState = isVoted;
      setIsVoted(!isVoted);
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
        setIsVoted(previousLikedState);
        setVoteCount(prevCount => previousLikedState ? prevCount + 1 : prevCount - 1);
        throw new Error(error);
      }
    } catch (error) {
      // console.error('Vote error:', error);

      let errorMessage = 'Failed to vote';
      if (error instanceof Error) {
        try {
          // Parse the JSON string from error.message
          const errorData = JSON.parse(error.message);
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          // If parsing fails, use the original error message
          errorMessage = error.message;
        }
      }

      showToast(errorMessage, 'error');
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

  const navigateToProfile = (username: string) => {
    router.push({
      pathname: "/(tabs)/profile",
      params: { username }
    });
  };

  const media = extractMediaFromBody(post.body);
  const postContent = post.body.replace(/<iframe.*?<\/iframe>|!\[.*?\]\(.*?\)/g, '').trim();

  // Process post content to handle @username mentions and URLs
  const renderPostContent = () => {
    if (!postContent) return null;

    // First, split by URLs
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    // Then process @username mentions in each non-URL part
    const mentionRegex = /(@[a-zA-Z0-9.-]+)/g;

    return postContent.split(linkRegex).map((part, index) => {
      // If this part is a URL, make it a clickable link
      if (linkRegex.test(part)) {
        return (
          <Text
            key={`link-${index}`}
            className="text-green-600 underline"
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      }

      // If not a URL, process for @username mentions
      const segments = part.split(mentionRegex);
      if (segments.length === 1) {
        // No mentions in this part
        return <Text key={`text-${index}`} className="text-lg">{part}</Text>;
      }

      // Process parts with mentions
      return (
        <Text key={`text-${index}`} className="text-lg">
          {segments.map((segment, segmentIndex) => {
            // Check if this segment is a mention
            if (mentionRegex.test(segment)) {
              const username = segment.substring(1); // Remove @ symbol
              return (
                <Text
                  key={`mention-${segmentIndex}`}
                  className="text-green-600 font-bold"
                  onPress={() => navigateToProfile(username)}
                >
                  {segment}
                </Text>
              );
            }
            // Regular text segment
            return <Text key={`segment-${segmentIndex}`}>{segment}</Text>;
          })}
        </Text>
      );
    });
  };

  const handleProfilePress = () => {
    router.push({
      pathname: "/(tabs)/profile",
      params: { username: post.author }
    });
  };

  return (
    <View className="w-full mb-4 min-h-[200px]">
      <Pressable onPress={handleProfilePress} className="flex-row items-center justify-between mb-3 px-2">
        <View className="flex-row items-center">
          <View className="h-12 w-12 mr-3 rounded-full overflow-hidden">
            <Image
              source={{ uri: `https://images.ecency.com/webp/u/${post.author}/avatar/small` }}
              className="w-full h-full border border-muted rounded-full"
              alt={`${post.author}'s avatar`}
            />
            <FollowButton
              currentUsername={currentUsername}
              profileUsername={post.author}
            // type="mini"
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
        <View className="px-2 mb-2">
          {renderPostContent()}
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

      <View className="flex-1 justify-end">
        <View className="flex-row justify-between items-center mx-2">
          <Text className={`font-bold text-xl ${parseFloat(calculateTotalValue(post)) > 0 ? 'text-green-500' : 'text-gray-500'}`}>
            ${calculateTotalValue(post)}
          </Text>
          <View className="flex-row items-center space-x-4">
            {/* Comment Icon */}
            <Pressable onPress={() => setShowComments(!showComments)} className="flex-row items-center gap-1 mr-8">
              <FontAwesome5 name="comment" size={20} color="#666" />
              <Text className="text-gray-600 text-base">{comments.length}</Text>
            </Pressable>
            <Pressable
              onPress={handleVote}
              className={`flex-row items-center gap-1 ${isVoting ? 'opacity-70' : ''}`}
              disabled={isVoting}
            >
              {isVoting ? (
                <ActivityIndicator
                  size="small"
                  color={isVoted ? "#32CD32" : "#666666"}
                  style={{ marginRight: 4, marginLeft: 4 }}
                />
              ) : (
                <>
                  <Text className={`text-xl font-bold ${isVoted ? 'text-green-500' : 'text-gray-600'}`}>
                    {voteCount}
                  </Text>
                  <FontAwesome
                    name={"arrow-up"}
                    size={20}
                    color={isVoted ? "#32CD32" : "#666666"}
                    style={{ marginRight: 4 }}
                  />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {showComments && (
        <CommentsScreen
          postAuthor={post.author}
          postPermlink={post.permlink}
          comments={comments}
          onClose={() => setShowComments(false)}
          onRefreshComments={refetch}
        />
      )}

    </View>
  );
}