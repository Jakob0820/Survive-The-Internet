const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export function createFakeStats() {
    return {
        rating: rnd(1, 5),        // Ebay-Sterne
        likes: rnd(1000, 9999),   // YouTube
        dislikes: rnd(1000, 9999),
        views: rnd(20000, 99999),
        funds: rnd(20000, 99999), // GoFundMe
        supporters: rnd(1000, 9999),
        votes: rnd(1000, 9999),   // Gutefrage
        hoursAgo: rnd(3, 22),
        replies: rnd(50, 999),    // Twitter
        retweets: rnd(50, 999),
        hearts: rnd(1000, 9999),
    };
}