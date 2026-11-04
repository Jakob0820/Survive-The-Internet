import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SERVER_URL } from '../constants/config';
import { playClickSound } from '../constants/sounds';
import { useLanguage } from '../constants/translations';

export default function MainScreen ({
  online,
  local,
  options,
})

{
  const { t } = useLanguage();

  async function testPing() {
    try {
      const res = await fetch(`${SERVER_URL}/ping`);
      const data = await res.json();
      Alert.alert('Server sagt', data.message);
    } catch (err) {
      Alert.alert('Fehler', String(err));
    }
  }

  async function testAnswer() {
    try {
      await fetch(`${SERVER_URL}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: 'Spieler 1', text: 'Hallo Server!' }),
      });
      Alert.alert('Gesendet', 'Schau ins Server-Terminal');
    } catch (err) {
      Alert.alert('Fehler', String(err));
    }
  }

  return (
          <View style={styles.screenContainer}>
            {/* Titel-Header */}
            <View style={styles.header}>
              <Text style={styles.title}>{'SURVIVE THE\nINTERNET'}</Text>
              <Text style={styles.subtitle}>GOONER EDITION</Text>
            </View>
  
            {/* Menü-Karte mit Buttons */}
            <View style={styles.card}>
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                activeOpacity={0.8}
                onPress={ () => {
                  local();
                  playClickSound();
                }}
              >
                <Text style={styles.btnPrimaryText}>{t('main.local')}</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={[styles.btn, styles.btnPrimary]}
                activeOpacity={0.8}
                onPress={ () => {
                  online();
                  playClickSound();
                }}
              >
                <Text style={styles.btnPrimaryText}>{t('main.online')}</Text>
              </TouchableOpacity>
  
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                activeOpacity={0.8}
                onPress={ () => {
                  options();
                  playClickSound();
                }}
              >
                <Text style={styles.btnSecondaryText}>{t('main.options')}</Text>
              </TouchableOpacity>
              {/*Server Test*/}
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={testPing} 
              >
                <Text style={styles.btnSecondaryText}>Server testen</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.btn, styles.btnSecondary]}
                onPress={testAnswer}

              >
                <Text style={styles.btnSecondaryText}>Antwort senden</Text>
              </TouchableOpacity>
            </View>
          </View>
    )
}
const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  screenContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 45,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#ffffff',
    letterSpacing: 3,
    fontWeight: '700',
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
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
})