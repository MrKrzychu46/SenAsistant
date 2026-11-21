import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Game, RoundScore } from '../types/game';
import { COLORS } from '../theme/theme';
import { GlassCard } from './GlassCard';
import { History, Edit2, ChevronDown, ChevronUp, Star, BellRing } from 'lucide-react-native';
import { EditRoundModal } from './EditRoundModal';

interface RoundHistoryProps {
  game: Game;
  onEditRound: (roundNumber: number, newRawScores: Record<string, number>, wakeUpCallerId?: string) => void;
}

export const RoundHistory: React.FC<RoundHistoryProps> = ({ game, onEditRound }) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [selectedRound, setSelectedRound] = useState<RoundScore | null>(null);

  if (!game.rounds || game.rounds.length === 0) {
    return null;
  }

  // Reverse rounds array so newest round is on top
  const reversedRounds = [...game.rounds].reverse();

  return (
    <GlassCard style={styles.container}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={() => setCollapsed(!collapsed)}
        activeOpacity={0.7}
      >
        <View style={styles.headerTitle}>
          <History size={18} color={COLORS.dreamCyan} />
          <Text style={styles.titleText}>
            Historia Rund ({game.rounds.length})
          </Text>
        </View>
        {collapsed ? (
          <ChevronDown size={20} color={COLORS.textMuted} />
        ) : (
          <ChevronUp size={20} color={COLORS.textMuted} />
        )}
      </TouchableOpacity>

      {!collapsed && (
        <View style={styles.roundsList}>
          {reversedRounds.map(round => {
            const starterId = round.startingPlayerId;
            const wakeUpCaller = game.players.find(player => player.id === round.wakeUpCallerId);
            return (
              <View key={`round_${round.roundNumber}`} style={styles.roundCard}>
                <View style={styles.roundCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.roundBadge}>RUNDA #{round.roundNumber}</Text>
                    {wakeUpCaller && (
                      <View style={styles.callerBadge}>
                        <BellRing size={10} color={COLORS.moonGold} style={{ marginRight: 3 }} />
                        <Text style={styles.callerBadgeText}>{wakeUpCaller.name}</Text>
                      </View>
                    )}
                  </View>
                  
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => setSelectedRound(round)}
                    activeOpacity={0.7}
                  >
                    <Edit2 size={14} color={COLORS.moonGold} />
                    <Text style={styles.editBtnText}>Edytuj GM</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.scoresGrid}>
                  {game.players.map(player => {
                    const roundPoints = round.scores[player.id] ?? 0;
                    const isStarter = starterId === player.id;
                    const isCaller = round.wakeUpCallerId === player.id;
                    return (
                      <View key={player.id} style={styles.playerItem}>
                        <View style={[styles.dot, { backgroundColor: player.color }]} />
                        <Text style={styles.playerName} numberOfLines={1}>
                          {player.name}:
                        </Text>
                        <Text
                          style={[
                            styles.scoreValue,
                            isCaller && roundPoints === 0
                              ? { color: COLORS.successGreen }
                              : isCaller && roundPoints > (round.rawScores?.[player.id] ?? 0)
                              ? { color: COLORS.dangerRed }
                              : null,
                          ]}
                        >
                          +{roundPoints} 🪶
                        </Text>
                        {isStarter && (
                          <View style={styles.starterTag}>
                            <Star size={10} color={COLORS.moonGold} fill={COLORS.moonGold} />
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Edit Round Modal */}
      <EditRoundModal
        visible={selectedRound !== null}
        game={game}
        round={selectedRound}
        onClose={() => setSelectedRound(null)}
        onSave={onEditRound}
      />
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  roundsList: {
    marginTop: 12,
  },
  roundCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  roundCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  roundBadge: {
    color: COLORS.dreamCyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  callerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  callerBadgeText: {
    color: COLORS.moonGold,
    fontSize: 10,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  editBtnText: {
    color: COLORS.moonGold,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginVertical: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  playerName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginRight: 4,
    flexShrink: 1,
  },
  scoreValue: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  starterTag: {
    marginLeft: 4,
  },
});
