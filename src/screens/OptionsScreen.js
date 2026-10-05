import { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
import { useAudioPlayer, setAudioModeAsync } from 'expo-audio';
import Slider from '@react-native-community/slider';

export default function OptionsScreen({
    volume,
    setVolume,
    soundEnabled,
    setSoundEnabled,
    musicEnabled,
    setMusicEnabled,
    onBack,
}) {

    const clickSound = useAudioPlayer(
      require('../../assets/clickSound.mp3'),
    )
  
    useEffect(() => {
      clickSound.play();
    }, [clickSound]);

    return (
        <View style={styles.screenContainer}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>OPTIONEN</Text>

            {/* Lautstärke Einstellung */}
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Lautstärke</Text>
              <Text style={styles.optionValue}>{volume}%</Text>
            </View>
            <View style={styles.volumeBarContainer}>
              <Slider
                style={{ flex: 1, height: 36 }}
                minimumValue={0}
                maximumValue={100}
                step={10}
                value={volume}
                onValueChange={setVolume}
                minimumTrackTintColor="#3799d1"
                maximumTrackTintColor="#e5e5ea"
                thumbTintColor="#3799d1"
              />
            </View>

            {/* Soundeffekte Toggle */}
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Soundeffekte</Text>
              <TouchableOpacity
                 activeOpacity={0.8}
                  onPress={() => setSoundEnabled(!soundEnabled)}
                  style={[
                  styles.customSwitchTrack,
                    { backgroundColor: soundEnabled ? '#3799d1' : '#e5e5ea' }
                  ]}
              >
                <View
                  style={[
                    styles.customSwitchThumb,
                    soundEnabled ? styles.switchOn : styles.switchOff
                  ]}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.optionRow}>
              <Text style={styles.optionLabel}>Musik</Text>
              <TouchableOpacity
                 activeOpacity={0.8}
                  onPress={() => setMusicEnabled(!musicEnabled)}
                  style={[
                  styles.customSwitchTrack,
                    { backgroundColor: musicEnabled ? '#3799d1' : '#e5e5ea' }
                  ]}
              >
                <View
                  style={[
                    styles.customSwitchThumb,
                    musicEnabled ? styles.switchOn : styles.switchOff
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Zurück Button */}
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, { marginTop: 20 }]}
              activeOpacity={0.8}
              onPress={onBack}
            >
              <Text style={styles.btnPrimaryText}>ZURÜCK</Text>
            </TouchableOpacity>
          </View>
        </View>
    )
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
  volumeBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  volumeBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#e5e5ea',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeBtnText: {
    color: '#1c1c1e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  volumeTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e5ea',
    borderRadius: 4,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#3799d1',
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

})