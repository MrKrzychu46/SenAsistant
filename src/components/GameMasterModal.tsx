import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Game } from '../types/game';
import { COLORS } from '../theme/theme';
import { sanitizeNumericInput } from '../utils/gameUtils';
import { ShieldAlert, X, Trash2, Save } from 'lucide-react-native';

interface GameMasterModalProps {
  visible: boolean;
  game: Game;
  onClose: () => void;
  onSaveSettings: (
    newTargetScore: number,
    playerNamesById: Record<string, string>
  ) => void;
  onDeletePlayer: (id: string) => void;
  onDeleteGame: () => void;
}

export const GameMasterModal: React.FC<GameMasterModalProps> = ({
  visible,
  game,
  onClose,
  onSaveSettings,
  onDeletePlayer,
  onDeleteGame,
}) => {
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});
  const [targetScoreInput, setTargetScoreInput] = useState<string>('100');

  useEffect(() => {
    if (visible && game) {
      const namesByPlayerId: Record<string, string> = {};
      game.players.forEach(player => {
        namesByPlayerId[player.id] = player.name;
      });
      setPlayerNames(namesByPlayerId);
      setTargetScoreInput(game.targetScore.toString());
    }
  }, [visible, game?.id]);

  const handleSaveNamesAndTarget = () => {
    const parsedTargetScore = parseInt(targetScoreInput, 10);
    if (!parsedTargetScore || parsedTargetScore <= 0) {
      Alert.alert('Błąd', 'Podaj poprawny limit kruków (większy od 0).');
      return;
    }

    const trimmedNames = game.players.map(
      player => (playerNames[player.id] || '').trim() || player.name
    );
    const uniqueNames = new Set(trimmedNames.map(name => name.toLowerCase()));
    if (uniqueNames.size !== trimmedNames.length) {
      Alert.alert('Błąd', 'Imiona graczy muszą być unikalne.');
      return;
    }

    onSaveSettings(parsedTargetScore, playerNames);
    onClose();
  };

  const confirmDeleteGame = () => {
    Alert.alert(
      'Usuń Grę',
      'Czy na pewno chcesz usunąć tę grę? Wszystkie niezapisane postępy zostaną utracone.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Usuń',
          style: 'destructive',
          onPress: () => {
            onClose();
            onDeleteGame();
          },
        },
      ]
    );
  };

  const confirmRemovePlayer = (id: string, name: string) => {
    if (game.players.length <= 2) {
      Alert.alert('Błąd', 'Gra wymaga co najmniej 2 graczy.');
      return;
    }

    Alert.alert('Usunięcie Gracza', `Czy chcesz usunąć gracza "${name}" z gry?`, [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        style: 'destructive',
        onPress: () => {
          setPlayerNames(previousNames => {
            const updatedNames = { ...previousNames };
            delete updatedNames[id];
            return updatedNames;
          });
          onDeletePlayer(id);
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <ShieldAlert size={22} color={COLORS.moonGold} />
              <Text style={styles.titleText}>Panel Mastera Gry</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtext}>
            Zarządzaj nickami graczy, zmień limit kruków lub usuń grę.
          </Text>

          <ScrollView style={styles.scrollArea}>
            {/* Target Score limit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Limit kruków w grze (Domyślnie 100):</Text>
              <View style={styles.targetRow}>
                <TextInput
                  style={styles.targetInput}
                  value={targetScoreInput}
                  onChangeText={inputValue =>
                    setTargetScoreInput(sanitizeNumericInput(inputValue))
                  }
                  keyboardType="numeric"
                />
                <Text style={styles.targetLabel}>kruków do końca gry</Text>
              </View>
            </View>

            {/* Players editing */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Edycja imion / nicków graczy:</Text>
              {game.players.map(player => (
                <View key={player.id} style={styles.playerEditRow}>
                  <View style={[styles.avatar, { backgroundColor: player.color }]}>
                    <Text style={styles.avatarText}>
                      {player.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <TextInput
                    style={styles.nameInput}
                    value={playerNames[player.id] || ''}
                    onChangeText={inputValue =>
                      setPlayerNames(previousNames => ({
                        ...previousNames,
                        [player.id]: inputValue,
                      }))
                    }
                    placeholder="Nick gracza"
                    placeholderTextColor={COLORS.textMuted}
                  />

                  {game.players.length > 2 && (
                    <TouchableOpacity
                      style={styles.deletePlayerBtn}
                      onPress={() => confirmRemovePlayer(player.id, player.name)}
                    >
                      <Trash2 size={18} color={COLORS.dangerRed} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Dangerous actions */}
            <View style={styles.dangerSection}>
              <TouchableOpacity
                style={styles.deleteGameBtn}
                onPress={confirmDeleteGame}
                activeOpacity={0.7}
              >
                <Trash2 size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.deleteGameText}>Usuń Całą Grę</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Zamknij</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSaveNamesAndTarget}
              activeOpacity={0.7}
            >
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
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
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
    marginBottom: 16,
  },
  scrollArea: {
    marginBottom: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.moonGold,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
  },
  targetInput: {
    width: 70,
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
    marginRight: 12,
  },
  targetLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  playerEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  nameInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  deletePlayerBtn: {
    padding: 8,
    marginLeft: 8,
  },
  dangerSection: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 63, 94, 0.2)',
    paddingTop: 14,
  },
  deleteGameBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.dangerRed,
    paddingVertical: 12,
    borderRadius: 14,
  },
  deleteGameText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
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
