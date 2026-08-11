import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { COLOR_OPTIONS } from '../constants/colors';

export default function PlayerSetupScreen({
  currentPlayerIndex,
  playerCount,
  playerName,
  setPlayerName,
  players,
  selectedColor,
  setSelectedColor,
  onNext,
  onPrev,
})
{
    return(
        <View style={styles.screenContainer}>
            <View style={styles.card}>
            <Text style={styles.sectionTitle}>
                Spieler {currentPlayerIndex + 1}
            </Text>
        
            {/* Namensfeld */}
            <View style={{ marginBottom: 15 }}>
                <Text style={styles.optionLabel}>Name:</Text>
                <TextInput
                    style={styles.textInput}
                    value={playerName}
                    onChangeText={setPlayerName}
                    placeholder="Namen eingeben"
                    placeholderTextColor="#8a99ad"
                    maxLength={12}
                />
            </View>
        
            {/* Farbauswahl */}
            <Text style={styles.optionLabel}>Farbe wählen:</Text>
            <View style={{ gap: 12, marginVertical: 10 }}>
                {/* Zeile 1: Erste 4 Farben */}
                <View style={styles.colorRow}>
                {COLOR_OPTIONS.slice(0, 4).map((color) => {
                    const isTaken = players.slice(0, currentPlayerIndex).some((p) => p.color === color);
                        
                    return(
                    <TouchableOpacity
                    key={color}
                    disabled={isTaken}
                    style={[
                        styles.colorCircle,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorCircleSelected,
                        isTaken && styles.colorCircleDisabled,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    >
                        {isTaken && <Text style={styles.crossText}>✕</Text>}
                    </TouchableOpacity>
                    );
                })}
                </View>
        
                {/* Zeile 2: Nächste 4 Farben */}
                <View style={styles.colorRow}>
                {COLOR_OPTIONS.slice(4, 8).map((color) => {
                const isTaken = players.slice(0, currentPlayerIndex).some((p) => p.color === color);
                        
                return (
                    <TouchableOpacity
                    key = {color}
                    disabled = {isTaken}
                    style ={[
                    styles.colorCircle,
                    {backgroundColor: color},
                    selectedColor === color && styles.colorCircleSelected,
                    isTaken && styles.colorCircleDisabled,
                    ]}
                    onPress={() => setSelectedColor(color)}
                    >
                    {isTaken && <Text style={styles.crossText}>✕</Text>}
                    </TouchableOpacity>
                )
                })}
                </View>
            </View>
        
            <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { marginTop: 20 }]}
                activeOpacity={0.8}
                onPress={onNext}
            >
                <Text style={styles.btnPrimaryText}>
                {currentPlayerIndex < playerCount - 1 ? 'NÄCHSTER SPIELER ▶' : 'SPIEL STARTEN '}
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.btn, styles.btnPrimary, { marginTop: 5 }]}
                activeOpacity={0.8}
                onPress={onPrev}
            >
                <Text style={styles.btnPrimaryText}>
                {currentPlayerIndex < playerCount - 1 ? 'ZURÜCK' : '◀ VORHERIGER SPIELER'}
                </Text>
            </TouchableOpacity>
            </View>
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
  optionLabel: {
    color: '#1c1c1e',
    fontSize: 16,
    fontWeight: '600',
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
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  colorCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#1c1c1e',
    transform: [{ scale: 1.1 }],
  },
  colorCircleDisabled: {
    opacity: 0.35, // Macht belegte Farben leicht transparent/ausgegraut
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

});
