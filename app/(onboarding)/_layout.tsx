import { Ionicons } from '@expo/vector-icons';
import { Tabs, Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '~/lib/useColorScheme';

const TAB_ITEMS = [
  {
    name: 'home',
    title: 'Feed',
    icon: 'home-outline'
  },
  {
    name: 'magazine',
    title: 'Mag',
    icon: 'book-outline'
  },
  {
    name: 'skatefeed',
    title: 'SkateFeed',
    icon: 'bicycle-outline'
  },
  {
    name: 'snapsfeed',
    title: 'Snaps',
    icon: 'image-outline' // Changed to differentiate from camera
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person-outline'
  }
] as const;

export default function TabOnboardLayout() {
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
  return <Ionicons size={24} style={{ marginBottom: -3 }} {...props} />;
}

export function OnboardingLayout() {
  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-background">
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="welcome" />
          <Stack.Screen name="style" />
          <Stack.Screen name="experience" />
          <Stack.Screen name="spots" />
          <Stack.Screen name="media" />
          <Stack.Screen name="complete" />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}