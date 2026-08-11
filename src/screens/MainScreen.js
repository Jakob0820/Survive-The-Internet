import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';

export default function MainScreen ({
  online,
  local,
  options,
}) 
{
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
                  onPress={local}
                >
                  <Text style={styles.btnPrimaryText}>▶   LOKALES SPIEL</Text>
                </TouchableOpacity>
    
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary]}
                  activeOpacity={0.8}
                  onPress={online}
                >
                  <Text style={styles.btnPrimaryText}>▶   ONLINE</Text>
                </TouchableOpacity>
    
                <TouchableOpacity
                  style={[styles.btn, styles.btnSecondary]}
                  activeOpacity={0.8}
                  onPress={options}
                >
                  <Text style={styles.btnSecondaryText}>⚙   OPTIONEN</Text>
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