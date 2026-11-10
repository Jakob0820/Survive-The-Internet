import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, Easing, Modal, Pressable } from 'react-native';
import { playClickSound, playSliderHaptic } from '../constants/sounds';
import { useLanguage } from '../constants/translations';

const CODE_LENGTH = 4;

export default function RoomJoinScreen({
    onJoin,
    onClose,
    playerName,
    setPlayerName,
    roomCode,
    setRoomCode,
}) {
    const { t } = useLanguage();
    const [codeFocused, setCodeFocused] = useState(false);
    const codeInputRef = useRef(null);
    const [error, setError] = useState('');
    const [joining, setJoining] = useState(false);

    // Fehlermeldung ausblenden, sobald Name oder Code geändert werden
    useEffect(() => {
        setError('');
    }, [playerName, roomCode]);

    const handleJoin = async () => {
        setError('');
        setJoining(true);
        const response = await onJoin();
        // Bei Erfolg wechselt App.js den Screen, dieses Popup verschwindet dann von selbst
        if (!response?.ok) {
            setJoining(false);
            setError(response?.error ?? 'Unbekannter Fehler');
        }
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Beim Öffnen sanft einblenden und vergrößern
        Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.back(1.5)), // Leichter Bounce-Effekt
            useNativeDriver: true,
        }),
        ]).start();
    }, []);

    // Animation zum Schließen ausführen, bevor die Callback-Funktion aufgerufen wird
    const handleClose = (action) => {
        Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 150,
            useNativeDriver: true,
        }),
        ]).start(() => {
        action();
        });
    };

    const canCreate = playerName.trim().length > 0 && roomCode.trim().length == 4 && !joining;

    return(
        <Modal
            visible
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={() => handleClose(onClose)}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
                    <Text style={styles.title}>{t('settings.joinRoom')}</Text>

                    <View style={styles.section}>
                        <Text style={styles.optionLabel}>{t('setup.name')}</Text>
                        <TextInput
                        style={styles.textInput}
                        value={playerName}
                        onChangeText={setPlayerName}
                        placeholder={t('setup.namePlaceholder')}
                        placeholderTextColor="#8a99ad"
                        maxLength={12}
                        />
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.optionLabel}>{t('room.code')}</Text>
                        {/* Vier Kästchen für den Raumcode. Ein Tippen darauf fokussiert ein
                            unsichtbares TextInput, das die Eingabe entgegennimmt. Angezeigt wird
                            nur der bereits umgewandelte Wert, daher sieht man keine Kleinbuchstaben. */}
                        <View style={styles.codeContainer}>
                            <Pressable style={styles.codeBoxRow} onPress={() => codeInputRef.current?.focus()}>
                                {Array.from({ length: CODE_LENGTH }, (_, index) => {
                                    const isActive = codeFocused && index === Math.min(roomCode.length, CODE_LENGTH - 1);
                                    return (
                                        <View key={index} style={[styles.codeBox, isActive && styles.codeBoxActive]}>
                                            <Text style={styles.codeBoxText}>{roomCode[index] ?? ''}</Text>
                                        </View>
                                    );
                                })}
                            </Pressable>
                            <TextInput
                                ref={codeInputRef}
                                style={styles.hiddenCodeInput}
                                value={roomCode}
                                // Nur Buchstaben zulassen und direkt in Großbuchstaben umwandeln
                                onChangeText={(text) => setRoomCode(text.toUpperCase().replace(/[^A-Z]/g, '').slice(0, CODE_LENGTH))}
                                onFocus={() => setCodeFocused(true)}
                                onBlur={() => setCodeFocused(false)}
                                maxLength={CODE_LENGTH}
                                autoCapitalize="characters"
                                autoCorrect={false}
                                autoComplete="off"
                                spellCheck={false}
                                caretHidden
                                contextMenuHidden
                                pointerEvents="none"
                            />
                        </View>
                    </View>
                    {/* Fehlermeldung vom Server */}
                    <Text style={styles.errorText}>{error}</Text>

                    {/*Raum beitreten*/}
                    <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, { marginTop: 12 }, !canCreate && styles.btnDisabled]}
                        activeOpacity={0.8}
                        disabled={!canCreate}
                        onPress={() => {
                        playClickSound();
                        handleJoin();
                        }}
                    >
                        <Text style={styles.btnPrimaryText}>{t('settings.joinRoom')}</Text>
                    </TouchableOpacity>
                    {/* Zurück */}
                    <TouchableOpacity
                        style={[styles.btn, styles.btnSecondary, { marginTop: 12 }]}
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

const styles = StyleSheet.create ({
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
    // Schatten für iOS & Android
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1c1e',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    width: '100%',
    gap: 8,
    marginBottom: 10,
  },
  optionLabel: {
    color: '#1c1c1e',
    fontSize: 16,
    fontWeight: '600',
  },
  optionValue: {
    color: '#3799d1',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1c1c1e',
    fontWeight: '600',
  },
  codeContainer: {
    position: 'relative',
  },
  codeBoxRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  codeBox: {
    width: 46,
    height: 46,
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxActive: {
    borderColor: '#3799d1',
    borderWidth: 2,
  },
  codeBoxText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1e',
  },
  // Unsichtbar und nicht antippbar; die Kästchen fokussieren es per ref
  hiddenCodeInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
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
  errorText: {
    minHeight: 20,
    color: '#d40e0e',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.5,
  },
})