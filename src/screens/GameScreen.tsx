import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { COLORS, GRADIENTS } from '../theme/theme';
import { Header } from '../components/Header';
import { PlayerScoreCard } from '../components/PlayerScoreCard';
import { RoundControlBanner } from '../components/RoundControlBanner';
import { RoundHistory } from '../components/RoundHistory';
import { GameMasterModal } from '../components/GameMasterModal';
import { RankingModal } from '../components/RankingModal';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getPlayerStats,
  getStartingPlayerIdForRound,
  getTurnOrder,
  calculateRoundScoresWithWakeUp,
  parseNonNegativeScore,
  sanitizeNumericInput,
} from '../utils/gameUtils';
import { CheckCircle } from 'lucide-react-native';

interface GameScreenProps {
  onBackToHome: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBackToHome }) => {
  const {
    currentGame,
    submitRound,
    editRoundScore,
    deletePlayerFromGame,
    deleteCurrentGame,
    rematchSamePlayers,
    updateGameSettings,
  } = useGame();

  const [roundInputs, setRoundInputs] = useState<Record<string, string>>({});
  const [customStarterId, setCustomStarterId] = useState<string | undefined>(undefined);
  const [wakeUpCallerId, setWakeUpCallerId] = useState<string | undefined>(undefined);
  const [showGameMasterModal, setShowGameMasterModal] = useState<boolean>(false);

  useEffect(() => {
    if (currentGame) {
      const emptyInputs: Record<string, string> = {};
      currentGame.players.forEach(player => {
        emptyInputs[player.id] = '';
      });
      setRoundInputs(emptyInputs);
      setCustomStarterId(undefined);
      setWakeUpCallerId(undefined);
    }
  }, [currentGame?.id, currentGame?.rounds.length]);

  if (!currentGame) {
    return (
      <View style={styles.container}>
        <Header title="GRA" onBack={onBackToHome} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Brak aktywnej gry.</Text>
          <TouchableOpacity style={styles.backBtn} onPress={onBackToHome}>
            <Text style={styles.backBtnText}>Powrót do Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentRoundNumber = currentGame.rounds.length + 1;
  const playerStats = getPlayerStats(currentGame);
  const leaderStat = currentGame.rounds.length > 0 ? playerStats[0] : undefined;

  const activeStarterId = getStartingPlayerIdForRound(
    currentGame,
    currentGame.rounds.length,
    customStarterId
  );
  const turnOrders = getTurnOrder(currentGame.players, activeStarterId);
  const starterPlayer = currentGame.players.find(
    player => player.id === activeStarterId
  );

  const rawScores: Record<string, number> = {};
  currentGame.players.forEach(player => {
    rawScores[player.id] = parseNonNegativeScore(roundInputs[player.id]);
  });
  const liveCalculation = calculateRoundScoresWithWakeUp(
    rawScores,
    currentGame.players,
    wakeUpCallerId
  );

  const handleInputChange = (playerId: string, inputValue: string) => {
    const sanitizedValue = sanitizeNumericInput(inputValue);
    setRoundInputs(previousInputs => ({
      ...previousInputs,
      [playerId]: sanitizedValue,
    }));
  };

  const handleCycleStarterPlayer = () => {
    const currentIndex = currentGame.players.findIndex(
      player => player.id === activeStarterId
    );
    const nextIndex = (currentIndex + 1) % currentGame.players.length;
    setCustomStarterId(currentGame.players[nextIndex].id);
  };

  const handleToggleWakeUpCaller = (playerId: string) => {
    setWakeUpCallerId(previousCallerId =>
      previousCallerId === playerId ? undefined : playerId
    );
  };

  const handleSubmitRound = async () => {
    const scoresToSubmit: Record<string, number> = {};
    currentGame.players.forEach(player => {
      scoresToSubmit[player.id] = parseNonNegativeScore(roundInputs[player.id]);
    });

    await submitRound(scoresToSubmit, activeStarterId, wakeUpCallerId);

    const resetInputs: Record<string, string> = {};
    currentGame.players.forEach(player => {
      resetInputs[player.id] = '';
    });
    setRoundInputs(resetInputs);
    setCustomStarterId(undefined);
    setWakeUpCallerId(undefined);
  };

  const handleRematch = async () => {
    await rematchSamePlayers();
  };

  const handleExitFinishedGame = async () => {
    await deleteCurrentGame();
    onBackToHome();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title={`RUNDA #${currentRoundNumber}`}
        subtitle={`Limit: ${currentGame.targetScore} kruków`}
        onBack={onBackToHome}
        showGMButton
        onOpenGM={() => setShowGameMasterModal(true)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <RoundControlBanner
          players={currentGame.players}
          leaderStat={leaderStat}
          starterPlayer={starterPlayer}
          wakeUpCallerId={wakeUpCallerId}
          onOpenGameMaster={() => setShowGameMasterModal(true)}
          onCycleStarterPlayer={handleCycleStarterPlayer}
          onSelectWakeUpCaller={setWakeUpCallerId}
        />

        <Text style={styles.sectionHeaderTitle}>
          Kruki w śnie w Rundzie #{currentRoundNumber}:
        </Text>

        {currentGame.players.map(player => {
          const playerStat = playerStats.find(stat => stat.player.id === player.id);
          const turnInfo = turnOrders.find(order => order.player.id === player.id);
          const isCaller = player.id === wakeUpCallerId;

          return (
            <PlayerScoreCard
              key={player.id}
              player={player}
              totalScore={playerStat?.totalScore || 0}
              targetScore={currentGame.targetScore}
              currentRoundInput={roundInputs[player.id] || ''}
              onChangeInput={inputValue => handleInputChange(player.id, inputValue)}
              rank={playerStat?.rank}
              isLeader={Boolean(playerStat?.isWinner && currentGame.rounds.length > 0)}
              isStarter={turnInfo?.isStarter}
              turnOrderNumber={turnInfo?.orderNumber}
              onSetStarter={() => setCustomStarterId(player.id)}
              isWakeUpCaller={isCaller}
              onToggleWakeUpCaller={() => handleToggleWakeUpCaller(player.id)}
              calculatedRoundPoints={liveCalculation.finalScores[player.id]}
              wakeUpResultInfo={isCaller ? liveCalculation.callerResult : undefined}
            />
          );
        })}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmitRound}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.moonButton}
            style={styles.submitGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <CheckCircle size={22} color="#000" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>
              Zatwierdź Rundę #{currentRoundNumber}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <RoundHistory game={currentGame} onEditRound={editRoundScore} />
      </ScrollView>

      <GameMasterModal
        visible={showGameMasterModal}
        game={currentGame}
        onClose={() => setShowGameMasterModal(false)}
        onSaveSettings={updateGameSettings}
        onDeletePlayer={deletePlayerFromGame}
        onDeleteGame={async () => {
          await deleteCurrentGame();
          onBackToHome();
        }}
      />

      <RankingModal
        visible={currentGame.isFinished}
        game={currentGame}
        onRematch={handleRematch}
        onExitToMenu={handleExitFinishedGame}
      />
    </KeyboardAvoidingView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: COLORS.moonGold,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  backBtnText: {
    color: '#000',
    fontWeight: '800',
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dreamCyan,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  submitBtn: {
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 14,
    shadowColor: COLORS.moonGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
  },
});
