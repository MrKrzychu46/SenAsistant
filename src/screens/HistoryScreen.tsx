import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { COLORS } from '../theme/theme';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { Trophy, Trash2, Calendar, Crown } from 'lucide-react-native';
import { getPlayerStats } from '../utils/gameUtils';

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const { history, deleteHistoryGame } = useGame();

  const confirmDelete = (gameId: string) => {
    Alert.alert('Usuń z Historii', 'Czy na pewno chcesz usunąć ten wpis z historii gier?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => deleteHistoryGame(gameId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header title="HISTORIA GIER" subtitle="Archiwum Rozgrywek" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {history.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Trophy size={40} color={COLORS.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>Brak rozegranych gier</Text>
            <Text style={styles.emptyText}>
              Gdy ukończycie grę (osiągając limit kruków), jej ostateczny wynik i ranking pojawią się tutaj.
            </Text>
          </GlassCard>
        ) : (
          history.map(game => {
            const stats = getPlayerStats(game);
            const winner = stats[0];
            const formattedDate = new Date(game.dateEnded || game.dateStarted).toLocaleDateString('pl-PL', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <GlassCard key={game.id} style={styles.historyCard}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <View style={styles.dateRow}>
                    <Calendar size={14} color={COLORS.dreamCyan} />
                    <Text style={styles.dateText}>{formattedDate}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => confirmDelete(game.id)}
                  >
                    <Trash2 size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Winner section */}
                {winner && (
                  <View style={styles.winnerBox}>
                    <Crown size={18} color={COLORS.moonGold} />
                    <Text style={styles.winnerLabel}>Zwycięzca:</Text>
                    <Text style={styles.winnerName}>{winner.player.name}</Text>
                    <Text style={styles.winnerScore}>({winner.totalScore} 🪶)</Text>
                  </View>
                )}

                {/* Summary details */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Rundy: {game.rounds.length}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.metaText}>Limit: {game.targetScore} kruków</Text>
                </View>

                {/* Final scores breakdown */}
                <View style={styles.scoresList}>
                  {stats.map(stat => (
                    <View key={stat.player.id} style={styles.playerScoreRow}>
                      <View style={styles.playerLeft}>
                        <View style={[styles.colorDot, { backgroundColor: stat.player.color }]} />
                        <Text style={styles.playerName}>{stat.player.name}</Text>
                        {stat.isWinner && <Text style={styles.winnerBadge}> 🏆 1. miejsce</Text>}
                        {stat.isLoser && <Text style={styles.loserBadge}> 💀 Przegrana</Text>}
                      </View>
                      <Text style={styles.scoreNumber}>{stat.totalScore} kruków</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            );
          })
        )}
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
  emptyCard: {
    alignItems: 'center',
    padding: 30,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  historyCard: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.dreamCyan,
    marginLeft: 6,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
  },
  winnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    marginBottom: 10,
  },
  winnerLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 6,
    marginRight: 4,
  },
  winnerName: {
    color: COLORS.moonGold,
    fontSize: 15,
    fontWeight: '800',
  },
  winnerScore: {
    color: COLORS.moonGold,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  metaDot: {
    color: COLORS.textMuted,
    marginHorizontal: 6,
  },
  scoresList: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    padding: 10,
  },
  playerScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  playerName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  winnerBadge: {
    color: COLORS.moonGold,
    fontSize: 11,
    fontWeight: '700',
  },
  loserBadge: {
    color: COLORS.dangerRed,
    fontSize: 11,
    fontWeight: '700',
  },
  scoreNumber: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
});
