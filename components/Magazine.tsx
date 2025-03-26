import React from 'react';
import { View, RefreshControl, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { Text } from './ui/text';
import { PostCard } from './magazine/PostCard';
import { API_BASE_URL } from '~/lib/constants';
import { LoadingScreen } from './ui/LoadingScreen';
import type { Post, PaginationData, MagazineResponse } from './magazine/types';
import { preloadedData } from '~/app/index';

interface MagazineProps {
  refreshTrigger?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function Magazine({ refreshTrigger = 0 }: MagazineProps) {
  const { isDarkColorScheme } = useColorScheme();
  const [feedData, setFeedData] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [pagination, setPagination] = React.useState<PaginationData | null>(null);

  const fetchFeed = React.useCallback(async (page = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/magazine?page=${page}`);
      const data: MagazineResponse = await response.json();
      if (data.success) {
        if (page === 1) {
          setFeedData(data.data);
        } else {
          setFeedData(prev => [...prev, ...data.data]);
        }
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    }
  }, []);

  const handleLoadMore = React.useCallback(async () => {
    if (!pagination?.hasNextPage || isLoadingMore) return;

    setIsLoadingMore(true);
    await fetchFeed(pagination.nextPage);
    setIsLoadingMore(false);
  }, [fetchFeed, pagination, isLoadingMore]);

  const handleRefresh = React.useCallback(async () => {
    setIsRefreshing(true);
    await fetchFeed(1);
    setIsRefreshing(false);
  }, [fetchFeed]);

  const renderItem = React.useCallback(({ item }: { item: Post }) => (
    <View style={{ width: SCREEN_WIDTH }}>
      <FlatList
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        data={[item]}
        renderItem={({ item }) => <PostCard post={item} />}
        keyExtractor={(item) => item.permlink}
      />
    </View>
  ), []);

  const keyExtractor = React.useCallback((item: Post) => item.permlink, []);

  const ItemSeparatorComponent = React.useCallback(() => null, []);

  React.useEffect(() => {
    const loadMagazine = async () => {
      if (preloadedData.magazine && preloadedData.magazine.length > 0) {
        console.info('Using preloaded magazine data:', preloadedData.magazine.length);
        setFeedData(preloadedData.magazine);
        setPagination({
          currentPage: 1,
          hasNextPage: true,
          hasPrevPage: false,
          limit: preloadedData.magazine.length,
          nextPage: 2,
          prevPage: null,
          total: 0,
          totalPages: 0
        });
        // Only clear preloaded data after we're sure it's been used
        setTimeout(() => {
          preloadedData.magazine = null;
        }, 100);
      } else {
        setIsLoading(true);
        console.info('No preloaded data, fetching magazine');
        try {
          const response = await fetch(`${API_BASE_URL}/magazine?page=1`);
          const data: MagazineResponse = await response.json();
          if (data.success) {
            setFeedData(data.data);
            setPagination(data.pagination);
            // Don't store in preloadedData here since we're already viewing
          }
        } catch (error) {
          console.error('Error fetching magazine:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMagazine();
  }, [refreshTrigger]);

  // Theme colors
  const foregroundColor = isDarkColorScheme ? '#ffffff' : '#000000';
  const backgroundColor = isDarkColorScheme ? '#1a1a1a' : '#ffffff';

  // Prepare the loading view component
  const loadingView = (
    <View className="w-full items-center justify-center p-4 bg-background">
      <ActivityIndicator size="large" color={foregroundColor} />
      <Text className="text-foreground mt-2">Gearing Up!!!</Text>
    </View>
  );

  // Prepare the content view component
  const contentView = (
    <View className="flex-1">
      {/* Fixed header */}
      <Text className="text-2xl font-bold px-4 py-2">
        Magazine
      </Text>

      {/* Horizontal scrolling content */}
      <FlatList
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={feedData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={foregroundColor}
            colors={[foregroundColor]}
            progressBackgroundColor={backgroundColor}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={{ width: SCREEN_WIDTH }}>
              <LoadingScreen />
            </View>
          ) : null
        }
        removeClippedSubviews={true}
        initialNumToRender={2}
        maxToRenderPerBatch={1}
        windowSize={3}
        updateCellsBatchingPeriod={50}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="start"
      />
    </View>
  );

  // Return the appropriate view based on loading state
  return isLoading ? <LoadingScreen /> : contentView;
}