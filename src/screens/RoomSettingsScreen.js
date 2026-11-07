import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Animated, Easing, Modal } from 'react-native';
import { COLOR_OPTIONS } from '../constants/colors';
import { playClickSound } from '../constants/sounds';
import { useLanguage } from '../constants/translations';
import ConfirmationScreen from './ConfirmationScreen';

const MIN_PLAYERS = 3; // Host + mindestens zwei weitere Spieler

export default function RoomSettingsScreen({
    players,          // [{ name, color, isHost }]
    ownPlayerIndex = 0,
    onChangeColor,    // (color) => void, ändert die Farbe des eigenen Spielers
    onStart,
    onLeave,
}) {
    const { t } = useLanguage();
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

    // So viele "Warte auf Spieler"-Boxen, bis die Mindestanzahl erreicht ist
    const waitingSlots = Math.max(0, MIN_PLAYERS - players.length);
    const canStart = players.length >= MIN_PLAYERS;

    const takenColors = players
        .filter((_, index) => index !== ownPlayerIndex)
        .map((player) => player.color);

    return (
        <View style={styles.screenContainer}>
            <View style={styles.card}>
                <Text style={styles.sectionTitle}>{t('room.title')}</Text>

                <View style={styles.playerList}>
                    {players.map((player, index) => {
                        const isOwn = index === ownPlayerIndex;
                        return (
                            <View key={index} style={styles.playerBox}>
                                <View style={styles.playerTextGroup}>
                                    <Text style={styles.playerName} numberOfLines={1}>{player.name}</Text>
                                    {player.isHost && (
                                        <Text style={styles.playerSubtitle}>{t('room.host')}</Text>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={[styles.colorCircle, { backgroundColor: player.color }]}
                                    activeOpacity={0.7}
                                    disabled={!isOwn}
                                    onPress={() => {
                                        playClickSound();
                                        setShowColorPicker(true);
                                    }}
                                />
                            </View>
                        );
                    })}

                    {Array.from({ length: waitingSlots }, (_, index) => (
                        <View key={`waiting-${index}`} style={[styles.playerBox, styles.waitingBox]}>
                            <Text style={styles.waitingText}>{t('room.waiting')}</Text>
                            <ActivityIndicator size="small" color="#3799d1" />
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.btn, styles.btnPrimary, { marginTop: 10 }, !canStart && styles.btnDisabled]}
                    activeOpacity={0.8}
                    disabled={!canStart}
                    onPress={() => {
                        playClickSound();
                        onStart();
                    }}
                >
                    <Text style={styles.btnPrimaryText}>{t('room.start')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary]}
                    activeOpacity={0.8}
                    onPress={() => {
                        playClickSound();
                        setShowLeaveConfirm(true);
                    }}
                >
                    <Text style={styles.btnSecondaryText}>{t('room.leave')}</Text>
                </TouchableOpacity>
            </View>

            {showLeaveConfirm && (
                <ConfirmationScreen
                    title={t('room.leaveTitle')}
                    message={t('room.leaveMessage')}
                    onYes={() => {
                        setShowLeaveConfirm(false);
                        onLeave();
                    }}
                    onNo={() => setShowLeaveConfirm(false)}
                />
            )}

            {showColorPicker && (
                <ColorPicker
                    selectedColor={players[ownPlayerIndex]?.color}
                    takenColors={takenColors}
                    onSelect={(color) => {
                        onChangeColor(color);
                        setShowColorPicker(false);
                    }}
                    onClose={() => setShowColorPicker(false)}
                />
            )}
        </View>
    );
}

// Popup zur Farbauswahl; von anderen Spielern belegte Farben sind ausgegraut
function ColorPicker({ selectedColor, takenColors, onSelect, onClose }) {
    const { t } = useLanguage();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 250,
                easing: Easing.out(Easing.back(1.5)),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleClose = (action) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 0.8, duration: 150, useNativeDriver: true }),
        ]).start(() => action());
    };

    const renderRow = (colors) => (
        <View style={styles.colorRow}>
            {colors.map((color) => {
                const isTaken = takenColors.includes(color);
                return (
                    <TouchableOpacity
                        key={color}
                        disabled={isTaken}
                        style={[
                            styles.pickerCircle,
                            { backgroundColor: color },
                            selectedColor === color && styles.pickerCircleSelected,
                            isTaken && styles.pickerCircleDisabled,
                        ]}
                        onPress={() => {
                            playClickSound();
                            handleClose(() => onSelect(color));
                        }}
                    >
                        {isTaken && <Text style={styles.crossText}>✕</Text>}
                    </TouchableOpacity>
                );
            })}
        </View>
    );

    return (
        <Modal
            visible
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={() => handleClose(onClose)}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
                    <Text style={styles.modalTitle}>{t('setup.color')}</Text>

                    <View style={{ gap: 12, marginVertical: 10, width: '100%' }}>
                        {renderRow(COLOR_OPTIONS.slice(0, 4))}
                        {renderRow(COLOR_OPTIONS.slice(4, 8))}
                    </View>

                    <TouchableOpacity
                        style={[styles.btn, styles.btnSecondary, { marginTop: 15, width: '100%' }]}
                        activeOpacity={0.8}
                        onPress={() => {
                            playClickSound();
                            handleClose(onClose);
                        }}
                    >
                        <Text style={styles.btnSecondaryText}>{t('common.back')}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
  screenContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  playerList: {
    gap: 12,
  },
  playerBox: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  playerTextGroup: {
    flex: 1,
    marginRight: 12,
  },
  playerName: {
    color: '#1c1c1e',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playerSubtitle: {
    color: '#3799d1',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  colorCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  waitingBox: {
    borderStyle: 'dashed',
    borderColor: '#c7c7cc',
  },
  waitingText: {
    color: '#8a99ad',
    fontSize: 15,
    fontWeight: '600',
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
  btnDisabled: {
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 8,
    textAlign: 'center',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  pickerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCircleSelected: {
    borderWidth: 3,
    borderColor: '#1c1c1e',
    transform: [{ scale: 1.1 }],
  },
  pickerCircleDisabled: {
    opacity: 0.35,
  },
  crossText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
