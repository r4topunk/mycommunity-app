import { useFocusEffect } from '@react-navigation/native';
import { View } from 'react-native';
import { Feed } from '~/components/Feed';
import React from 'react';

export default function IndexPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  useFocusEffect(
    React.useCallback(() => {
      // Increment the refresh key when the tab is focused
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  return (
    <View className="flex-1 p-4 bg-background">
      <Feed refreshTrigger={refreshKey} />
    </View>
  );
}
