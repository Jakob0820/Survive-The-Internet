import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Easing } from 'react-native';
import LottieView from 'lottie-react-native';
import shoppingCart from '../../assets/shoppingCart.json';
import { playClickSound } from '../constants/sounds';
import { useLanguage } from '../constants/translations';

export default function GameTransitionScreen({ 
    onFinish,
    roundName,
    currentLogo,
    primaryColor,
    secondaryColor,
    currentRoundNumber,
    totalRounds,
    evaluation,
    onNext,
}) {
    const { t } = useLanguage();
    const shoppingCartLottieRef = useRef(null);

    // Hereinkommen direkt beim Anzeigen: Logo federt herein, Halbkreise steigen von unten auf
    const logoAnim = useRef(new Animated.Value(0)).current;
    const circleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const anim = Animated.parallel([
            Animated.spring(logoAnim, {
                toValue: 1,
                damping: 12,
                stiffness: 140,
                useNativeDriver: true,
            }),
            Animated.timing(circleAnim, {
                toValue: 1,
                duration: 650,
                easing: Easing.bezier(0.22, 1, 0.36, 1), // schnelles Abbremsen
                useNativeDriver: true,
            }),
        ]);
        anim.start();
        return () => anim.stop();
    }, []);

    const logoStyle = {
        opacity: logoAnim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 1, 1] }),
        transform: [{ scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] }) }],
    };
    const circleStyle = {
        transform: [{ translateY: circleAnim.interpolate({ inputRange: [0, 1], outputRange: [140, 0] }) }],
    };

    useEffect(() => {
        if(evaluation) return;
            // Startet den 3-Sekunden-Timer beim Laden der Komponente
            const timer = setTimeout(() => {
                if (onFinish) {
                    onFinish();
                }
            }, 3000);

            // Säubert den Timer, falls der Screen vorzeitig verlassen wird
            return () => clearTimeout(timer); 
    }, [evaluation]); 

    function ProgressDots({ total, current, color }) {
        return (
            <View style={styles.dotsRow}>
                {Array.from({ length: total }).map((_, i) => {
                    const isActive = i === current;
                    const isDone = i < current;
                    return (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                isActive && styles.dotActive,
                                { backgroundColor: isActive || isDone ? color : 'rgba(0,0,0,0.15)' },
                            ]}
                        />
                    );
                })}
            </View>
        );
    }
    if(!evaluation){
        return (
            <View style={[styles.card]}>
                <View style={styles.header}>
                    <Text style={styles.text}>
                        {t('transition.round', { number: currentRoundNumber + 1 })}
                    </Text>
                    <ProgressDots
                        total={totalRounds}
                        current={currentRoundNumber}
                        color={primaryColor}
                    />
                </View>
                <Animated.View style={[styles.logoBox, logoStyle]}>
                    <Image
                        source={currentLogo}
                        style={{ width: '100%', height: 150 }}
                        resizeMode="contain"
                    />
                </Animated.View>
                <Animated.View style={[styles.circleWrapper, circleStyle]}>
                    <View style={[styles.circleBack, { backgroundColor: secondaryColor }]}>
                        <View style={styles.darkOverlay} />
                    </View>
                    <View style={[styles.halfCircle, {backgroundColor: primaryColor}]}>
                        <LottieView
                            ref={shoppingCartLottieRef}
                            source={shoppingCart}
                            autoPlay={true}
                            loop={true}
                            style={styles.shoppingCartLottie}
                        />
                    </View>
                </Animated.View>
            </View>
        );
    }

    if(evaluation){
        return (
            <View style={styles.card}>
                <View style={styles.header}>
                    <Animated.View style={[styles.logoBox, logoStyle]}>
                        <Image
                            source={currentLogo}
                            style={{ width: '100%', height: 130 }}
                            resizeMode="contain"
                        />
                        <Text style={styles.headerText}>
                            {t('transition.evaluation')}
                        </Text>
                    </Animated.View>
                </View>
                
                <Animated.View style={[styles.circleWrapper, circleStyle]}>
                    <View style={[styles.circleBack, { backgroundColor: secondaryColor }]}>
                        <View style={styles.darkOverlay} />
                    </View>
                    <View style={[styles.halfCircle, { backgroundColor: primaryColor }]} />

                    <TouchableOpacity
                        style={[
                            styles.btn,
                            styles.resultBtn,
                            {
                                backgroundColor: secondaryColor,
                            },
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                            onNext();
                            playClickSound();
                        }}
                    >
                        <Text style={styles.btnText}>
                            {t('transition.showResult')}
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
        gap: 16,
        overflow: 'hidden',
    },

    circleWrapper: {
        width: '100%',
        height: 240,
        overflow: 'hidden',
        marginTop: 10,
    },

    halfCircle: {
        position: 'absolute',
        top: 45,
        left: '-20%',
        width: '140%',
        aspectRatio: 1,
        borderRadius: 9999,
        alignItems: 'center',
    },

    circleBack: {
        position: 'absolute',
        top: 0,
        left: '-20%',
        width: '140%', 
        aspectRatio: 1,
        borderRadius: 9999,
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 9999,
        backgroundColor: 'rgba(0,0,0,0.22)',
    },

    shoppingCartLottie: {
        width: 200,
        height: 200,
        alignSelf: 'center',
    },

    logoBox: {
        width:'100%',
        alignSelf: 'center',
        paddingHorizontal: 20,
    },
    text: {
        color: '#000000',
        fontSize: 40,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    header: {
        paddingTop: 20,
        alignItems: 'center',
        gap: 10,
    },
    dotsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    dotActive: {
        width: 20,
    },

    btn: {
        position: 'absolute',
        paddingVertical: 24,
        paddingHorizontal: 24,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
        textAlign: 'center',
    },
    resultBtn: {
        top: 120,
        alignSelf: 'center',
    },
    evaluatingText: {
        fontSize: 36,
        fontWeight: '900',
        color: '#1c1c1e',
        textAlign: 'center',
        marginTop: 30,
    },
    headerText: {
        fontSize: 22,
        fontWeight: '700',
        color: "#000000",
        textAlign: 'center',
    }

});