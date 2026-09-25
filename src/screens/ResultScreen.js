import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    View,
    Image,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
} from 'react-native';


const POINTS_PER_VOTE = 100;
const POINTS_PER_BURN = 50;

export default function ResultScreen({
    voteCount,
    burnCount,
    players,
    onNext,
}) {
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

    return (
        <View style={styles.screenContainer}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>AKTUELLE PUNKTE</Text>
                </View>

                <FlatList
                    data={ranking}
                    keyExtractor={(item) => String(item.index)}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }) => (
                        <View style={styles.row}>
                            <View style={styles.avatarBox}>
                                {index === 0 && (
                                    <Ionicons
                                        name="trophy"
                                        size={28}
                                        color="#F5C518"
                                        style={styles.crownIcon}
                                    />
                                )}
                                <Image
                                    source={item.player?.image}
                                    style={styles.avatarImage}
                                    resizeMode="contain"
                                />
                            </View>

                            <Text style={[styles.name, {color: item.player?.color}]} numberOfLines={1}>
                                {item.player?.name}
                            </Text>

                            <Text style={styles.points}>{item.points}</Text>
                        </View>
                    )}
                />
                <View style={styles.btnBox}>
                    <TouchableOpacity
                        style={[styles.btn, styles.btnPrimary, { marginTop: 5}]}
                        activeOpacity={0.8}
                        onPress={onNext}
                    >
                        <Text style={styles.btnPrimaryText}>NÄCHSTE RUNDE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
    },

    screenContainer: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },

    card: {
        width: '100%',
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 0,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8,
        gap: 16,
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
        fontSize: 32,
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
        width: '80%',
        height: '80%',
    },

    name: {
        flex: 1,
        fontSize: 28,
        fontWeight: '900',
        color: '#000000',
        minWidth: 0,
    },

    points: {
        fontSize: 34,
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
        fontSize: 25,
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
});