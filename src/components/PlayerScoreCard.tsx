import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Player } from '../types/game';
import { COLORS } from '../theme/theme';
import { GlassCard } from './GlassCard';
import { parseNonNegativeScore, sanitizeNumericInput } from '../utils/gameUtils';
import { Feather, Plus, Minus, RotateCcw, Star, BellRing } from 'lucide-react-native';

interface PlayerScoreCardProps {
  player: Player;
  totalScore: number;
  targetScore: number;
  currentRoundInput: string;
  onChangeInput: (inputValue: string) => void;
  rank?: number;
  isLeader?: boolean;
  isStarter?: boolean;
  turnOrderNumber?: number;
  onSetStarter?: () => void;
  isWakeUpCaller?: boolean;
  onToggleWakeUpCaller?: () => void;
  calculatedRoundPoints?: number;
  wakeUpResultInfo?: 'success' | 'failed';
}

function getProgressBarColor(percentage: number): string {
  if (percentage >= 80) {
    return COLORS.dangerRed;
  }
  if (percentage >= 60) {
    return COLORS.warningOrange;
  }
  return COLORS.dreamCyan;
}

function getCardBorderAccent(
  isWakeUpCaller: boolean,
  wakeUpResultInfo: 'success' | 'failed' | undefined,
  isStarter: boolean,
  isLeader: boolean | undefined
): string | undefined {
  if (isWakeUpCaller) {
    return wakeUpResultInfo === 'failed' ? COLORS.dangerRed : COLORS.moonGold;
  }
  if (isStarter) {
    return COLORS.moonGold;
  }
  if (isLeader) {
    return COLORS.successGreen;
  }
  return undefined;
}

