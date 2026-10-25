import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing, Modal, Image } from 'react-native';
import { playClickSound } from '../constants/sounds';
import { Ionicons } from '@expo/vector-icons';
import { preload } from 'expo-audio';

export default function ConfirmationScreen({ 
    onNext,
    roundNames,
    roundColors,
    randomRounds,
    roundLogos,
    setRandomRounds,
    setSelectedRounds,
}) {

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [modes, setModes] = useState([0,0,0,0,0,0,0,0]);
  const [sliderCount, setSliderCount] = useState(1);

  const setMode = (index, value) => setModes((prev) => prev.map((m, i) => (i === index ? value : m)));

  const changeMode = (index, delta) =>
  setMode(index, (modes[index] + delta + roundNames.length) % roundNames.length);

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

  return (
    <Modal
      visible
      transparent
      animationType="none" 
      statusBarTranslucent
      onRequestClose={() => handleClose(onNo)}
    >
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>Spielmodis</Text>

        <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>
                Zufällige Reihenfolge
            </Text>

            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                playClickSound();
                setRandomRounds(!randomRounds)
                }}
                style={[
                styles.customSwitchTrack,
                { backgroundColor: randomRounds ? '#3799d1' : '#e5e5ea' }
                ]}
            >
            <View
                style={[
                styles.customSwitchThumb,
                randomRounds ? styles.switchOn : styles.switchOff
                ]}
            />
            </TouchableOpacity>
        </View>
        {!randomRounds && (
            <View style={styles.roundCointainer}>
                {modes.slice(0, sliderCount).map((modeValue, index) => (
                <View key={index} style={styles.roundSliderRow}>
                    <TouchableOpacity
                    style={styles.roundSliderButton}
                    activeOpacity={0.7}
                    onPress={() => {
                        playClickSound();
                        changeMode(index, -1);
                    }}
                    >
                    <Ionicons name="chevron-back" size={16} color="#000000" />
                    </TouchableOpacity>

                    <View style={[styles.roundSlider, { backgroundColor: roundColors[modeValue] }]}>
                    <Image
                        source={roundLogos[modeValue]}
                        style={styles.roundSliderLogo}
                        resizeMode="contain"
                    />
                    </View>

                    <TouchableOpacity
                    style={styles.roundSliderButton}
                    activeOpacity={0.7}
                    onPress={() => {
                        playClickSound();
                        changeMode(index, 1);
                    }}
                    >
                    <Ionicons name="chevron-forward" size={16} color="#000000" />
                    </TouchableOpacity>
                </View>
                ))}

                {sliderCount < modes.length && (
                <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary, {marginTop: 10}]}
                    activeOpacity={0.8}
                    onPress={() => {
                    playClickSound();
                    setSliderCount((c) => c + 1);
                    }}
                >
                    <Ionicons name="add-circle-outline" size={18} color="#000000" />
                    <Text style={styles.btnSecondaryText}>Runde hinzufügen</Text>
                </TouchableOpacity>
                )}
            </View>
        )}
        <TouchableOpacity
            style={[styles.btn, styles.btnPrimary, { marginTop: 15}]}
            activeOpacity={0.8}
            onPress={() => {
                playClickSound();
                onNext();
                setSelectedRounds(modes.slice(0, sliderCount));
            }}
        >
            <Text style={styles.btnPrimaryText}>SPEICHERN</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
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
    alignItems: 'center',
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
    marginBottom: 15,
    textAlign: 'center',
  },
  btn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%'
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
    flexDirection: 'row',
    gap: 10,
  },
  btnSecondaryText: {
    color: '#1c1c1e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
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
    flex: 1,
  },
  customSwitchTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  customSwitchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff', // Oder ein dunkleres Blau/Dunkelblau, wenn gewünscht
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 3,
  },
  switchOn: {
    alignSelf: 'flex-end',
    backgroundColor: '#006699', // Der Knopf selbst in schönem Blau (passend zur Spur)
  },
  switchOff: {
    alignSelf: 'flex-start',
    backgroundColor: '#8a99ad',
  },
  roundCointainer: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  roundSlider: {
    height: 60,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  roundSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  roundSliderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  roundSliderLogo: {
    width: '100%',
    height: '100%',
  },
});