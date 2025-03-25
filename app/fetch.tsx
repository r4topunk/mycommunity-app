import * as React from 'react';
import { View, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { API_BASE_URL } from '~/lib/constants';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme } from '~/lib/useColorScheme';

export default function FetchScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [feedData, setFeedData] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  const [username, setUsername] = React.useState('');
  const [authData, setAuthData] = React.useState<string>('');
  const [authError, setAuthError] = React.useState<string>('');
  const [isPublicLoading, setIsPublicLoading] = React.useState(false);
  const [isAuthLoading, setIsAuthLoading] = React.useState(false);

  async function fetchFeedData() {
    setErrorMessage('');
    setFeedData('');
    setIsPublicLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/feed`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeedData(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching feed:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while fetching data');
      setFeedData('');
    } finally {
      setIsPublicLoading(false);
    }
  }

  async function fetchAuthenticatedData() {
    setAuthError('');
    setAuthData('');
    setIsAuthLoading(true);
    
    try {
      if (!username) {
        setAuthError('Please enter a username');
        return;
      }

      const password = await SecureStore.getItemAsync(username);
      if (!password) {
        setAuthError('No stored credentials found for this username');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth-feed`, {
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setAuthData(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching authenticated data:', error);
      setAuthError(error instanceof Error ? error.message : 'An error occurred while fetching data');
      setAuthData('');
    } finally {
      setIsAuthLoading(false);
    }
  }

  return (
    <SafeAreaView edges={['bottom']} className='flex-1 bg-background'>
      <ScrollView className='flex-1'>
        <View className='justify-center items-center gap-5 p-6'>
          {/* Public API Card */}
          <Card className='w-full max-w-sm rounded-2xl'>
            <CardHeader>
              <CardTitle className='py-2 text-center'>Public API Feed</CardTitle>
            </CardHeader>
            <CardContent className='flex-col gap-4'>
              {errorMessage ? (
                <View className='bg-destructive/10 p-4 rounded-lg'>
                  <Text className='text-sm text-destructive'>{errorMessage}</Text>
                </View>
              ) : (
                <View className='bg-muted p-4 rounded-lg'>
                  <ScrollView className='max-h-32' showsVerticalScrollIndicator={true}>
                    <Text className='text-sm'>{feedData || 'No data fetched yet'}</Text>
                  </ScrollView>
                </View>
              )}
              <Button 
                variant='outline'
                className='shadow shadow-foreground/5'
                onPress={fetchFeedData}
                disabled={isPublicLoading}
              >
                <Text>{isPublicLoading ? 'Loading...' : 'Fetch Public Data'}</Text>
              </Button>
            </CardContent>
          </Card>

          {/* Authenticated API Card */}
          <Card className='w-full max-w-sm rounded-2xl'>
            <CardHeader>
              <CardTitle className='py-2 text-center'>Authenticated API Feed</CardTitle>
            </CardHeader>
            <CardContent className='flex-col gap-4'>
              <TextInput
                className='w-full p-2 border border-input rounded-lg bg-background text-foreground'
                placeholder="Enter username"
                value={username}
                onChangeText={setUsername}
                editable={!isAuthLoading}
                placeholderTextColor={isDarkColorScheme ? '#666' : '#999'}
              />
              {authError ? (
                <View className='bg-destructive/10 p-4 rounded-lg'>
                  <Text className='text-sm text-destructive'>{authError}</Text>
                </View>
              ) : (
                <View className='bg-muted p-4 rounded-lg'>
                  <ScrollView className='max-h-32' showsVerticalScrollIndicator={true}>
                    <Text className='text-sm'>{authData || 'No authenticated data fetched yet'}</Text>
                  </ScrollView>
                </View>
              )}
              <Button 
                variant='outline'
                className='shadow shadow-foreground/5'
                onPress={fetchAuthenticatedData}
                disabled={isAuthLoading}
              >
                <Text>{isAuthLoading ? 'Loading...' : 'Fetch Authenticated Data'}</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}