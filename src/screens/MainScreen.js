import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { use, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
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

  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState('');

  useEffect(() => {
    const s = io(SERVER_URL, { transports: ['websocket'] });

    s.on('connect', () => {
      console.log('Socket verbunden:', s.id);
    }),
    s.on('message', (msg) => {
      setLastMessage(`${msg.from.slice(0, 4)}: ${msg.text}`);
    });

    setSocket(s);
    return () => {
      s.disconnect();   // Verbindung trennen, wenn der Screen verschwindet
    }
  }, []);

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
              {/* Socket-Test */}
              <TouchableOpacity
                style={[styles.btn, styles.btnSecondary]}
                onPress={() => (
                  socket?.emit('message', 'Hallo von der App!',
                ))}
              >
                <Text style={styles.btnSecondaryText}>Socket senden</Text>
              </TouchableOpacity>
              <Text style={styles.btnSecondaryText}>{lastMessage}</Text>
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