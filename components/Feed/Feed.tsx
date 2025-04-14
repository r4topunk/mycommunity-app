import React from 'react';
import { View, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { Text } from '../ui/text';
import { PostCard } from './PostCard';
import type { Post } from '~/lib/types';
import { LoadingScreen } from '../ui/LoadingScreen';
import { useColorScheme } from '~/lib/useColorScheme';
import { useAuth } from '~/lib/auth-provider';
import { useFeed, useTrending, useFollowing } from '~/lib/hooks/useQueries';
import { Clock } from '~/lib/icons/Clock';
import { TrendingUp } from '~/lib/icons/TrendingUp';
import { Sun } from '~/lib/icons/Sun';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSequence,
  useSharedValue
} from 'react-native-reanimated';

type FeedMode = 'latest' | 'trending' | 'following';

interface FeedProps {
  refreshTrigger?: number;
}

export function Feed({ refreshTrigger = 0 }: FeedProps) {
  const [feedMode, setFeedMode] = React.useState<FeedMode>('latest');
  const { isDarkColorScheme } = useColorScheme();
  const { username } = useAuth();

  // Animation progress values
  const scale = useSharedValue(1);
  const textOpacity = useSharedValue(1);
  const textTranslateY = useSharedValue(0);

  // Fetch all feed data sources
  const {
    data: latestData,
    isLoading: isLatestLoading,
    refetch: refetchLatest,
    isRefetching: isLatestRefetching
  } = useFeed();

  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    refetch: refetchTrending,
    isRefetching: isTrendingRefetching
  } = useTrending();

  const {
    data: followingData,
    isLoading: isFollowingLoading,
    refetch: refetchFollowing,
    isRefetching: isFollowingRefetching
  } = useFollowing(username || "SPECTATOR");

  // Determine which data to show based on the current mode
  const feedData =
    feedMode === 'latest' ? latestData :
      feedMode === 'trending' ? trendingData :
        followingData;

  const isLoading =
    feedMode === 'latest' ? isLatestLoading :
      feedMode === 'trending' ? isTrendingLoading :
        isFollowingLoading;

  const refetch =
    feedMode === 'latest' ? refetchLatest :
      feedMode === 'trending' ? refetchTrending :
        refetchFollowing;

  const isRefetching =
    feedMode === 'latest' ? isLatestRefetching :
      feedMode === 'trending' ? isTrendingRefetching :
        isFollowingRefetching;

  // Handle text animation and feed mode switching
  const handleToggle = React.useCallback(() => {
    // Animate button scale
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );

    // Animate text fade out
    textOpacity.value = withTiming(0, { duration: 150 });
    textTranslateY.value = withTiming(-10, { duration: 150 });

    // Update feed mode after a short delay to allow animation to complete
    setTimeout(() => {
      // Update feed mode state
      setFeedMode(current => {
        if (current === 'latest') return 'trending';
        if (current === 'trending') return 'following';
        return 'latest';
      });

      // Animate text coming back
      textTranslateY.value = 10;
      setTimeout(() => {
        textOpacity.value = withTiming(1, { duration: 250 });
        textTranslateY.value = withTiming(0, { duration: 250 });
      }, 50);
    }, 160);
  }, []);

  const renderItem = React.useCallback(({ item }: { item: Post }) => (
    <PostCard key={item.permlink} post={item} currentUsername={username} />
  ), [username]);

  const keyExtractor = React.useCallback((item: Post) => item.permlink, []);

  // const title =
  //   feedMode === 'latest' ? 'Latest' :
  //     feedMode === 'trending' ? 'Trending' :
  //       'Following';

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }]
  }));

  const ListHeaderComponent = React.useCallback(() => (
    <View className="flex-row items-center justify-between mb-4 px-3">
      <Animated.View style={textAnimatedStyle}>
        <Text className="text-xl font-bold" style={{ textTransform: 'capitalize' }}>
          {feedMode}
        </Text>
      </Animated.View>
      <Animated.View
        className="rounded-full bg-card border border-muted/70"
        style={buttonAnimatedStyle}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggle}
          className="h-10 w-10 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={`Switch to ${feedMode === 'latest' ? 'trending' :
            feedMode === 'trending' ? 'following' :
              'latest'
            } posts`}
        >
          {feedMode === 'latest' ? (
            <Clock size={24} className="text-primary" />
          ) : feedMode === 'trending' ? (
            <TrendingUp size={24} className="text-primary" />
          ) : (
            <Sun size={24} className="text-primary" />
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  ), [feedMode, isDarkColorScheme, handleToggle, buttonAnimatedStyle, textAnimatedStyle]);

  const ItemSeparatorComponent = React.useCallback(() => (
    <View className="h-0 my-4 border border-muted" />
  ), []);

  // Get theme colors
  const foregroundColor = isDarkColorScheme ? '#ffffff' : '#000000';
  const backgroundColor = isDarkColorScheme ? '#1a1a1a' : '#ffffff';

  const contentView = (
    <View className="flex-1">
      <FlatList
        data={feedData}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ItemSeparatorComponent={ItemSeparatorComponent}
        contentContainerStyle={{ paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={foregroundColor}
            colors={[foregroundColor]}
            progressBackgroundColor={backgroundColor}
          />
        }
        removeClippedSubviews={true}
        initialNumToRender={5}
        maxToRenderPerBatch={3}
        windowSize={7}
        updateCellsBatchingPeriod={50}
      />
    </View>
  );

  return isLoading ? <LoadingScreen /> : contentView;
}
