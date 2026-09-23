import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    SafeAreaView,
    FlatList,
} from 'react-native';

const POINTS_PER_VOTE = 100;
const POINTS_PER_BURN = 50;

export default function ResultScreen({
    voteCount,
    burnCount,
    players,
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
        <SafeAreaView style={styles.container}>
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
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
        paddingTop: 10,
        paddingBottom: 20,
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },

    avatarBox: {
        width: 72,
        height: 72,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        overflow: 'hidden',
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
});