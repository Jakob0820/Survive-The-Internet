import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated, Easing, Modal } from 'react-native';
import { playClickSound } from '../constants/sounds';
import { LANGUAGES, useLanguage } from '../constants/translations';

export default function LanguageSelectionScreen({ onClose }) {
  const { language, setLanguage, t } = useLanguage();

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
  const handleClose = () => {
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
      onClose();
    });
  };

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>{t('language.title')}</Text>

        {LANGUAGES.map(({ code, label }) => {
          const isActive = code === language;

          return (
            <TouchableOpacity
              key={code}
              style={[styles.btn, isActive ? styles.btnActive : styles.btnInactive]}
              activeOpacity={0.8}
              onPress={() => {
                playClickSound();
                setLanguage(code);
                handleClose();
              }}
            >
              <Text style={isActive ? styles.btnActiveText : styles.btnInactiveText}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
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
    gap: 12,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  btn: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: '#3799d1',
  },
  btnActiveText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  btnInactive: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  btnInactiveText: {
    color: '#1c1c1e',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
