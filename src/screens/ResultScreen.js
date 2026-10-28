import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import podium from '../../assets/podium.png';
import confettiAnimation from '../../assets/celebrate.json'
import { playCountingSound, stopSound, playPopSound, playClickSound } from '../constants/sounds';
import {
    StyleSheet,
    Text,
    View,
    Image,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';

const POINTS_PER_VOTE = 80;
const POINTS_PER_BURN = 30;

const ROW_HEIGHT = 72;

function CountUpText({ progress, from, to, style }) {
    const [value, setValue] = useState(from);

    useEffect(() => {
        setValue(from);
        const id = progress.addListener(({ value: p }) =>
            setValue(Math.round(from + (to - from) * p))
        );
        return () => progress.removeListener(id);
    }, [from, to]);

    return <Text style={style}>{value}</Text>;
}

// Rang pro Spielerindex; bei Gleichstand entscheidet der Index
const rankOf = (points) => {
    const rank = [];
    points
        .map((p, i) => ({ p, i }))
        .sort((a, b) => b.p - a.p || a.i - b.i)
        .forEach((o, r) => { rank[o.i] = r; });
    return rank;
};


export default function ResultScreen({
    voteCount,
    burnCount,
    players,
    onNext,
    onBack,
    isLastRound,
    previousPoints,
}) {
    const popScale = useRef(new Animated.Value(0.85)).current;
    const popOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        popScale.setValue(0.85);
        popOpacity.setValue(0);

        Animated.parallel([
            Animated.spring(popScale, {
                toValue: 1,
                friction: 6,
                tension: 80,
                useNativeDriver: true,
            }),
            Animated.timing(popOpacity, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, [isLastRound]);

    const ranking = useMemo(() => {
        return players
            .map((player, i) => ({
                player,
                index: i,
                points:
                    (voteCount[i] ?? 0) * POINTS_PER_VOTE +
                    (burnCount[i] ?? 0) * POINTS_PER_BURN,
            }))
            .sort((a, b) => b.points - a.points);
    }, [players, voteCount, burnCount]);

    const confettiRef = React.useRef(null);

    React.useEffect(() => {
        if (isLastRound) {
            confettiRef.current?.reset();
            confettiRef.current?.play();
        } else {
            confettiRef.current?.reset();
        }
    }, [isLastRound]);

    const totals = useMemo(
        () => players.map((_, i) =>
            (voteCount[i] ?? 0) * POINTS_PER_VOTE + (burnCount[i] ?? 0) * POINTS_PER_BURN),
        [players, voteCount, burnCount]
    );
    const prevTotals = useMemo(
        () => players.map((_, i) => previousPoints[i] ?? 0),
        [players, previousPoints]
    );
    const prevRank = useMemo(() => rankOf(prevTotals), [prevTotals]);
    const newRank = useMemo(() => rankOf(totals), [totals]);

    const progress = useRef(new Animated.Value(0)).current;
    const positions = useRef(players.map((_, i) => new Animated.Value(prevRank[i] * ROW_HEIGHT))).current;
    const scales = useRef(players.map(() => new Animated.Value(1))).current;
    const [settled, setSettled] = useState(false);

    useEffect(() => {
        if (isLastRound) return;

        const COUNT_DELAY = 600;
        const COUNT_DURATION = 1500;
        const hasChange = totals.some((t, i) => t !== prevTotals[i]);
        const hasSwap = newRank.some((r, i) => r !== prevRank[i]);

        setSettled(false);
        progress.setValue(0);
        positions.forEach((v, i) => v.setValue(prevRank[i] * ROW_HEIGHT));
        scales.forEach((v) => v.setValue(1));

        const soundStart = setTimeout(() => hasChange && playCountingSound(), COUNT_DELAY);
        const soundStop = setTimeout(() => stopSound(), COUNT_DELAY + COUNT_DURATION);

        const anim = Animated.sequence([
            Animated.delay(COUNT_DELAY),
            Animated.timing(progress, {
                toValue: 1,
                duration: COUNT_DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }),
            Animated.delay(400),
            Animated.parallel(
                players.flatMap((_, i) => {
                    const moves = [
                        Animated.spring(positions[i], {
                            toValue: newRank[i] * ROW_HEIGHT,
                            friction: 7,
                            tension: 60,
                            useNativeDriver: true,
                        }),
                    ];
                    if (newRank[i] < prevRank[i]) {
                        moves.push(
                            Animated.sequence([
                                Animated.timing(scales[i], { toValue: 1.06, duration: 200, useNativeDriver: true }),
                                Animated.timing(scales[i], { toValue: 1, duration: 300, useNativeDriver: true }),
                            ])
                        );
                    }
                    return moves;
                })
            ),
        ]);

        anim.start(({ finished }) => {
            if (!finished) return;
            setSettled(true);
            playPopSound();
        });

        return () => {
            clearTimeout(soundStart);
            clearTimeout(soundStop);
            stopSound();
            anim.stop();
        };
    }, [isLastRound, totals, prevTotals]);

    return (
        <>
            {!isLastRound && (
                <View style={styles.roundResultContainer}>
                    <Animated.View
                        style={[
                            styles.card,
                            { opacity: popOpacity, transform: [{ scale: popScale }] },
                        ]}
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerText}>AKTUELLE PUNKTE</Text>
                        </View>

                        <View style={styles.listContent}>
                            <View style={{ height: players.length * ROW_HEIGHT }}>
                                {players.map((player, i) => (
                                    <Animated.View
                                        key={i}
                                        style={[
                                            styles.row,
                                            {
                                                position: 'absolute',
                                                left: 0,
                                                right: 0,
                                                height: ROW_HEIGHT,
                                                zIndex: newRank[i] < prevRank[i] ? 2 : 1,
                                                transform: [{ translateY: positions[i] }, { scale: scales[i] }],
                                            },
                                        ]}
                                    >
                                        <View style={styles.avatarBox}>
                                            {settled && newRank[i] === 0 && (
                                                <Ionicons name="trophy" size={28} color="#F5C518" style={styles.crownIcon} />
                                            )}
                                            <Image source={player?.image} style={styles.avatarImage} resizeMode="contain" />
                                        </View>

                                        <Text style={[styles.name, { color: player?.color }]} numberOfLines={1}>
                                            {player?.name}
                                        </Text>

                                        <CountUpText
                                            progress={progress}
                                            from={prevTotals[i]}
                                            to={totals[i]}
                                            style={styles.points}
                                        />
                                    </Animated.View>
                                ))}
                            </View>
                        </View>
                        <View style={styles.btnBox}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnPrimary, { marginTop: 5}]}
                                activeOpacity={0.8}
                                onPress={ () => {
                                    onNext();
                                    playClickSound();
                                }}
                            >
                                <Text style={styles.btnPrimaryText}>
                                    {isLastRound == true ? 'NOCHMAL SPIELEN' : 'NÄCHSTE RUNDE' }
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            )}
            {isLastRound && (
                <>
                    <LottieView
                        ref={confettiRef}
                        source={confettiAnimation}
                        autoPlay={false}
                        loop={false}
                        style={styles.confettiOverlay}
                        resizeMode="cover"
                        pointerEvents="none"
                    />
                    <Animated.View
                        style={[
                            styles.podiumWrapper,
                            { opacity: popOpacity, transform: [{ scale: popScale }] },
                        ]}
                    >
                        <View style={styles.screenContainer}>
                            <View style={styles.podiumBox}>
                                <Image
                                    source={podium}
                                    style={styles.podiumImage}
                                    resizeMode="contain"
                                />

                                {/* PLATZ 2 */}
                                {ranking[1] && (
                                    <View style={[styles.podiumPlayer, styles.secondPlace]}>
                                        <Image
                                            source={ranking[1].player?.image}
                                            style={styles.podiumPlayerImage}
                                            resizeMode="contain"
                                        />
                                        <Text
                                            style={[
                                                styles.podiumPlayerName,
                                                { color: ranking[1].player?.color }
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {ranking[1].player?.name}
                                        </Text>
                                        <Text style={styles.pointsTop}>
                                            {ranking[1].points}
                                        </Text>
                                    </View>
                                )}

                                {/* PLATZ 1 */}
                                {ranking[0] && (
                                    <View style={[styles.podiumPlayer, styles.firstPlace]}>
                                        <Image
                                            source={ranking[0].player?.image}
                                            style={styles.podiumPlayerImage}
                                            resizeMode="contain"
                                        />
                                        <Text
                                            style={[
                                                styles.podiumPlayerName,
                                                { color: ranking[0].player?.color }
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {ranking[0].player?.name}
                                        </Text>
                                        <Text style={styles.pointsTop}>
                                            {ranking[0].points}
                                        </Text>
                                    </View>
                                )}

                                {/* PLATZ 3 */}
                                {ranking[2] && (
                                    <View style={[styles.podiumPlayer, styles.thirdPlace]}>
                                        <Image
                                            source={ranking[2].player?.image}
                                            style={styles.podiumPlayerImage}
                                            resizeMode="contain"
                                        />
                                        <Text
                                            style={[
                                                styles.podiumPlayerName,
                                                { color: ranking[2].player?.color }
                                            ]}
                                            numberOfLines={1}
                                        >
                                            {ranking[2].player?.name}
                                        </Text>
                                        <Text style={styles.pointsTop}>
                                            {ranking[2].points}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* AB PLATZ 4 */}
                            {ranking.length > 3 && (
                                <View style={styles.remainingPlayers}>
                                    {ranking.slice(3).map((item, index) => (
                                        <View style={styles.row} key={String(item.index)}>
                                            <Text style={styles.placement}>
                                                {index + 4}.
                                            </Text>
                                            <View style={styles.avatarBoxResult}>
                                                <Image
                                                    source={item.player?.image}
                                                    style={styles.avatarImageResult}
                                                    resizeMode="contain"
                                                />
                                            </View>

                                            <Text
                                                style={[
                                                    styles.nameResult,
                                                    { color: item.player?.color }
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {item.player?.name}
                                            </Text>

                                            <Text style={styles.pointsResult}>
                                                {item.points}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <View style={styles.btnBox}>
                                <TouchableOpacity
                                    style={[styles.btn, styles.btnPrimary, { marginTop: 5 }]}
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        confettiRef.current?.reset();
                                        onNext();
                                        playClickSound();
                                    }}
                                >
                                    <Text style={styles.btnPrimaryText}>
                                        NOCHMAL SPIELEN
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.btn, styles.btnPrimary, { marginTop: 10 }]}
                                    activeOpacity={0.8}
                                        onPress={() => {
                                            confettiRef.current?.reset();
                                            onBack();
                                            playClickSound();
                                        }}
                                >
                                    <Text style={styles.btnPrimaryText}>
                                        HAUPTMENÜ
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({

    podiumWrapper: {
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },

    screenContainer: {
        width: '90%',
        backgroundColor: '#FFFFFF',
        padding: 0,
        borderRadius: 30,
    },

    roundResultContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        bottom: 20,
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },

    card: {
        width: '90%',
        maxHeight: '100%',
        backgroundColor: '#FFFFFF',
        padding: 0,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
        gap: 5,
    },

    container: {
        flex: 1,
    },

    header: {
        width: '100%',
        backgroundColor: '#000000',
        paddingVertical: 24,
        paddingHorizontal: 20,
        borderBottomWidth: 6,
        borderBottomColor: '#AAAAAA',
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
    },

    headerText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 1,
        textAlign: 'center',
    },

    listContent: {
        paddingHorizontal: 16,
        paddingTop: 5,
        paddingBottom: 10,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 0,
    },

    avatarBox: {
        width: 72,
        height: 72,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        overflow: 'hidden',
        position: 'relative',
    },

    avatarImage: {
        width: '75%',
        height: '75%',
    },

    name: {
        flex: 1,
        fontSize: 26,
        fontWeight: '900',
        color: '#000000',
        minWidth: 0,
    },

    points: {
        fontSize: 32,
        fontWeight: '900',
        color: '#000000',
        marginLeft: 12,
    },

    btnBox: {
        marginBottom: 5,
        padding: 12,
    },

    btn: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },

    btnPrimary: {
        backgroundColor: '#3799d1',
    },

    btnPrimaryText: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 2,
        marginVertical: 5,
    },

    crownIcon: {
        position: 'absolute',
        top: 0,
        alignSelf: 'center',
        zIndex: 10,
        transform: [{ rotate: '-15deg' }],
        left: 5,
    },

    crownEmoji: {
        position: 'absolute',
        top: -14,
        fontSize: 26,
        zIndex: 10,
        transform: [{ rotate: '-15deg' }],
    },

    podiumBox: {
        width: '100%',
        height: 320,
        position: 'relative',
        alignItems: 'center',
    },

    podiumImage: {
        width: '90%',
        marginTop: 30,
        height: 385,
    },

    podiumPlayer: {
        position: 'absolute',
        alignItems: 'center',
        width: 110,
    },

    remainingPlayers: {
        marginTop: 5,
    },

    podiumPlayerImage: {
        width: 65,
        height: 65,
    },

    podiumPlayerName: {
        fontSize: 18,
        fontWeight: '900',
        textAlign: 'center',
        maxWidth: 110,
    },

    firstPlace: {
        top: 10,
        left: '50%',
        marginLeft: -55,
    },

    secondPlace: {
        top: 65,
        left: '5%',
    },

    thirdPlace: {
        top: 95,
        right: '5%',
    },
    
    placement:{
        fontSize: 20,
        fontWeight: '900',
        color: '#000000',
        minWidth: 0,
        marginLeft: 20,
    },

    nameResult: {
        flex: 1,
        fontSize: 20,
        fontWeight: '900',
        color: '#000000',
        minWidth: 0,
    },

    pointsResult: {
        fontSize: 26,
        fontWeight: '900',
        color: '#000000',
        marginLeft: 5,
        marginRight: 20,
    },

    avatarBoxResult: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 2,
        overflow: 'hidden',
        position: 'relative',
    },

    avatarImageResult: {
        width: '70%',
        height: '70%',
    },

    pointsTop: {
        fontSize: 22,
        fontWeight: '900',
        color: '#000000',
    },

    confettiOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
    },
});