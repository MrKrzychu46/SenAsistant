import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Game, RoundScore } from '../types/game';
import { COLORS } from '../theme/theme';
import { parseNonNegativeScore, sanitizeNumericInput } from '../utils/gameUtils';
import { X, Save, Edit3, BellRing } from 'lucide-react-native';

interface EditRoundModalProps {
  visible: boolean;
  game: Game;
  round: RoundScore | null;
  onClose: () => void;
  onSave: (roundNumber: number, newRawScores: Record<string, number>, wakeUpCallerId?: string) => void;
}

export const EditRoundModal: React.FC<EditRoundModalProps> = ({
  visible,
  game,
  round,
  onClose,
  onSave,
}) => {
  const [editedScores, setEditedScores] = useState<Record<string, string>>({});
  const [editedWakeUpCallerId, setEditedWakeUpCallerId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (round) {
      const initialScores: Record<string, string> = {};
      const sourceScores = round.rawScores || round.scores;
      game.players.forEach(player => {
        initialScores[player.id] = (sourceScores[player.id] ?? 0).toString();
      });
      setEditedScores(initialScores);
      setEditedWakeUpCallerId(round.wakeUpCallerId);
    }
  }, [round, game]);

  if (!round) return null;

  const handleSave = () => {
    const rawScores: Record<string, number> = {};
    game.players.forEach(player => {
      rawScores[player.id] = parseNonNegativeScore(editedScores[player.id]);
    });
    onSave(round.roundNumber, rawScores, editedWakeUpCallerId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Edit3 size={20} color={COLORS.moonGold} />
              <Text style={styles.titleText}>Edycja Rundy #{round.roundNumber}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtext}>
            Master Gry: Zmień surową liczbę kruków w śnie oraz wywołującego "Budzimy się!". Wyniki zostaną automatycznie przeliczone (premia 0 lub +5 kary).
          </Text>

          {/* Wake up selector for GM */}
          <View style={styles.wakeUpEditSection}>
            <Text style={styles.wakeUpLabel}>Wywołujący "Budzimy się!":</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  editedWakeUpCallerId === undefined ? styles.chipActive : null,
                ]}
                onPress={() => setEditedWakeUpCallerId(undefined)}
              >
                <Text style={[styles.chipText, editedWakeUpCallerId === undefined ? styles.chipActiveText : null]}>
                  Brak (stos)
                </Text>
              </TouchableOpacity>

              {game.players.map(player => (
                <TouchableOpacity
                  key={player.id}
                  style={[
                    styles.chip,
                    editedWakeUpCallerId === player.id ? styles.chipActive : null,
                  ]}
                  onPress={() =>
                    setEditedWakeUpCallerId(previousId =>
                      previousId === player.id ? undefined : player.id
                    )
                  }
                >
                  <Text style={[styles.chipText, editedWakeUpCallerId === player.id ? styles.chipActiveText : null]}>
                    {player.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={styles.scrollArea}>
            {game.players.map(player => (
              <View key={player.id} style={styles.playerRow}>
                <View style={styles.playerLeft}>
                  <View style={[styles.colorBadge, { backgroundColor: player.color }]} />
                  <Text style={styles.playerName}>{player.name}</Text>
                  {editedWakeUpCallerId === player.id && (
                    <BellRing size={14} color={COLORS.moonGold} style={{ marginLeft: 6 }} />
                  )}
                </View>

                <TextInput
                  style={styles.input}
                  value={editedScores[player.id] || ''}
                  onChangeText={inputValue =>
                    setEditedScores(previousScores => ({
                      ...previousScores,
                      [player.id]: sanitizeNumericInput(inputValue),
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            ))}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelText}>Anuluj</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.7}>
              <Save size={18} color="#000" style={{ marginRight: 6 }} />
              <Text style={styles.saveText}>Zapisz Zmiany GM</Text>
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
    backgroundColor: 'rgba(5, 8, 20, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: COLORS.bgDark,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.moonGoldGlow,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  subtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  wakeUpEditSection: {
    marginBottom: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 12,
    padding: 10,
  },
  wakeUpLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.moonGold,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  chipActiveText: {
    color: COLORS.moonGold,
    fontWeight: '800',
  },
  scrollArea: {
    marginBottom: 16,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  input: {
    width: 70,
    height: 42,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.moonGold,
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
  },
  cancelText: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.moonGold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  saveText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
});
