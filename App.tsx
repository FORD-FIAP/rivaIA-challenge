/** Ponto de entrada do app RIVA — carrega fonte Sora antes de renderizar */
import React from 'react';
import { View, ActivityIndicator, Platform, StyleSheet, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
} from '@expo-google-fonts/sora';
import { NavigationProvider, useNavigation } from './src/context/NavigationContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { AuthProvider } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { VeiculosScreen } from './src/screens/VeiculosScreen';
import { CompararScreen } from './src/screens/CompararScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { Sidebar } from './src/components/home/Sidebar';

const DESKTOP_BREAKPOINT = 600;

function AppScreens() {
  const { activeScreen, sidebarOpen, closeSidebar } = useNavigation();

  return (
    <>
      {activeScreen === 'Veículos' ? (
        <VeiculosScreen />
      ) : activeScreen === 'Comparar' ? (
        <CompararScreen />
      ) : activeScreen === 'Perfil' ? (
        <ProfileScreen />
      ) : (
        <HomeScreen />
      )}
      <Sidebar visible={sidebarOpen} onClose={closeSidebar} />
      <LoginScreen />
    </>
  );
}

export default function App() {
  const { width: windowWidth } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: '#1E1A1B', alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#05D3F8" />
        </View>
      </SafeAreaProvider>
    );
  }

  const showDesktopFrame = Platform.OS === 'web' && windowWidth >= DESKTOP_BREAKPOINT;

  return (
    <SafeAreaProvider>
      <NavigationProvider>
       <AuthProvider>
        <FavoritesProvider>
         <ChatProvider>
          <StatusBar style="light" />
          {showDesktopFrame ? (
            <View style={styles.webContainer}>
              <View style={styles.phoneFrame}>
                <AppScreens />
              </View>
            </View>
          ) : (
            <AppScreens />
          )}
         </ChatProvider>
        </FavoritesProvider>
       </AuthProvider>
      </NavigationProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: 430,
    flex: 1,
    maxHeight: 932,
    overflow: 'hidden',
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
});