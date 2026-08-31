import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Animated,
    SafeAreaView,
} from 'react-native';

export default function EvaluationScreen({ 
    onShowResult,
    players, 
    playerCount,
    currentPlayerIndex,
    onNext,
    answerText,
    questionText,
}) {

    const [showResult, setShowResult] = useState(false);

    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.9)).current;

    const resultOpacity = useRef(new Animated.Value(0)).current;
    const resultScale = useRef(new Animated.Value(1.05)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(cardScale, {
                toValue: 1,
                friction: 7,
                tension: 50,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleShowResult = () => {
        setShowResult(true);

        Animated.parallel([
            Animated.timing(resultOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.timing(resultScale, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    };

    if (showResult) {
        return (
            <View style={styles.resultContainer}>
                <Animated.View
                    style={[
                        styles.resultScreen,
                        {
                            opacity: resultOpacity,
                            transform: [{ scale: resultScale }],
                        },
                    ]}
                >
                    <SafeAreaView style={styles.resultContent}>
                        <Text style={styles.resultText}>
                            Ergebnis
                        </Text>
                    </SafeAreaView>
                </Animated.View>
            </View>
        );
    }

    return (
        <View style={styles.screenContainer}>
            <Animated.View
                style={[
                    styles.card,
                    {
                        opacity: cardOpacity,
                        transform: [{ scale: cardScale }],
                    },
                ]}
            >
                <Text style={styles.evaluatingText}>
                    Auswertung
                </Text>

                <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary]}
                    activeOpacity={0.8}
                    onPress={handleShowResult}
                >
                    <Text style={styles.btnText}>ERGEBNIS ANZEIGEN</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({

    screenContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 350,
    },

    card: {
        width: '75%',
        maxWidth: 300,
        minHeight: 180,

        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,

        padding: 28,

        justifyContent: 'space-between',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
    },

    evaluatingText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1c1c1e',
        textAlign: 'center',
        letterSpacing: 2,
    },

    btn: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnSecondary: {
        backgroundColor: '#3799d1',
        borderWidth: 1,
        borderColor: '#e5e5ea',
        marginTop: 'auto',
    },
    btnText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
        textAlign: 'center',
    },

    resultContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: '#ffffff',

        justifyContent: 'center',
        alignItems: 'center',
    },

    resultScreen: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: '#ffffff',
    },
});