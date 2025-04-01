import React from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Text } from '../ui/text';
import type { UrlPreview } from '~/lib/types';
import { useColorScheme } from '~/lib/useColorScheme';

interface PreviewMapType {
  [key: string]: {
    title: string;
    description: string;
    imageUrl?: string;
    siteName: string;
  }
}

interface LinkPreviewProps {
  url: string;
  onPress: () => void;
}

export function LinkPreview({ url, onPress }: LinkPreviewProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { isDarkColorScheme } = useColorScheme();
  
  const previewMap: PreviewMapType = React.useMemo(() => ({
    'skatehive.app': {
      title: 'SkateHive',
      description: 'A community-owned web3 skateboarding app built on Hive blockchain',
      imageUrl: 'https://www.skatehive.app/icon-512.png',
      siteName: 'SkateHive'
    }
  }), []);

  const domain = React.useMemo(() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }, [url]);

  const preview = React.useMemo(() => 
    domain in previewMap ? previewMap[domain] : {
      title: domain,
      description: 'Open this link in browser',
      siteName: domain
    }
  , [domain, previewMap]);

  React.useEffect(() => {
    setIsLoading(false);
  }, [url]);

  const getDomain = React.useCallback((url: string): string => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }, []);

  const [imageLoading, setImageLoading] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 3;

  const handleRetry = React.useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setImageError(false);
      setIsLoading(true);
    } else {
      setError('Failed to load preview after multiple attempts');
    }
  }, [retryCount]);

  if (error) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        className="rounded-lg bg-card/50 p-3 border border-muted/30"
      >
        <Text className="text-sm text-muted-foreground">
          {error}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      className="rounded-xl border border-muted/30 overflow-hidden bg-card"
      accessibilityRole="link"
      accessibilityLabel={`Open ${preview.title} website`}
      accessibilityHint="Opens in an in-app browser"
    >
      <View className="flex-row">
        {preview.imageUrl && !imageError ? (
          <View className="w-20 h-20 items-center justify-center bg-muted/10">
            {imageLoading && (
              <ActivityIndicator 
                size="small" 
                color={isDarkColorScheme ? '#ffffff' : '#000000'}
              />
            )}
            <Image 
              source={{ uri: preview.imageUrl }} 
              className="w-16 h-16 rounded-lg"
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </View>
        ) : null}
        
        <View className="flex-1 p-3">
          <View className="flex-row items-center">
            <Text className="text-sm text-muted-foreground" numberOfLines={1}>
              {getDomain(url)}
            </Text>
          </View>
          
          <Text className="text-base font-semibold" numberOfLines={1}>
            {preview.title}
          </Text>
          
          <Text className="text-sm text-muted-foreground" numberOfLines={2}>
            {preview.description}
          </Text>
        </View>
      </View>

      {error && retryCount < maxRetries && (
        <TouchableOpacity 
          onPress={handleRetry}
          className="p-2 bg-muted/10"
        >
          <Text className="text-sm text-primary text-center">
            Tap to retry loading preview
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
