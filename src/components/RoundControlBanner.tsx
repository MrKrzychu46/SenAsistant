import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Player, PlayerStat } from '../types/game';
import { COLORS } from '../theme/theme';
import { ShieldAlert, Trophy, Star, RefreshCw, BellRing } from 'lucide-react-native';

interface RoundControlBannerProps {
  players: Player[];
  leaderStat?: PlayerStat;
  starterPlayer?: Player;
  wakeUpCallerId?: string;
  onOpenGameMaster: () => void;
  onCycleStarterPlayer: () => void;
  onSelectWakeUpCaller: (playerId?: string) => void;
}

export const RoundControlBanner: React.FC<RoundControlBannerProps> = ({
  players,
  leaderStat,
  starterPlayer,
  wakeUpCallerId,
  onOpenGameMaster,
  onCycleStarterPlayer,
  onSelectWakeUpCaller,
}) => {
  return (
    <>
      {/* Round leader & GM quick button */}
      <View style={styles.infoBar}>
        <View style={styles.infoLeft}>
          <Trophy size={16} color={COLORS.moonGold} />
          <Text style={styles.infoText}>
            Prowadzi:{' '}
            <Text style={{ color: COLORS.moonGold, fontWeight: '800' }}>
              {leaderStat?.player.name || '-'}
            </Text>{' '}
            ({leaderStat?.totalScore || 0} 🪶)
          </Text>
        </View>

        <TouchableOpacity
          style={styles.gmQuickBtn}
          onPress={onOpenGameMaster}
          activeOpacity={0.7}
        >
          <ShieldAlert size={14} color={COLORS.moonGold} />
          <Text style={styles.gmQuickText}>Opcje GM</Text>
        </TouchableOpacity>
      </View>

      {/* Starting player / Turn order banner */}
      <View style={styles.starterBanner}>
        <View style={styles.starterLeft}>
          <Star size={18} color={COLORS.moonGold} fill={COLORS.moonGold} />
          <Text style={styles.starterLabel}>Zaczyna rundę:</Text>
          <Text style={styles.starterName}>{starterPlayer?.name || '-'}</Text>
        </View>

        <TouchableOpacity
          style={styles.switchStarterBtn}
          onPress={onCycleStarterPlayer}
          activeOpacity={0.7}
        >
          <RefreshCw size={12} color={COLORS.dreamCyan} style={{ marginRight: 4 }} />
          <Text style={styles.switchStarterText}>Zmień</Text>
        </TouchableOpacity>
      </View>

      {/* Wake Up Selector Card */}
      <View style={styles.wakeUpSection}>
        <View style={styles.wakeUpHeaderRow}>
          <BellRing size={16} color={COLORS.moonGold} />
          <Text style={styles.wakeUpTitle}>Kto zawołał „Budzimy się!”?</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          <TouchableOpacity
            style={[
              styles.wakeUpChip,
              wakeUpCallerId === undefined ? styles.wakeUpChipActive : null,
            ]}
            onPress={() => onSelectWakeUpCaller(undefined)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.wakeUpChipText,
                wakeUpCallerId === undefined ? styles.wakeUpChipActiveText : null,
              ]}
            >
              Brak (wyczerpany stos)
            </Text>
          </TouchableOpacity>

          {players.map(player => {
            const isSelected = wakeUpCallerId === player.id;
            return (
              <TouchableOpacity
                key={player.id}
                style={[
                  styles.wakeUpChip,
                  isSelected ? styles.wakeUpChipActive : null,
                ]}
                onPress={() =>
                  onSelectWakeUpCaller(isSelected ? undefined : player.id)
                }
                activeOpacity={0.7}
              >
                <View style={[styles.playerDot, { backgroundColor: player.color }]} />
                <Text
                  style={[
                    styles.wakeUpChipText,
                    isSelected ? styles.wakeUpChipActiveText : null,
                  ]}
                >
                  {player.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 6,
  },
  gmQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gmQuickText: {
    color: COLORS.moonGold,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  starterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  starterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starterLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 8,
    marginRight: 6,
  },
  starterName: {
    color: COLORS.moonGold,
    fontSize: 15,
    fontWeight: '800',
  },
  switchStarterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  switchStarterText: {
    color: COLORS.dreamCyan,
    fontSize: 11,
    fontWeight: '700',
  },
  wakeUpSection: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
  },
  wakeUpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  wakeUpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  wakeUpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  wakeUpChipActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: COLORS.moonGold,
  },
  playerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  wakeUpChipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  wakeUpChipActiveText: {
    color: COLORS.moonGold,
    fontWeight: '800',
  },
});
