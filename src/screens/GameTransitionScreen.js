import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GameTransitionScreen({ 
    onFinish,
    roundName, 
}) {
    useEffect(() => {
        // Startet den 3-Sekunden-Timer beim Laden der Komponente
        const timer = setTimeout(() => {
            if (onFinish) {
                onFinish();
            }
        }, 3000);

        // Säubert den Timer, falls der Screen vorzeitig verlassen wird
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <Text style={styles.text}>
                    {roundName.toUpperCase()}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
    text: {
        color: '#000000',
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});