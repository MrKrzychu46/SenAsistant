import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { COLORS, GRADIENTS } from '../theme/theme';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { sanitizeNumericInput } from '../utils/gameUtils';
import { LinearGradient } from 'expo-linear-gradient';
import { UserPlus, Trash2, Play, Users, Check, Feather } from 'lucide-react-native';

interface NewGameScreenProps {
  onBack: () => void;
  onGameStarted: () => void;
}

export const NewGameScreen: React.FC<NewGameScreenProps> = ({ onBack, onGameStarted }) => {
  const { startNewGame, savedPlayers } = useGame();

  const [playerInputs, setPlayerInputs] = useState<string[]>(['Gracz 1', 'Gracz 2']);
  const [targetScore, setTargetScore] = useState<string>('100');

  const handleAddPlayer = () => {
    setPlayerInputs(previousInputs => [
      ...previousInputs,
      `Gracz ${previousInputs.length + 1}`,
    ]);
  };

  const handleRemovePlayer = (targetIndex: number) => {
    if (playerInputs.length <= 2) {
      Alert.alert('Informacja', 'Gra w "Sen" wymaga co najmniej 2 graczy.');
      return;
    }
    setPlayerInputs(previousInputs =>
      previousInputs.filter((_, index) => index !== targetIndex)
    );
  };

  const handleUpdateName = (index: number, text: string) => {
    setPlayerInputs(previousInputs => {
      const updatedInputs = [...previousInputs];
      updatedInputs[index] = text;
      return updatedInputs;
    });
  };

  const isSavedPlayerSelected = (savedName: string): boolean => {
    const normalizedSavedName = savedName.trim().toLowerCase();
    return playerInputs.some(
      playerInput => playerInput.trim().toLowerCase() === normalizedSavedName
    );
  };

  const handleSelectSavedPlayer = (name: string) => {
    const normalizedTargetName = name.trim().toLowerCase();
    const existingIndex = playerInputs.findIndex(
      playerInput => playerInput.trim().toLowerCase() === normalizedTargetName
    );

    if (existingIndex !== -1) {
      setPlayerInputs(previousInputs => {
        if (previousInputs.length > 2) {
          return previousInputs.filter((_, index) => index !== existingIndex);
        }
        const updatedInputs = [...previousInputs];
        updatedInputs[existingIndex] = `Gracz ${existingIndex + 1}`;
        return updatedInputs;
      });
      return;
    }

    const firstEmptyIndex = playerInputs.findIndex(
      playerInput => !playerInput.trim() || playerInput.startsWith('Gracz ')
    );

    if (firstEmptyIndex !== -1) {
      setPlayerInputs(previousInputs => {
        const updatedInputs = [...previousInputs];
        updatedInputs[firstEmptyIndex] = name;
        return updatedInputs;
      });
    } else {
      setPlayerInputs(previousInputs => [...previousInputs, name]);
    }
  };

  const handleStartGame = async () => {
    const cleanedNames = playerInputs.map(playerName => playerName.trim()).filter(Boolean);

    if (cleanedNames.length < 2) {
      Alert.alert('Błąd', 'Podaj imiona dla co najmniej 2 graczy.');
      return;
    }

    const uniqueNames = new Set(cleanedNames.map(name => name.toLowerCase()));
    if (uniqueNames.size !== cleanedNames.length) {
      Alert.alert('Błąd', 'Imiona graczy muszą być unikalne.');
      return;
    }

    const parsedTargetScore = parseInt(targetScore, 10);
    if (!parsedTargetScore || parsedTargetScore <= 0) {
      Alert.alert('Błąd', 'Podaj poprawny limit kruków (np. 100).');
      return;
    }

    const formattedInputs = cleanedNames.map((name, index) => ({
      name,
      color: COLORS.playerColors[index % COLORS.playerColors.length],
    }));

    await startNewGame(formattedInputs, parsedTargetScore);
    onGameStarted();
  };

  return (
    <View style={styles.container}>
      <Header title="NOWA GRA" subtitle="Konfiguracja Składu" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Target score setup */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Feather size={20} color={COLORS.moonGold} />
            <Text style={styles.sectionTitle}>Limit Kruków w Grze</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Gdy dowolny gracz osiągnie tę liczbę kruków, gra się kończy.
          </Text>

          <View style={styles.targetInputRow}>
            <TextInput
              style={styles.targetInput}
              value={targetScore}
              onChangeText={inputValue =>
                setTargetScore(sanitizeNumericInput(inputValue))
              }
              keyboardType="numeric"
            />
            <Text style={styles.targetUnit}>kruków (domyślnie 100)</Text>
          </View>
        </GlassCard>

        {/* Players list setup */}
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeaderBetween}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Users size={20} color={COLORS.dreamCyan} />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>
                Lista Graczy ({playerInputs.length})
              </Text>
            </View>

            <TouchableOpacity style={styles.addPlayerBtn} onPress={handleAddPlayer}>
              <UserPlus size={16} color={COLORS.dreamCyan} style={{ marginRight: 4 }} />
              <Text style={styles.addPlayerBtnText}>Dodaj Gracza</Text>
            </TouchableOpacity>
          </View>

          {playerInputs.map((name, index) => (
            <View key={`player_input_${index}`} style={styles.playerInputRow}>
              <View
                style={[
                  styles.avatarBadge,
                  {
                    backgroundColor:
                      COLORS.playerColors[index % COLORS.playerColors.length],
                  },
                ]}
              >
                <Text style={styles.avatarText}>
                  {name.trim() ? name.trim().charAt(0).toUpperCase() : '?'}
                </Text>
              </View>

              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={text => handleUpdateName(index, text)}
                placeholder={`Nick gracza ${index + 1}`}
                placeholderTextColor={COLORS.textMuted}
              />

              {playerInputs.length > 2 && (
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemovePlayer(index)}
                >
                  <Trash2 size={18} color={COLORS.dangerRed} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </GlassCard>

        {/* Quick Saved Players Picker */}
        {savedPlayers.length > 0 && (
          <GlassCard style={styles.sectionCard}>
            <Text style={styles.savedTitle}>Szybki Wybór Zapisanych Graczy:</Text>
            <View style={styles.savedChipsRow}>
              {savedPlayers.map(savedPlayer => {
                const isSelected = isSavedPlayerSelected(savedPlayer.name);
                return (
                  <TouchableOpacity
                    key={savedPlayer.id}
                    style={[styles.chip, isSelected ? styles.chipSelected : null]}
                    onPress={() => handleSelectSavedPlayer(savedPlayer.name)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[styles.chipDot, { backgroundColor: savedPlayer.color }]}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        isSelected
                          ? { color: COLORS.moonGold, fontWeight: '800' }
                          : null,
                      ]}
                    >
                      {savedPlayer.name}
                    </Text>
                    {isSelected && (
                      <Check
                        size={14}
                        color={COLORS.moonGold}
                        style={{ marginLeft: 4 }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>
        )}

        {/* Start Game Button */}
        <TouchableOpacity
          style={styles.startBtn}
          onPress={handleStartGame}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.moonButton}
            style={styles.startGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Play size={22} color="#000" fill="#000" style={{ marginRight: 8 }} />
            <Text style={styles.startBtnText}>Rozpocznij Senne Liczenie</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  targetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  targetInput: {
    width: 80,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.moonGold,
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    marginRight: 12,
  },
  targetUnit: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  addPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  addPlayerBtnText: {
    color: COLORS.dreamCyan,
    fontSize: 12,
    fontWeight: '700',
  },
  playerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  nameInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bgGlassBorder,
    color: COLORS.textPrimary,
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  removeBtn: {
    padding: 10,
    marginLeft: 4,
  },
  savedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  savedChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipSelected: {
    borderColor: COLORS.moonGold,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  chipText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  startBtn: {
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: COLORS.moonGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '900',
  },
});
