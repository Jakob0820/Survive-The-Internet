import React, { useState, useEffect, useRef, useReducer } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, useWindowDimensions, TextInput } from 'react-native';
import ConfirmationScreen from './ConfirmationScreen';
import tinycolor from 'tinycolor2';
import { Ionicons } from '@expo/vector-icons';
import { QUESTIONS } from '../constants/questions';

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

    const questionHeight = dropdownAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, screenHeight * 0.64], // Höhe des aufgeklappten Textfelds
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
                        height: cardHeight,
                    },
                ]}
            >
                <View style={styles.topContent}>
                    <Text style={styles.sectionTitle}>
                        {playerName} ist dran!
                    </Text>
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
                                onPress={openQuestion}
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
                                    height: questionHeight,
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
                                                    style={[
                                                        styles.textInput,
                                                        {height: Math.max(50, inputHeight)},
                                                        isFocused && {
                                                            outlineStyle: 'solid',
                                                            outlineColor: '#1c1c1e',
                                                            outlineWidth: 1,
                                                            outlineOffset: 0,
                                                            borderColor: '#1c1c1e',
                                                        }
                                                    ]}
                                                    value={textValue}
                                                    onChangeText={(text) => {
                                                        const cleanText = text.replace(/[\r\n]/g, '');
                                                        setTextValue(cleanText);
                                                    }}
                                                    placeholder="Gebe einen Kommentar ein"
                                                    placeholderTextColor="#8a99ad"
                                                    multiline={true}
                                                    maxLength={100}
                                                    scrollEnabled={false}

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
                                        onPress={onNext}
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
                    onPress={() => setShowConfirm(true)}
                >
                    <Text style={styles.btnSecondaryText}>SPIEL BEENDEN</Text>
                </TouchableOpacity>
            </Animated.View>
        

            {showConfirm && (
                <ConfirmationScreen
                    onYes={() => {
                        setShowConfirm(false);
                        onBack();
                    }}
                    onNo={() => setShowConfirm(false)}
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
        padding: 20,
        paddingVertical: 30,
        flex: 1,
    },
    accordionContainer: {
        width: '100%',
        borderRadius: 16,
    },
    accordionWrapper: {
        width: '100%',
        },
    card: {
        width: '100%',
        maxWidth: 380,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        padding: 28,
        flex: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
        gap: 16,
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1c1c1e',
        textAlign: 'center',
        marginBottom: 16,
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
});