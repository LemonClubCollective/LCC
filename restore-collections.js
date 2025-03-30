// restore-collections.js
db.users.insertOne({
    username: "levi",
    email: "matthew.kobilan@gmail.com",
    password: "1234",
    isAdmin: true,
    isVerified: true,
    profilePic: "https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png",
    nfts: [],
    stakingPoints: 0,
    arcadePoints: 0,
    questPoints: 0,
    mintingPoints: 0,
    bonusPoints: 0,
    lemonadePoints: 0,
    loginStreak: 0,
    lastLogin: 0,
    lastDailyReset: 0,
    weeklyResetTimestamp: Date.now(),
    limitedResetTimestamp: Date.now(),
    quests: {
        daily: [
            { id: "arcade-play", title: "Arcade Play", description: "Play arcade games for 5 mins", goal: 5, reward: 20, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() },
            { id: "social-squeeze", title: "Social Squeeze", description: "Visit 2 social links", goal: 2, reward: 20, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() },
            { id: "citrus-explorer", title: "Citrus Explorer", description: "Post or comment 5 times today", goal: 5, reward: 20, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() },
            { id: "section-adventurer", title: "Section Adventurer", description: "Visit 7 unique sections today", goal: 7, reward: 40, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() }
        ],
        weekly: [
            { id: "grove-keeper", title: "Grove Keeper", description: "Stake 3 NFTs", goal: 3, reward: 150, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() },
            { id: "lemon-bard", title: "Lemon Bard", description: "Post 5 comments or posts", goal: 5, reward: 120, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() },
            { id: "arcade-master", title: "Arcade Master", description: "Beat all 3 arcade games", goal: 3, reward: 90, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() },
            { id: "lemon-evolutionist", title: "Lemon Evolutionist", description: "Evolve NFTs", goal: 1, reward: 40, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() }
        ],
        limited: [
            { id: "launch-party", title: "Launch Party", description: "Mint 1 NFT this month", goal: 1, reward: 75, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() },
            { id: "million-lemon-bash", title: "Million Lemon Bash", description: "Evolve 2 NFTs this month", goal: 2, reward: 500, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() }
        ]
    }
});

db.posts.insertOne({
    username: "levi",
    content: "First post on Lemon Club!",
    wallet: "9kkHQYtLU142sFFHB7u7rB2C8MqQyhRKFiM85h81Ctgd",
    timestamp: new Date().toISOString(),
    likes: 0,
    comments: [],
    profilePic: "https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png",
    likedBy: []
});

db.tickets.insertOne({
    name: "Levi",
    email: "matthew.kobilan@gmail.com",
    message: "Test ticket for Lemon Club support.",
    status: "open",
    timestamp: new Date().toISOString()
});