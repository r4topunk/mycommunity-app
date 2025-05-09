import { router } from 'expo-router';
import React from 'react';
import { Dimensions, LayoutAnimation, Platform, UIManager, View } from 'react-native';
import { AuthError, useAuth } from '~/lib/auth-provider';
import {
  AccountNotFoundError,
  HiveError,
  InvalidKeyError,
  InvalidKeyFormatError
} from '~/lib/hive-utils';
import { useColorScheme } from '~/lib/useColorScheme';
import { MatrixRain } from '../ui/loading-effects/MatrixRain';
import { LoginForm } from './LoginForm';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const { height } = Dimensions.get('window');

export function AuthScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const { storedUsers, login, loginStoredUser, enterSpectatorMode } = useAuth();
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [messageType, setMessageType] = React.useState<'error' | 'success' | 'info'>('error');
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsVisible(true);
  }, []);

  const handleSpectator = async () => {
    try {
      await enterSpectatorMode();

      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          500,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        )
      );
      setIsVisible(false);

      setTimeout(() => {
        router.push('/(tabs)/feed');
      }, 500);
    } catch (error) {
      console.error('Error entering spectator mode:', error);
      setMessage('Error entering spectator mode');
      setMessageType('error');
    }
  };

  const handleSubmit = async () => {
    try {
      if (!username || !password) {
        setMessage('Please enter both username and posting key');
        setMessageType('error');
        return;
      }

      await login(username, password);

      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          500,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        )
      );
      setIsVisible(false);

      setTimeout(() => {
        router.push('/(tabs)/feed');
      }, 500);
    } catch (error: any) {
      // Handle specific error types
      if (error instanceof InvalidKeyFormatError ||
          error instanceof AccountNotFoundError ||
          error instanceof InvalidKeyError ||
          error instanceof AuthError ||
          error instanceof HiveError) {
        setMessage(error.message);
      } else {
        setMessage('An unexpected error occurred');
      }
      
      setMessageType('error');
    }
  };

  const handleQuickLogin = async (selectedUsername: string) => {
    try {
      await loginStoredUser(selectedUsername);
      
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          500,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity
        )
      );
      setIsVisible(false);
      
      setTimeout(() => {
        router.push('/(tabs)/feed');
      }, 500);
    } catch (error) {
      // Handle specific error types
      if (error instanceof InvalidKeyFormatError ||
          error instanceof AccountNotFoundError ||
          error instanceof InvalidKeyError ||
          error instanceof AuthError ||
          error instanceof HiveError) {
        setMessage(error.message);
      } else {
        setMessage('Error with quick login');
      }
      
      setMessageType('error');
    }
  };

  return (
    <View
      className="absolute inset-0 bg-background"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: [{ translateY: isVisible ? 0 : height }]
      }}
    >
      <MatrixRain />
      <View className="flex-1 items-center justify-center p-8">
        <LoginForm
          username={username}
          password={password}
          message={message}
          onUsernameChange={(text) => setUsername(text.toLowerCase())}
          onPasswordChange={setPassword}
          onSubmit={handleSubmit}
          onSpectator={handleSpectator}
          storedUsers={storedUsers}
          onQuickLogin={handleQuickLogin}
          isDarkColorScheme={isDarkColorScheme}
        />
      </View>
    </View>
  );
}