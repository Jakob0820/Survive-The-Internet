import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useLanguage } from '../constants/translations';

// Online: Alle Kommentare sind abgeschickt. Die Auswertung läuft nur auf dem Host-Gerät,
// alle anderen Spieler sehen so lange diesen Screen.
export default function EvaluationWaitingScreen({
    playerColor = '#1c1c1e',
}) {
    const { t } = useLanguage();
    const { width: screenWidth } = useWindowDimensions();

    return (
        <View style={styles.screenContainer}>
            <View style={[styles.card, { width: screenWidth * 0.9 }]}>
                <ActivityIndicator size="large" color={playerColor} />
                <Text style={styles.waitingText}>{t('evaluation.waitForHost')}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        paddingVertical: 30,
        flex: 1,
    },
    card: {
        maxWidth: 400,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        padding: 28,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },
    waitingText: {
        color: '#8a99ad',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