export const PlayerScoreCard: React.FC<PlayerScoreCardProps> = ({
  player,
  totalScore,
  targetScore,
  currentRoundInput,
  onChangeInput,
  rank,
  isLeader,
  isStarter = false,
  turnOrderNumber,
  onSetStarter,
  isWakeUpCaller = false,
  onToggleWakeUpCaller,
  calculatedRoundPoints,
  wakeUpResultInfo,
}) => {
  const parsedRoundScore = parseNonNegativeScore(currentRoundInput);
  const percentage = Math.min(100, Math.max(0, (totalScore / targetScore) * 100));
  const progressColor = getProgressBarColor(percentage);
  const borderAccent = getCardBorderAccent(
    isWakeUpCaller,
    wakeUpResultInfo,
    isStarter,
    isLeader
  );

  const handleIncrement = (amount: number) => {
    const currentScore = parseNonNegativeScore(currentRoundInput);
    const updatedScore = Math.max(0, currentScore + amount);
    onChangeInput(updatedScore.toString());
  };

  const handleTextChange = (inputValue: string) => {
    onChangeInput(sanitizeNumericInput(inputValue));
  };

  const handleReset = () => {
    onChangeInput('');
  };

  return (
    <GlassCard style={styles.cardContainer} borderAccent={borderAccent}>
      {/* Top row: Avatar badge, Name, Turn Order Badge & Total score */}
      <View style={styles.topRow}>
        <View style={styles.playerInfo}>
          <View style={[styles.avatar, { backgroundColor: player.color }]}>
            <Text style={styles.avatarText}>{player.name.charAt(0).toUpperCase()}</Text>
          </View>

          <View style={{ flex: 1, marginLeft: 10, marginRight: 6 }}>
            <View style={styles.nameRow}>
              <Text style={styles.playerName} numberOfLines={1}>
                {player.name}
              </Text>

              {isLeader && (
                <View style={styles.leaderBadge}>
                  <Text style={styles.leaderBadgeText}>Prowadzi</Text>
                </View>
              )}
            </View>

            {/* Turn order and starting player indicator */}
            <View style={styles.subInfoRow}>
              <Text style={styles.rankText}>Miejsce #{rank || 1}</Text>

              <TouchableOpacity
                style={[
                  styles.turnBadge,
                  isStarter ? styles.starterTurnBadge : styles.normalTurnBadge,
                ]}
                onPress={onSetStarter}
                activeOpacity={0.7}
              >
                <Star
                  size={11}
                  color={isStarter ? COLORS.moonGold : COLORS.textMuted}
                  fill={isStarter ? COLORS.moonGold : 'transparent'}
                  style={{ marginRight: 3 }}
                />
                <Text
                  style={[
                    styles.turnBadgeText,
                    isStarter ? styles.starterTurnText : styles.normalTurnText,
                  ]}
                >
                  {isStarter ? '1. Zaczyna' : `${turnOrderNumber || '?'}. w kolejce`}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.totalContainer}>
          <View style={styles.ravenRow}>
            <Feather size={16} color={progressColor} />
            <Text style={[styles.totalScoreText, { color: progressColor }]}>
              {totalScore}
            </Text>
          </View>
          <Text style={styles.targetLabel}>/ {targetScore} kruków</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: progressColor },
          ]}
        />
      </View>

      {/* Round input controls */}
      <View style={styles.inputSection}>
        <View style={styles.inputHeaderRow}>
          <Text style={styles.inputLabel}>Kruki w śnie (na kartach):</Text>

          <TouchableOpacity
            style={[
              styles.wakeUpBadgeBtn,
              isWakeUpCaller ? styles.wakeUpActiveBtn : styles.wakeUpInactiveBtn,
            ]}
            onPress={onToggleWakeUpCaller}
            activeOpacity={0.7}
          >
            <BellRing
              size={12}
              color={isWakeUpCaller ? COLORS.moonGold : COLORS.textMuted}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.wakeUpBadgeText,
                isWakeUpCaller ? styles.wakeUpActiveText : styles.wakeUpInactiveText,
              ]}
            >
              {isWakeUpCaller ? 'Wywołał: Budzimy się!' : 'Budzimy się?'}
            </Text>
          </TouchableOpacity>
        </View>

        {isWakeUpCaller && wakeUpResultInfo && (
          <View
            style={[
              styles.wakeUpResultBox,
              wakeUpResultInfo === 'success'
                ? styles.wakeUpSuccessBox
                : styles.wakeUpFailedBox,
            ]}
          >
            {wakeUpResultInfo === 'success' ? (
              <Text style={styles.wakeUpSuccessText}>
                🟢 Najmniej kruków! Wynik rundy:{' '}
                <Text style={{ fontWeight: '900' }}>0 kruków</Text> (Premia 🌟)
              </Text>
            ) : (
              <Text style={styles.wakeUpFailedText}>
                🔴 Ktoś miał mniej! Wynik rundy:{' '}
                <Text style={{ fontWeight: '900' }}>
                  {calculatedRoundPoints} kruków
                </Text>{' '}
                ({parsedRoundScore} + 5 kary 💀)
              </Text>
            )}
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => handleIncrement(-1)}
            activeOpacity={0.7}
          >
            <Minus size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TextInput
            style={styles.scoreInput}
            value={currentRoundInput}
            onChangeText={handleTextChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={COLORS.textMuted}
            selectTextOnFocus
          />

          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => handleIncrement(1)}
            activeOpacity={0.7}
          >
            <Plus size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleIncrement(5)}
            activeOpacity={0.7}
          >
            <Text style={styles.presetText}>+5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleIncrement(10)}
            activeOpacity={0.7}
          >
            <Text style={styles.presetText}>+10</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <RotateCcw size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  playerName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginRight: 6,
  },
  leaderBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  leaderBadgeText: {
    color: COLORS.successGreen,
    fontSize: 9,
    fontWeight: '700',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  rankText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  turnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  starterTurnBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.5)',
  },
  normalTurnBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  turnBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  starterTurnText: {
    color: COLORS.moonGold,
  },
  normalTurnText: {
    color: COLORS.textSecondary,
  },
  totalContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
    flexShrink: 0,
  },
  ravenRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalScoreText: {
    fontSize: 24,
    fontWeight: '800',
    marginLeft: 4,
  },
  targetLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: -2,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  inputSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  wakeUpBadgeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  wakeUpActiveBtn: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: COLORS.moonGold,
  },
  wakeUpInactiveBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  wakeUpBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  wakeUpActiveText: {
    color: COLORS.moonGold,
  },
  wakeUpInactiveText: {
    color: COLORS.textMuted,
  },
  wakeUpResultBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  wakeUpSuccessBox: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  wakeUpSuccessText: {
    color: COLORS.successGreen,
    fontSize: 11,
    fontWeight: '700',
  },
  wakeUpFailedBox: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  wakeUpFailedText: {
    color: COLORS.dangerRed,
    fontSize: 11,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  adjustBtn: {
    width: 38,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreInput: {
    width: 56,
    height: 42,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.dreamCyan,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginHorizontal: 6,
  },
  presetBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginLeft: 4,
  },
  presetText: {
    color: COLORS.dreamCyan,
    fontSize: 13,
    fontWeight: '700',
  },
  resetBtn: {
    width: 34,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});
