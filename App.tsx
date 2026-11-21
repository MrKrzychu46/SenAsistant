import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { GameProvider, useGame } from './src/context/GameContext';
import { COLORS, GRADIENTS } from './src/theme/theme';

// Screens
import { HomeScreen } from './src/screens/HomeScreen';
import { NewGameScreen } from './src/screens/NewGameScreen';
import { GameScreen } from './src/screens/GameScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

type ScreenType = 'home' | 'newGame' | 'game' | 'history';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [isLayoutReady, setIsLayoutReady] = useState<boolean>(false);
  const { isLoading } = useGame();

  useEffect(() => {
    if (!isLoading && isLayoutReady) {
      const frameId = requestAnimationFrame(() => {
        SplashScreen.hideAsync().catch(() => {});
      });
      return () => cancelAnimationFrame(frameId);
    }
    return undefined;
  }, [isLoading, isLayoutReady]);

  const handleRootLayout = useCallback(() => {
    setIsLayoutReady(true);
  }, []);

  const handleNavigateToActiveGame = () => {
    setCurrentScreen('game');
  };

  const handleGameStarted = () => {
    setCurrentScreen('game');
  };

  return (
    <View style={styles.outerContainer} onLayout={handleRootLayout}>
      <LinearGradient
        colors={GRADIENTS.mainBg}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      />
      <SafeAreaView style={styles.safeArea}>
        <ExpoStatusBar style="light" />

        {currentScreen === 'home' && (
          <HomeScreen
            onNavigateToNewGame={() => setCurrentScreen('newGame')}
            onNavigateToActiveGame={handleNavigateToActiveGame}
            onNavigateToHistory={() => setCurrentScreen('history')}
          />
        )}

        {currentScreen === 'newGame' && (
          <NewGameScreen
            onBack={() => setCurrentScreen('home')}
            onGameStarted={handleGameStarted}
          />
        )}

        {currentScreen === 'game' && (
          <GameScreen onBackToHome={() => setCurrentScreen('home')} />
        )}

        {currentScreen === 'history' && (
          <HistoryScreen onBack={() => setCurrentScreen('home')} />
        )}
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
});
