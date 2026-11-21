import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Game } from '../types/game';
import { COLORS, GRADIENTS } from '../theme/theme';
import { getPlayerStats } from '../utils/gameUtils';
import { Crown, RefreshCw, Home, Sparkles, Feather } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RankingModalProps {
  visible: boolean;
  game: Game;
  onRematch: () => void;
  onExitToMenu: () => void;
}

export const RankingModal: React.FC<RankingModalProps> = ({
  visible,
  game,
  onRematch,
  onExitToMenu,
}) => {
  if (!game) return null;

  const stats = getPlayerStats(game);
  const winner = stats[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Top Banner */}
          <LinearGradient
            colors={[COLORS.bgCardHover, COLORS.bgDark]}
            style={styles.headerBanner}
          >
            <View style={styles.iconCircle}>
              <Crown size={36} color={COLORS.moonGold} />
            </View>

            <Text style={styles.titleText}>KONIEC SENNEJ PODRÓŻY!</Text>
            <Text style={styles.subtitleText}>
              Osiągnięto limit {game.targetScore} kruków
            </Text>
          </LinearGradient>

          {/* Winner Showcase */}
          {winner && (
            <LinearGradient
              colors={GRADIENTS.winnerPodium}
              style={styles.winnerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.winnerHeader}>
                <Sparkles size={20} color="#000" />
                <Text style={styles.winnerTextBadge}>ZWYCIĘZCA SENNEGO SNOISKA</Text>
                <Sparkles size={20} color="#000" />
              </View>
              <Text style={styles.winnerName}>{winner.player.name}</Text>
              <View style={styles.winnerScoreRow}>
                <Feather size={18} color="#000" />
                <Text style={styles.winnerScoreText}>
                  Tylko {winner.totalScore} kruków!
                </Text>
              </View>
            </LinearGradient>
          )}

          <Text style={styles.rankingTitle}>Ostateczny Ranking Graczy:</Text>
          <Text style={styles.rankingHint}>
            (Najmniej kruków = Najwyższe miejsce)
          </Text>

          {/* Full Leaderboard List */}
          <ScrollView style={styles.listArea}>
            {stats.map(stat => {
              const isFirst = stat.isWinner;
              const isLast = stat.isLoser;

              return (
                <View
                  key={stat.player.id}
                  style={[
                    styles.rankRow,
                    isFirst ? styles.firstRow : null,
                    isLast ? styles.lastRow : null,
                  ]}
                >
                  <View style={styles.rankLeft}>
                    <View
                      style={[
                        styles.rankBadge,
                        isFirst
                          ? { backgroundColor: COLORS.moonGold }
                          : isLast
                          ? { backgroundColor: COLORS.dangerRed }
                          : { backgroundColor: 'rgba(255, 255, 255, 0.15)' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankNumber,
                          isFirst || isLast ? { color: '#000' } : { color: '#fff' },
                        ]}
                      >
                        #{stat.rank}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.playerDot,
                        { backgroundColor: stat.player.color },
                      ]}
                    />

                    <View>
                      <Text style={styles.playerName}>{stat.player.name}</Text>
                      {isFirst && (
                        <Text style={styles.tagTextWinner}>🏆 WYGRYWA</Text>
                      )}
                      {isLast && (
                        <Text style={styles.tagTextLoser}>💀 PRZEGRYWA (NAJWIĘCEJ KRUKÓW)</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.scoreRight}>
                    <Text
                      style={[
                        styles.scoreValue,
                        isFirst ? { color: COLORS.moonGold } : null,
                      ]}
                    >
                      {stat.totalScore}
                    </Text>
                    <Text style={styles.scoreLabel}>kruków</Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={styles.rematchBtn}
              onPress={onRematch}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={GRADIENTS.moonButton}
                style={styles.gradientBtnContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <RefreshCw size={20} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.rematchBtnText}>Zagraj Ponownie (Te same osoby)</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuBtn}
              onPress={onExitToMenu}
              activeOpacity={0.7}
            >
              <Home size={18} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={styles.menuBtnText}>Zakończ i Wróć do Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 20, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: COLORS.bgDark,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: COLORS.moonGold,
    padding: 20,
    alignItems: 'center',
  },
  headerBanner: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 14,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.moonGold,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  subtitleText: {
    fontSize: 12,
    color: COLORS.dreamCyan,
    marginTop: 2,
  },
  winnerCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.moonGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  winnerTextBadge: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginHorizontal: 6,
  },
  winnerName: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000',
    marginVertical: 4,
  },
  winnerScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  winnerScoreText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#000',
    marginLeft: 6,
  },
  rankingTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    alignSelf: 'flex-start',
  },
  rankingHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  listArea: {
    width: '100%',
    maxHeight: 220,
    marginBottom: 16,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
  },
  firstRow: {
    borderColor: COLORS.moonGold,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  lastRow: {
    borderColor: COLORS.dangerRed,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '800',
  },
  playerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tagTextWinner: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.moonGold,
  },
  tagTextLoser: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.dangerRed,
  },
  scoreRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  scoreLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: -2,
  },
  buttonSection: {
    width: '100%',
  },
  rematchBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  gradientBtnContent: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rematchBtnText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '900',
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  menuBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});
