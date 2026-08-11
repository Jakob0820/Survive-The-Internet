import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function GameSettingsScreen({
    isOnline,
    duration,
    setDuration,
    playerCount,
    setPlayerCount,
    onNextCreate,
    onNextJoin,
    onNext,
    onBack,
}) {
    return (
        <View style={styles.screenContainer}>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Einstellungen</Text>

                <View style={styles.optionRow}>
                    <Text style={styles.optionLabel}>Rundendauer</Text>
                    <Text style={styles.optionValue}>{duration} Sek.</Text>
                </View>

                <View style={styles.durationBarContainer}>
                    <TouchableOpacity
                    style={styles.durationBtn}
                    onPress={() => setDuration(Math.max(10, duration - 10))}
                    >
                        <Text style={styles.durationBtnText}>-</Text>
                    </TouchableOpacity>
                
                    <View style={styles.durationTrack}>
                    <View style={[styles.durationFill, { width: `${Math.min(100, (duration / 120) * 100)}%` }]} />
                    </View>
                
                    <TouchableOpacity
                    style={styles.durationBtn}
                    onPress={() => setDuration(Math.min(120, duration + 10))}
                    >
                    <Text style={styles.durationBtnText}>+</Text>
                    </TouchableOpacity>
                </View>

                {!isOnline && (
                    <View style={styles.optionRow}>
                        <Text style={styles.optionLabel}>Spieleranzahl</Text>
                    
                        <View style={styles.playerControlGroup}>
                        <TouchableOpacity
                        style={styles.playerBtn}
                        onPress={() => setPlayerCount(Math.max(3, playerCount - 1 ))}
                        >
                            <Text style={styles.optionLabel}>{"<"}</Text> 
                        </TouchableOpacity>
                        <Text style={styles.optionValue}>{playerCount}</Text>
                        <TouchableOpacity
                        style={styles.playerBtn}
                        onPress={() => setPlayerCount(Math.min(8, playerCount + 1 ))}
                        >
                            <Text style={styles.optionLabel}>{">"}</Text> 
                        </TouchableOpacity>
                        </View>
                    </View>
                )}

                {isOnline && (
                    <View>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, { marginTop: 15}]}
                        activeOpacity={0.8}
                        onPress={onNextCreate}
                    >
                        <Text style={styles.btnPrimaryText}>RAUM ERSTELLEN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, { marginTop: 20}]}
                        activeOpacity={0.8}
                        onPress={onNextJoin}
                    >
                        <Text style={styles.btnPrimaryText}>RAUM BEITRETEN</Text>
                    </TouchableOpacity>
                    </View>
                )}

                {!isOnline && (
                    <View>
                        <TouchableOpacity
                            style={[styles.btn, styles.btnPrimary, { marginTop: 5}]}
                            activeOpacity={0.8}
                            onPress={onNext}
                        >
                            <Text style={styles.btnPrimaryText}>WEITER</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary, { marginTop: 5}]}
                    activeOpacity={0.8}
                    onPress={onBack}
                >
                    <Text style={styles.btnSecondaryText}>HAUPTMENÜ</Text>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c1c1e',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
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
  durationBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  durationBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#e5e5ea',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBtnText: {
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  durationTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e5ea',
    borderRadius: 4,
    overflow: 'hidden',
  },
  durationFill: {
    height: '100%',
    backgroundColor: '#3799d1',
  },
  playerControlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#e5e5ea',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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