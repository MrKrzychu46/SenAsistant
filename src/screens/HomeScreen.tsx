import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { COLORS, GRADIENTS } from '../theme/theme';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Plus, History, Feather, Users, Trash2 } from 'lucide-react-native';
import { getPlayerStats } from '../utils/gameUtils';

interface HomeScreenProps {
  onNavigateToNewGame: () => void;
  onNavigateToActiveGame: () => void;
  onNavigateToHistory: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToNewGame,
  onNavigateToActiveGame,
  onNavigateToHistory,
}) => {
  const { currentGame, history, deleteCurrentGame } = useGame();

  const handleAbandonGame = () => {
    Alert.alert(
      'Anuluj Grę',
      'Czy na pewno chcesz anulować obecną grę? Postępy zostaną utracone.',
      [
        { text: 'Nie', style: 'cancel' },
        { text: 'Tak, usuń', style: 'destructive', onPress: deleteCurrentGame },
      ]
    );
  };

  const activeStats = currentGame ? getPlayerStats(currentGame) : [];
  const leader =
    currentGame && currentGame.rounds.length > 0 && activeStats.length > 0
      ? activeStats[0]
      : null;

  return (
    <View style={styles.container}>
      <Header title="SEN" subtitle="Licznik Kruków & Gracze" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Dream Hero Section */}
        <GlassCard style={styles.heroCard}>
          <LinearGradient
            colors={['rgba(251, 191, 36, 0.1)', 'transparent']}
            style={styles.heroGradient}
          />
          <View style={styles.heroHeader}>
            <Feather size={28} color={COLORS.moonGold} />
            <Text style={styles.heroTitle}>Kraina Snu Czeka</Text>
          </View>
          <Text style={styles.heroSubtitle}>
            Zliczaj kruki zdobyte w każdej rundzie. Pamiętaj – wygrywa gracz z najmniejszym sennym ciężarem!
          </Text>
        </GlassCard>

        {/* Active Game Card (Resume option) */}
        {currentGame && !currentGame.isFinished && (
          <GlassCard style={styles.activeGameCard} borderAccent={COLORS.moonGold}>
            <View style={styles.activeBadgeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeBadgeText}>GRA W TRAKCIE (RUNDA #{currentGame.rounds.length + 1})</Text>
            </View>

            <View style={styles.activePlayersRow}>
              <Text style={styles.activePlayersLabel}>Gracze:</Text>
              <Text style={styles.activePlayersList} numberOfLines={1}>
                {currentGame.players.map(player => player.name).join(', ')}
              </Text>
            </View>

            {leader && (
              <View style={styles.leaderInfoRow}>
                <Text style={styles.leaderLabel}>Prowadzi (najmniej kruków):</Text>
                <Text style={styles.leaderName}>
                  {leader.player.name} ({leader.totalScore} 🪶)
                </Text>
              </View>
            )}

            <View style={styles.activeActionsRow}>
              <TouchableOpacity
                style={styles.resumeBtn}
                onPress={onNavigateToActiveGame}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={GRADIENTS.moonButton}
                  style={styles.resumeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Play size={18} color="#000" fill="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.resumeBtnText}>Kontynuuj Grę</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.abandonBtn}
                onPress={handleAbandonGame}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color={COLORS.dangerRed} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        )}

        {/* Action Buttons Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.mainActionBtn}
            onPress={onNavigateToNewGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.cyanButton}
              style={styles.mainActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Plus size={28} color="#fff" />
              <Text style={styles.mainActionTitle}>Nowa Gra</Text>
              <Text style={styles.mainActionSub}>Dodaj graczy i rozpocznij</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={onNavigateToHistory}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.purpleButton}
              style={styles.secondaryActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <History size={26} color="#fff" />
              <Text style={styles.secondaryActionTitle}>Historia Gier</Text>
              <Text style={styles.secondaryActionSub}>
                {history.length} {history.length === 1 ? 'zakończona gra' : 'zakończonych gier'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Rules Box */}
        <GlassCard style={styles.rulesCard}>
          <View style={styles.rulesHeader}>
            <Users size={18} color={COLORS.dreamCyan} />
            <Text style={styles.rulesTitle}>Zasady Liczenia Punktów w "Śnie"</Text>
          </View>
          <Text style={styles.rulesText}>
            • Na koniec każdej rundy wpisujesz sumę kruków dla każdego gracza.{'\n'}
            • Gra kończy się gdy ktoś zdobędzie <Text style={{ color: COLORS.moonGold, fontWeight: '700' }}>100 kruków</Text>.{'\n'}
            • <Text style={{ color: COLORS.successGreen, fontWeight: '700' }}>WYGRYWA</Text> gracz, który zebrał <Text style={{ color: COLORS.successGreen, fontWeight: '700' }}>NAJMNIEJ</Text> kruków!
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroGradient: {
    ...StyleSheet.absoluteFill,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: 10,
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  activeGameCard: {
    marginBottom: 16,
    padding: 16,
  },
  activeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.moonGold,
    marginRight: 8,
  },
  activeBadgeText: {
    color: COLORS.moonGold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activePlayersRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  activePlayersLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    marginRight: 6,
  },
  activePlayersList: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  leaderInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  leaderLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginRight: 6,
  },
  leaderName: {
    color: COLORS.successGreen,
    fontSize: 13,
    fontWeight: '700',
  },
  activeActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 10,
  },
  resumeGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 15,
  },
  abandonBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  actionGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mainActionBtn: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 8,
  },
  mainActionGradient: {
    width: '100%',
    height: '100%',
    padding: 16,
    justifyContent: 'space-between',
  },
  mainActionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  mainActionSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  secondaryActionBtn: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    marginLeft: 8,
  },
  secondaryActionGradient: {
    width: '100%',
    height: '100%',
    padding: 16,
    justifyContent: 'space-between',
  },
  secondaryActionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryActionSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
  },
  rulesCard: {
    marginTop: 4,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  rulesText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
