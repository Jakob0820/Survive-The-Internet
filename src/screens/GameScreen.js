GameScreen.js
import React, { useState, useEffect, useRef, useReducer } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing, useWindowDimensions, TextInput, Image } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import ConfirmationScreen from './ConfirmationScreen';
import tinycolor from 'tinycolor2';
import { Ionicons } from '@expo/vector-icons';
import { QUESTIONS } from '../constants/questions';
import { playClickSound } from '../constants/sounds';

export default function GameScreen({
    onBack,
    duration,
    players,
    playerCount,
    currentPlayerIndex,
    onNext,
    textValue,
    setTextValue,
    currentQuestion,

}) {

    const [showConfirm, setShowConfirm] = useState(false);
    const [isQuestionOpen, setIsQuestionOpen] = useState(false);

    const { height: screenHeight } = useWindowDimensions();
    const animValue = useRef(new Animated.Value(0)).current;

    const dropdownAnim = useRef(new Animated.Value(0)).current;

    const [isFocused, setIsFocused] = useState(false);
    const [inputHeight, setInputHeight] = useState(50);

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);
    const TIMER_SIZE = 52;
    const TIMER_STROKE = 4;
    const TIMER_RADIUS = (TIMER_SIZE - TIMER_STROKE) / 2;
    const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS;

    const [remaining, setRemaining] = useState(duration);
    const ringAnim = useRef(new Animated.Value(0)).current;
    const onNextRef = useRef(onNext);

    // immer die aktuelle onNext-Funktion nutzen
    useEffect(() => {
        onNextRef.current = onNext;
    }, [onNext]);

    useEffect(() => {
        if (duration === 0) return;

        let left = duration;
        setRemaining(duration);

        // Ring: eine Animation über die komplette Dauer
        ringAnim.setValue(0);
        const anim = Animated.timing(ringAnim, {
            toValue: 1,
            duration: duration * 1000,
            easing: Easing.linear,
            useNativeDriver: false, // strokeDashoffset kann nicht nativ animiert werden
        });
        anim.start();

        const interval = setInterval(() => {
            left -= 1;
            setRemaining(left);

            if (left <= 0) {
                clearInterval(interval);
                onNextRef.current();
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            anim.stop();
        };
    }, [currentPlayerIndex, duration]);

    const ringOffset = ringAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, TIMER_CIRCUMFERENCE],
    });

    useEffect(() => {
        Animated.parallel([
            Animated.timing(animValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        setIsQuestionOpen(false);

        dropdownAnim.setValue(0);

    }, [currentPlayerIndex]);

    const openQuestion = () => {
        if (isQuestionOpen) {
            return;
        } else {
            setIsQuestionOpen(true);
            Animated.timing(dropdownAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    };

    const cardWidth = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['90%', '100%'],
    });
    const cardMaxWidth = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [380, screenHeight],
    });
    const cardHeight = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['100%', '100%'],
    });


    const questionOpacity = dropdownAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });
    const arrowRotation = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const activePlayer = players[currentPlayerIndex];
    const playerName = activePlayer?.name || `Spieler ${currentPlayerIndex + 1}`;
    const playerColor = activePlayer?.color;
    const lightPlayerColor = tinycolor(playerColor).lighten(25).brighten(10).toHexString();

    return (
        
        <View style={styles.screenContainer}>
            <Animated.View
                style={[
                    styles.card,
                    {
                        width: cardWidth,
                        maxWidth: cardMaxWidth,
                    },
                ]}
            >
                <View style={styles.topContent}>
                     <View style={styles.header}>
                        <Text
                            style={[
                                styles.sectionTitle,
                                duration === 0 && styles.sectionTitleCentered,
                            ]}
                        >
                            {playerName} ist dran!
                        </Text>
                        {duration != 0 && (                                
                            <View style={styles.timer}>
                                <Svg width={TIMER_SIZE} height={TIMER_SIZE}>
                                    <Circle
                                        cx={TIMER_SIZE / 2}
                                        cy={TIMER_SIZE / 2}
                                        r={TIMER_RADIUS}
                                        stroke="rgba(0,0,0,0.1)"
                                        strokeWidth={TIMER_STROKE}
                                        fill="none"
                                    />
                                    <AnimatedCircle
                                        cx={TIMER_SIZE / 2}
                                        cy={TIMER_SIZE / 2}
                                        r={TIMER_RADIUS}
                                        stroke={playerColor}
                                        strokeWidth={TIMER_STROKE}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeDasharray={TIMER_CIRCUMFERENCE}
                                        strokeDashoffset={ringOffset}
                                        rotation="-90"
                                        origin={`${TIMER_SIZE / 2}, ${TIMER_SIZE / 2}`}
                                    />
                                </Svg>
                                <Text style={styles.timerText}>{Math.max(remaining, 0)}</Text>
                            </View>
                        )}
                    </View>
                        <View style={[
                            styles.accordionContainer,
                            ]}>
                            <View style={styles.accordionWrapper}>
                                <TouchableOpacity
                                    style={[
                                        styles.btnQuestion,
                                        {backgroundColor: playerColor},
                        
                                ]}
                                activeOpacity={1}
                                onPress={() => {
                                    openQuestion();
                                    playClickSound();
                                }}
                                disabled={isQuestionOpen}
                            >
                                <Text style={[styles.btnQuestionText, {color: lightPlayerColor}]}>
                                        {isQuestionOpen ? 'Frage' : 'Frage anzeigen'}
                                </Text>

                                {!isQuestionOpen && (
                                    <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                                        <Ionicons name="chevron-down" size={22} color="#1c1c1e" />
                                    </Animated.View>
                                )}
                    
                            </TouchableOpacity>

                            <Animated.View
                                style={[
                                    styles.dropdownContainer,
                                    {
                                    flex: dropdownAnim,
                                    opacity: questionOpacity,
                                    backgroundColor: lightPlayerColor,
                                    },
                                ]}
                            >
                                <View style={styles.dropdownInnerContent}>
                                    <View style={styles.topContent}>
                                        <Text style={styles.questionText}>
                                            {currentQuestion}
                                        </Text>
                                        <View style={{ marginTop: 20 }}>
                                               <TextInput
                                                    style={styles.textInput}
                                                    value={textValue}
                                                    onChangeText={setTextValue}
                                                    placeholder="Schreibe einen Kommentar"
                                                    placeholderTextColor="#8a99ad"
                                                    maxLength={100}
                                                    multiline={true}
                                                    scrollEnabled={false}

                                                    autoCorrect={false}
                                                    spellCheck={false}

                                                    blurOnSubmit={true}
                                                    returnKeyType="done"
                                                    textAlignVertical="top"

                                                    onFocus={() => setIsFocused(true)}
                                                    onBlur={() => setIsFocused(false)}
                                                    
                                                    onKeyPress={(e) => {
                                                        if (e.nativeEvent.key === 'Enter') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                    onContentSizeChange={(e) => {
                                                        setInputHeight(e.nativeEvent.contentSize.height);
                                                    }}
                                                />
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.btn, styles.btnSecondary,
                                            { marginTop: 20 }]}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            onNext();
                                            playClickSound();
                                        }}
                                    >
                                        <Text style={styles.btnSecondaryText}>
                                            {currentPlayerIndex < playerCount - 1 ? 'Nächster Spieler' : 'Fertigstellen'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </Animated.View>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.btn, styles.btnSecondary, { marginTop: 5 }]}
                    activeOpacity={0.8}
                    onPress={() => {
                        setShowConfirm(true);
                        playClickSound();
                    }}
                >
                    <Text style={styles.btnSecondaryText}>SPIEL BEENDEN</Text>
                </TouchableOpacity>
            </Animated.View>
        

            {showConfirm && (
                <ConfirmationScreen
                    onYes={() => {
                        setShowConfirm(false);
                        playClickSound();
                        onBack();
                    }}
                    onNo={() => {
                        setShowConfirm(false);
                        playClickSound();
                    }}
                />
            )}
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
    accordionContainer: {
        width: '100%',
        borderRadius: 16,
        flex: 1,
    },
    accordionWrapper: {
        width: '100%',
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        padding: 28,
        maxWidth: 400,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
        gap: 16,
    },
    sectionTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1c1c1e',
        textAlign: 'left',
        letterSpacing: 2,
    },
    btnSecondary: {
        backgroundColor: '#f2f2f7',
        borderWidth: 1,
        borderColor: '#e5e5ea',
        marginTop: 'auto',
    },
    btnSecondaryText: {
        color: '#1c1c1e',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    btn: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnQuestion: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        zIndex: 2,
    },
    btnQuestionOpen: {
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    topContent: {
        width: '100%',
        flex: 1,
    },
    btnQuestionText: {
        color: '#1c1c1e',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    dropdownContainer: {
        overflow: 'hidden',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        marginTop: -12,
        paddingTop: 12,
        zIndex: 1,
    },
    dropdownInnerContent: {
        padding: 20,
        flex: 1,
        alignItems: 'stretch',
        height: '100%',
        justifyContent: 'space-between',
    },
    questionBox: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#e5e5ea',
    },
    questionText: {
        fontSize: 16,
        color: '#1c1c1e',
        textAlign: 'center',
        lineHeight: 24,
        fontWeight: 'bold',
    },
    optionLabel: {
        color: '#1c1c1e',
        fontSize: 16,
        fontWeight: '600',
    },
    textInput: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e5ea',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1c1c1e',
        fontWeight: '600',
        width: '100%',
        outlineStyle: 'none',
        overflow: 'hidden',
    },

    timer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerText: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1c1c1e',
    },
    sectionTitleCentered: {
        textAlign: 'center',
    },
});
