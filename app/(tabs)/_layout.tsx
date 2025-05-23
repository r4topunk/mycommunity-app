import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '~/lib/useColorScheme';

const TAB_ITEMS = [
  {
    name: 'feed',
    title: 'Feed',
    icon: 'home-outline'
  },
  {
    name: 'leaderboard',
    title: 'Leaderboard',
    icon: 'podium-outline'
  },
  {
    name: 'create',
    title: 'Create',
    icon: 'add-circle-outline'
  },
  {
    name: 'rewards',
    title: 'Rewards',
    icon: 'trophy-outline'
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person-outline'
  }
] as const;

export default function TabLayout() {
  const { isDarkColorScheme } = useColorScheme();
  
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-background">
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: isDarkColorScheme ? '#1a1a1a' : '#ffffff',
              },
              tabBarActiveTintColor: isDarkColorScheme ? '#ffffff' : '#000000',
              tabBarShowLabel: false,
            }}
          >
            {TAB_ITEMS.map((tab) => (
              <Tabs.Screen
                key={tab.name}
                name={tab.name}
                options={{
                  title: tab.title,
                  tabBarIcon: ({ color }) => (
                    <TabBarIcon name={tab.icon} color={color} />
                  ),
                  ...(tab.name === 'profile' && {
                    href: {
                      pathname: "/(tabs)/profile",
                      params: {}
                    }
                  })
                }}
              />
            ))}
          </Tabs>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

function TabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={24} style={{ marginBottom: -10 }} {...props} />;
}