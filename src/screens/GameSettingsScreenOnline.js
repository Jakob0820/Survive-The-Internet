import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { playClickSound } from '../constants/sounds';
import { useLanguage } from '../constants/translations';
import RoomCreateScreen from './RoomCreateScreen';
import RoomJoinScreen from './RoomJoinScreen';

export default function GameSettingsScreenOnline({
    onNextCreate,
    onNextJoin,
    onBack,
    playerName,
    setPlayerName,
    duration,
    setDuration,
    roundColors,
    roundNames,
    randomRounds,
    setRandomRounds,
    roundLogos,
    selectedRounds,
    setSelectedRounds,
    roundLength,
    setRoundLength,
    roomCode,
    setRoomCode,
    joinMessage,       // Meldung, mit der der RoomJoinScreen direkt geöffnet wird (z. B. Raum geschlossen)
    clearJoinMessage,
}) {
    const { t } = useLanguage();
    const [showRoomCreate, setShowRoomCreate] = useState(false);
    // Wurde man aus einem Raum geworfen, direkt wieder den Beitreten-Dialog zeigen
    const [showRoomJoin, setShowRoomJoin] = useState(!!joinMessage);

    return (
        <View style={styles.screenContainer}>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>{t('settings.title')}</Text>

                <View>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, { marginTop: 15}]}
                        activeOpacity={0.8}
                        onPress={() => {
                          setShowRoomCreate(true);
                          playClickSound();
                        }}
                    >
                        <Text style={styles.btnPrimaryText}>{t('settings.createRoom')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, { marginTop: 20}]}
                        activeOpacity={0.8}
                        onPress={() => {
                          setShowRoomJoin(true);
                          playClickSound();
                        }}
                    >
                        <Text style={styles.btnPrimaryText}>{t('settings.joinRoom')}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary, { marginTop: 5}]}
                    activeOpacity={0.8}
                    onPress={() => {
                          onBack();
                          playClickSound();
                        }}
                >
                    <Text style={styles.btnSecondaryText}>{t('common.mainMenu')}</Text>
                </TouchableOpacity>
            </View>
            {showRoomCreate && (
                <RoomCreateScreen
                    isCreated={false}
                    onCreate={() => {
                        setShowRoomCreate(false);
                        onNextCreate();
                    }}
                    onClose={() => setShowRoomCreate(false)}
                    playerName={playerName}
                    setPlayerName={setPlayerName}
                    duration={duration}
                    setDuration={setDuration}
                    roundColors={roundColors}
                    roundNames={roundNames}
                    randomRounds={randomRounds}
                    setRandomRounds={setRandomRounds}
                    roundLogos={roundLogos}
                    selectedRounds={selectedRounds}
                    setSelectedRounds={setSelectedRounds}
                    roundLength={roundLength}
                    setRoundLength={setRoundLength}
                />
            )}
            {showRoomJoin && (
              <RoomJoinScreen
                onJoin={onNextJoin}
                onClose={() => {
                  setShowRoomJoin(false);
                  clearJoinMessage?.();
                }}
                initialError={joinMessage ? t(joinMessage) : ''}
                playerName={playerName}
                setPlayerName={setPlayerName}
                roomCode={roomCode}
                setRoomCode={setRoomCode}
              />
            )}
        </View>
    );
}
const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
    gap: 16,
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  btnPrimary: {
    backgroundColor: '#3799d1',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  btnSecondary: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  btnSecondaryText: {
    color: '#1c1c1e',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
