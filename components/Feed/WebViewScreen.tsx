import React from 'react';
import { View, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { Text } from '../ui/text';
import { useColorScheme } from '~/lib/useColorScheme';
import { Alert } from 'react-native';

interface WebViewScreenProps {
  url: string;
  onClose: () => void;
}

export function WebViewScreen({ url, onClose }: WebViewScreenProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { isDarkColorScheme } = useColorScheme();

  const handleError = React.useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    setError(nativeEvent.description || 'Failed to load page');
    Alert.alert(
      'Error Loading Page',
      'Would you like to try again?',
      [
        { text: 'Cancel', onPress: onClose, style: 'cancel' },
        { text: 'Retry', onPress: () => setError(null) }
      ]
    );
  }, [onClose]);

  // Security configuration for WebView
  const webViewConfig = {
    allowsInlineMediaPlayback: true,
    mediaPlaybackRequiresUserAction: true,
    javaScriptEnabled: true,
    domStorageEnabled: true,
    startInLoadingState: true,
    scalesPageToFit: true,
    originWhitelist: ['https://*', 'http://*'],
  };

  return (
    <SafeAreaView className="absolute inset-0 z-50 bg-background flex-1">
      <View className="flex-row items-center justify-between p-4 border-b border-muted">
        <Text className="text-lg font-semibold" numberOfLines={1}>
          {url}
        </Text>
        <TouchableOpacity 
          onPress={onClose} 
          className="p-2 rounded-full bg-muted/20"
          accessibilityLabel="Close web view"
          accessibilityRole="button"
        >
          {/* <X size={20} className="text-foreground" /> */}
          <Text>X</Text>
        </TouchableOpacity>
      </View>
      
      <View className="flex-1 relative">
        {error ? (
          <View className="flex-1 items-center justify-center p-4">
            <Text className="text-base text-destructive text-center mb-4">
              {error}
            </Text>
          </View>
        ) : (
          <WebView
            source={{ uri: url }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onError={handleError}
            {...webViewConfig}
            accessibilityLabel={`Web content from ${url}`}
            accessible={true}
          />
        )}
        
        {isLoading && (
          <View 
            className="absolute inset-0 flex items-center justify-center bg-background/50"
            accessibilityLabel="Loading webpage"
            accessibilityRole="progressbar"
          >
            <ActivityIndicator 
              size="large" 
              color={isDarkColorScheme ? '#ffffff' : '#000000'} 
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
