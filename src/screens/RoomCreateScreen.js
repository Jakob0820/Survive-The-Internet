import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, Easing, Modal } from 'react-native';
import Slider from '@react-native-community/slider';
import { playClickSound, playSliderHaptic } from '../constants/sounds';
import { useLanguage } from '../constants/translations';
import RoundSelectionScreen from './RoundSelectionScreen';

export default function RoomCreateScreen({
    isCreated = false, // true: Raum existiert bereits -> Name & "Raum erstellen" ausblenden
    onCreate,
    onClose,
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
}) {
  const { t } = useLanguage();
  const [showRoundSelection, setShowRoundSelection] = useState(false);

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

  const canCreate = playerName.trim().length > 0;

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
        <Text style={styles.title}>{t('settings.title')}</Text>

        {/* Namensfeld (nur vor dem Erstellen des Raums) */}
        {!isCreated && (
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
        )}

        {/* Rundendauer */}
        <View style={styles.optionRow}>
          <Text style={styles.optionLabel}>{t('settings.roundDuration')}</Text>
          <Text style={styles.optionValue}>
            {duration === 0 ? t('settings.unlimited') : t('settings.seconds', { seconds: duration })}
          </Text>
        </View>

        <View style={styles.durationBarContainer}>
          <Slider
            style={{ flex: 1, height: 36 }}
            minimumValue={60}
            maximumValue={130}
            step={10}
            value={duration === 0 ? 130 : duration}
            onValueChange={(value) => {
              const newDuration = value === 130 ? 0 : value;
              if (newDuration !== duration) playSliderHaptic();
              setDuration(newDuration);
            }}
            minimumTrackTintColor="#3799d1"
            maximumTrackTintColor="#e5e5ea"
            thumbTintColor="#3799d1"
          />
        </View>

        {/* Spielmodus */}
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          activeOpacity={0.8}
          onPress={() => {
            playClickSound();
            setShowRoundSelection(true);
          }}
        >
          <Text style={styles.btnPrimaryText}>{t('settings.gameMode')}</Text>
        </TouchableOpacity>

        {/* Raum erstellen (nur vor dem Erstellen des Raums) */}
        {!isCreated && (
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary, { marginTop: 12 }, !canCreate && styles.btnDisabled]}
          activeOpacity={0.8}
          disabled={!canCreate}
          onPress={() => {
            playClickSound();
            handleClose(onCreate);
          }}
        >
          <Text style={styles.btnPrimaryText}>{t('settings.createRoom')}</Text>
        </TouchableOpacity>
        )}

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

    {showRoundSelection && (
      <RoundSelectionScreen
        onNext={() => {
          setShowRoundSelection(false);
          playClickSound();
        }}
        roundNames={roundNames}
        roundColors={roundColors}
        randomRounds={randomRounds}
        setRandomRounds={setRandomRounds}
        roundLogos={roundLogos}
        selectedRounds={selectedRounds}
        setSelectedRounds={setSelectedRounds}
        roundLength={roundLength}
        setRoundLength={setRoundLength}
      />
    )}
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
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
  durationBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
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
  btnDisabled: {
    opacity: 0.5,
  },
});
