const express = require('express');
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, sol } = require('@metaplex-foundation/js');
const fs = require('fs').promises;
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const nodemailer = require('nodemailer');
const stripe = require('stripe')('sk_test_51Qxc9v03zQcNJCYZCY8NEg0wC8LHnCd1c8OiWeqsOPyHKzBponH5gObOzGOdRgMnbcx3nCEQuzatt53kIrC9ScoA0022Lt1WDy');
const axios = require('axios');
const CoinbaseCommerce = require('coinbase-commerce-node');
const Client = CoinbaseCommerce.Client;
Client.init('989417de-057c-4d9f-9a80-30b2f29b8198');
const Charge = CoinbaseCommerce.resources.Charge;
const fetch = require('node-fetch');
const multer = require('multer');
const app = express();
const port = 3000;

const PRIMARY_RPC = 'https://api.devnet.solana.com';
const FALLBACK_RPC = 'https://rpc.ankr.com/solana_devnet';
let connection = new Connection(PRIMARY_RPC, 'confirmed');

async function retryRPC(operation, maxAttempts = 5, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (error.message.includes('429 Too Many Requests') || error.message.includes('timeout')) {
                console.log(`RPC failed: ${error.message}. Retrying after ${delay * attempt}ms...`);
                if (attempt === maxAttempts) {
                    console.log('Switching to fallback RPC...');
                    connection = new Connection(FALLBACK_RPC, 'confirmed');
                    return await operation();
                }
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            } else {
                throw error;
            }
        }
    }
}

async function loadWallet() {
    const walletData = await fs.readFile('C:\\Users\\public.DESKTOP-1IFDKN4\\solana\\dev-wallet.json', 'utf8');
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(walletData)));
}

const USERS_FILE = 'users.json';
const POSTS_FILE = 'posts.json';
const TICKETS_FILE = 'tickets.json';
const BLOGS_FILE = 'blogs.json';
const VIDEOS_FILE = 'videos.json';

const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
            return cb(new Error('Only images and videos are allowed'));
        }
        cb(null, true);
    },
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

async function initialize() {
    const wallet = await loadWallet();
    const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));

    let users = {};
    let posts = [];
    let tickets = [];
    let blogs = [];
    let videos = [];
    try {
        users = JSON.parse(await fs.readFile(USERS_FILE, 'utf8')) || {};
        posts = JSON.parse(await fs.readFile(POSTS_FILE, 'utf8')) || [];
        tickets = JSON.parse(await fs.readFile(TICKETS_FILE, 'utf8')) || [];
        blogs = JSON.parse(await fs.readFile(BLOGS_FILE, 'utf8')) || [];
        videos = JSON.parse(await fs.readFile(VIDEOS_FILE, 'utf8')) || [];
    } catch (error) {
        console.log('[Init] No existing data files, starting fresh');
    }

    function saveData(file, data) {
        try {
            fs.writeFile(file, JSON.stringify(data, null, 2));
            console.log(`[SaveData] ${file} saved successfully`);
        } catch (error) {
            console.error(`[SaveData] Error saving ${file}:`, error.message);
        }
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: 'meredith.ritchie3@ethereal.email',
            pass: 'shGrcnF5PdvWSFG597'
        }
    });

    const nftLayers = {
        backgrounds: [
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGsunset.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGsunsetforest1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGstars.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGstars1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGnightforest.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGnightforest1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGgreengrass.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGgrassfield.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGgrassfieldswirl.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGforestsunset.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGanimesunset.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGcloudsevening.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/BGforestgrass.png'
        ],
        seed: [
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/brownseed.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/magicseed.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/magicseed1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/magicseed2.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purpleseed.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purpleseed1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purpleseed3.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/greenseed.png'
        ],
        sprout: [
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/sprout.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/magicsprout.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/magicsprout1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/greensprout.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/greensprout2.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purplesprout.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purplesprout1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purplesprout2.png'
        ],
        sapling: [
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/sapling.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/greensapling.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purplesapling.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purplesapling1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purplesapling2.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/redrubysapling.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/redrubysapling2.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/redrubysapling3.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/goldensapling.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/goldensapling1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/goldensapling2.png'
        ],
        tree: [
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/goldentree.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/emeraldtree.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purpletree.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/purpletree1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/redtree.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/redtree1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/redtree2.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/goldtree1.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/goldtree2.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/goldentree3.png',
            'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/diamondtree.png'
        ]
    };

    const quests = {
        daily: [
            { id: 'lemon-picker', name: 'Lemon Picker', desc: 'Mint 1 NFT', goal: 1, reward: 50 },
            { id: 'community-zest', name: 'Community Zest', desc: 'Submit 1 forum post', goal: 1, reward: 25 },
            { id: 'social-squeeze', name: 'Social Squeeze', desc: 'Visit 2 social media links', goal: 2, reward: 20 },
            { id: 'arcade-play', name: 'Arcade Playtime', desc: 'Play arcade games for 5 minutes', goal: 5, reward: 30 }
        ],
        weekly: [
            { id: 'grove-keeper', name: 'Grove Keeper', desc: 'Stake 3 NFTs', goal: 3, reward: 200 },
            { id: 'lemon-bard', name: 'Lemon Bard', desc: 'Post 5 comments or posts', goal: 5, reward: 150 },
            { id: 'visit-sections', name: 'Citrus Explorer', desc: 'Visit all 7 sections', goal: 7, reward: 100 },
            { id: 'arcade-master', name: 'Arcade Master', desc: 'Beat all 3 arcade games', goal: 3, reward: 150 }
        ],
        limited: [
            { id: 'million-lemon-bash', name: 'Million Lemon Bash', desc: 'Evolve 2 NFTs', goal: 2, reward: 500 }
        ]
    };

    const profilePics = [
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP2.png',
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP3.png',
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP4.png',
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP5.png',
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP6.png',
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP7.png',
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP8.png',
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP9.png',
        'https://raw.githubusercontent.com/LemonClubCollective/NFT/main/PFP10.png'
    ];

    function getRandomItem(array, rarityRules = null) {
        if (!array || array.length === 0) {
            throw new Error('No items available in array for random selection');
        }
        if (rarityRules) {
            const totalWeight = Object.values(rarityRules).reduce((sum, weight) => sum + weight, 0);
            const rand = Math.random() * totalWeight;
            let weightSum = 0;
            for (const [color, weight] of Object.entries(rarityRules)) {
                weightSum += weight;
                if (rand <= weightSum) {
                    const filtered = array.filter(item => item.includes(color));
                    return filtered[Math.floor(Math.random() * filtered.length)] || array[Math.floor(Math.random() * array.length)];
                }
            }
        }
        return array[Math.floor(Math.random() * array.length)];
    }

    async function generateNFT(tokenId, stageName = 'Lemon Seed') {
        const canvas = createCanvas(512, 512, { willReadFrequently: true });
        const ctx = canvas.getContext('2d');

        const stageMap = {
            'Lemon Seed': 'seed',
            'Lemon Sprout': 'sprout',
            'Lemon Sapling': 'sapling',
            'Lemon Tree': 'tree'
        };
        const stageKey = stageMap[stageName] || 'seed';

        const backgroundPath = getRandomItem(nftLayers.backgrounds);
        let background;
        try {
            const response = await fetch(backgroundPath);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            background = await loadImage(buffer);
        } catch (error) {
            console.error(`Failed to load background image ${backgroundPath}: ${error.message}`);
            throw new Error(`Image load failed for background: ${backgroundPath}`);
        }
        ctx.drawImage(background, 0, 0, 512, 512);

        const rarityRules = {
            'diamond': 0.2,
            'red': 0.4,
            'purple': 0.5
        };
        const baseImagePath = getRandomItem(nftLayers[stageKey], rarityRules);
        let baseImage;
        try {
            const response = await fetch(baseImagePath);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            baseImage = await loadImage(buffer);
        } catch (error) {
            console.error(`Failed to load base image ${baseImagePath}: ${error.message}`);
            throw new Error(`Image load failed for base: ${baseImagePath}`);
        }
        ctx.drawImage(baseImage, 0, 0, 512, 512);

        const outputDir = path.join(__dirname, 'output');
        await fs.mkdir(outputDir, { recursive: true });
        const imagePath = path.join(outputDir, 'nft_' + tokenId + '.png');
        console.log(`[GenerateNFT] Saving image to: ${imagePath}`);
        const out = require('fs').createWriteStream(imagePath);
        const stream = canvas.createPNGStream();
        await new Promise((resolve, reject) => {
            stream.pipe(out);
            out.on('finish', () => {
                console.log(`[GenerateNFT] Image saved successfully: ${imagePath}`);
                resolve();
            });
            out.on('error', (err) => {
                console.error(`[GenerateNFT] Error saving image: ${err.message}`);
                reject(err);
            });
        });

        const rarity = baseImagePath.includes('diamond') ? 'Diamond' :
                      baseImagePath.includes('red') ? 'Ruby' :
                      baseImagePath.includes('purple') ? 'Amethyst' : 'Common';

        const metadata = {
            name: `${stageName} #${tokenId}`,
            symbol: stageKey === 'seed' ? 'LSEED' : stageKey === 'sprout' ? 'LSPRT' : stageKey === 'sapling' ? 'LSAPL' : 'LTREE',
            description: `A unique Lemon Club NFT at the ${stageName} stage with ${rarity} rarity!`,
            image: `/output/nft_${tokenId}.png`,
            attributes: [
                { trait_type: 'Stage', value: stageName.split(' ')[1] },
                { trait_type: 'Rarity', value: rarity },
                { trait_type: 'Background', value: path.basename(backgroundPath, '.png') },
                { trait_type: 'Base', value: path.basename(baseImagePath, '.png') }
            ],
            seller_fee_basis_points: 500,
            collection: { name: 'Lemon Club Collective', family: 'LCC' },
            properties: {
                files: [{ uri: `/output/nft_${tokenId}.png`, type: 'image/png' }],
                category: 'image',
                creators: [{ address: wallet.publicKey.toString(), share: 100 }]
            }
        };
        const metadataPath = path.join(outputDir, 'nft_' + tokenId + '.json');
        console.log(`[GenerateNFT] Saving metadata to: ${metadataPath}`);
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`[GenerateNFT] Metadata saved successfully: ${metadataPath}`);

        return { imagePath, metadataPath };
    }

    // Middleware to restrict admin routes
    function requireAdmin(req, res, next) {
        if (!loggedInUsername || !users[loggedInUsername]?.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }
        next();
    }

    app.use(express.json());
    app.use(express.static('public'));
    app.use('/output', express.static(path.join(__dirname, 'output')));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    app.use('/videos', express.static(path.join(__dirname, 'videos')));

    const stages = [
        { name: 'Lemon Seed', symbol: 'LSEED', uri: 'https://raw.githubusercontent.com/LemonClubCollective/NFT/refs/heads/main/seed.json', minPoints: 0 },
        { name: 'Lemon Sprout', symbol: 'LSPRT', uri: 'https://raw.githubusercontent.com/LemonClubCollective/NFT/refs/heads/main/sprout.json', minPoints: 30 },
        { name: 'Lemon Sapling', symbol: 'LSAPL', uri: 'https://raw.githubusercontent.com/LemonClubCollective/NFT/refs/heads/main/sapling.json', minPoints: 60 },
        { name: 'Lemon Tree', symbol: 'LTREE', uri: 'https://raw.githubusercontent.com/LemonClubCollective/NFT/refs/heads/main/tree.json', minPoints: 90 }
    ];

    function resetDailyQuests(username) {
        if (!users[username] || !users[username].quests) return;
        const now = new Date();
        const lastReset = users[username].lastDailyReset ? new Date(users[username].lastDailyReset) : new Date(0);
        const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (lastReset < todayMidnight) {
            users[username].quests.daily = quests.daily.map(q => ({
                id: q.id,
                name: q.name,
                desc: q.desc,
                goal: q.goal,
                reward: q.reward,
                progress: 0,
                completed: false,
                claimed: false,
                resetTimestamp: todayMidnight.getTime()
            }));
            users[username].lastDailyReset = todayMidnight.getTime();
            users[username].tweetsToday = 0;
            saveData(USERS_FILE, users);
            console.log(`[ResetDailyQuests] Daily quests reset for ${username}`);
        }
    }

    function resetWeeklyQuests(username) {
        if (!users[username] || !users[username].quests) return;
        const now = Date.now();
        const weekInterval = 7 * 24 * 60 * 60 * 1000;
        if (now >= (users[username].victoryResetTimestamp || 0) + weekInterval) {
            users[username].quests.weekly = quests.weekly.map(q => ({
                id: q.id,
                name: q.name,
                desc: q.desc,
                goal: q.goal,
                reward: q.reward,
                progress: 0,
                completed: false,
                claimed: false,
                resetTimestamp: now
            }));
            users[username].claimedVictories = [];
            users[username].victoryResetTimestamp = now;
            saveData(USERS_FILE, users);
            console.log(`[ResetWeeklyQuests] Weekly quests reset for ${username}`);
        }
    }

    function updateQuestProgress(username, type, questId, increment) {
        if (!users[username] || !users[username].quests || !users[username].quests[type]) return;
        const quest = users[username].quests[type].find(q => q.id === questId);
        if (!quest || quest.completed) return;
        quest.progress = Math.min(quest.progress + increment, quest.goal);
        if (quest.progress >= quest.goal) quest.completed = true;
        saveData(USERS_FILE, users);
    }

    let loggedInUsername = null;

    app.post('/register', async (req, res) => {
        try {
            const { email, username, password, emailConsent } = req.body;
            if (!email || !username || !password) {
                return res.status(400).json({ error: 'Email, username, and password required' });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            if (users[username]) {
                return res.status(400).json({ error: 'Username already taken' });
            }

            const verificationToken = Math.random().toString(36).substring(2, 15);
            users[username] = { 
                email,
                password, 
                nfts: [], 
                lastLogin: 0, 
                points: 0,
                arcadePoints: 0,
                waterDroplets: 0,
                claimedVictories: [],
                victoryResetTimestamp: Date.now(),
                lastDailyReset: Date.now(),
                profilePic: profilePics[Math.floor(Math.random() * profilePics.length)],
                quests: {
                    daily: quests.daily.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                    weekly: quests.weekly.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                    limited: quests.limited.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false }))
                },
                isVerified: false,
                verificationToken,
                emailConsent,
                subscriptionId: null,
                isPremium: false,
                tweetsToday: 0,
                isAdmin: false // Default to non-admin
            };
            saveData(USERS_FILE, users);

            const mailOptions = {
                from: 'meredith.ritchie3@ethereal.email',
                to: email,
                subject: 'Verify Your Lemon Club Collective Account',
                text: `Welcome to Lemon Club Collective! Verify your email: http://localhost:3000/verify-email/${username}/${verificationToken}`
            };
            await transporter.sendMail(mailOptions);
            console.log(`[Register] New user: ${username}, verification email sent`);
            res.json({ success: true, message: 'Registered—check email to verify!' });
        } catch (error) {
            console.error('[Register] Error:', error.message);
            res.status(500).json({ error: 'Failed to register' });
        }
    });

    app.get('/verify-email/:username/:token', (req, res) => {
        try {
            const { username, token } = req.params;
            const user = users[username];
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });
            if (user.isVerified) return res.status(400).json({ success: false, error: 'Email already verified' });
            if (user.verificationToken !== token) return res.status(400).json({ success: false, error: 'Invalid token' });

            user.isVerified = true;
            delete user.verificationToken;
            saveData(USERS_FILE, users);
            console.log(`[VerifyEmail] ${username} verified`);
            res.send('<h1>Email Verified!</h1><p>Log in at <a href="http://localhost:3000">Lemon Club Collective</a>.</p>');
        } catch (error) {
            console.error('[VerifyEmail] Error:', error.message);
            res.status(500).json({ error: 'Failed to verify email' });
        }
    });

    app.post('/login', (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

            const user = users[username];
            if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
            if (!user.isVerified) return res.status(401).json({ error: 'Verify your email first' });

            loggedInUsername = username;

            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            let pointsAwarded = false;
            if (now - user.lastLogin >= oneDay) {
                user.nfts.forEach(nft => nft.points += 1);
                user.lastLogin = now;
                pointsAwarded = true;
                resetWeeklyQuests(username);
                saveData(USERS_FILE, users);
                console.log(`[Login] Success for ${username}: Points awarded`);
            } else {
                console.log(`[Login] Success for ${username}: No points, within 24h`);
            }

            // Special check for "tester" user to grant admin rights for testing
            const isAdmin = user.isAdmin || (username === 'tester' && password === '1234');
            if (username === 'tester' && password === '1234' && !user.isAdmin) {
                user.isAdmin = true;
                saveData(USERS_FILE, users);
                console.log(`[Login] Granted admin rights to tester`);
            }

            res.json({ 
                success: true, 
                wallet: null,
                nfts: user.nfts.map(nft => ({ mintAddress: nft.mintAddress, points: nft.points })),
                profilePic: user.profilePic,
                pointsAwarded,
                isAdmin
            });
        } catch (error) {
            console.error('[Login] Error:', error.message);
            res.status(500).json({ error: 'Failed to login' });
        }
    });

    // New endpoint to grant admin rights (admin only)
    app.post('/grant-admin', requireAdmin, (req, res) => {
        try {
            const { targetUsername } = req.body;
            if (!targetUsername) return res.status(400).json({ error: 'Target username required' });
            if (!users[targetUsername]) return res.status(404).json({ error: 'User not found' });

            users[targetUsername].isAdmin = true;
            saveData(USERS_FILE, users);
            console.log(`[GrantAdmin] ${loggedInUsername} granted admin rights to ${targetUsername}`);
            res.json({ success: true, message: `${targetUsername} is now an admin` });
        } catch (error) {
            console.error('[GrantAdmin] Error:', error.message);
            res.status(500).json({ error: 'Failed to grant admin rights' });
        }
    });

    app.get('/nft/:username', async (req, res) => {
        try {
            const username = req.params.username;
            console.log(`[NFT] Fetching for user: ${username}`);
            const user = users[username] || { nfts: [] };

            if (!user.nfts.length) {
                return res.json({ success: true, error: 'No NFTs minted yet', nfts: [] });
            }

            const nftData = [];
            for (const nft of user.nfts) {
                const operation = async () => {
                    const mintAddress = new PublicKey(nft.mintAddress);
                    const nftInfo = await metaplex.nfts().findByMint({ mintAddress });
                    const currentStage = stages.find(s => s.name === nftInfo.name) || stages[0];
                    const currentStageIndex = stages.indexOf(currentStage);
                    const nextStage = stages[currentStageIndex + 1];

                    if (nft.staked && nft.stakeStart) {
                        const now = Date.now();
                        const secondsStaked = (now - nft.stakeStart) / 1000;
                        nft.rewards = Math.floor(secondsStaked / 60);
                    }

                    return {
                        nft: { name: nftInfo.name, symbol: nftInfo.symbol, mintAddress: nft.mintAddress },
                        points: nft.points,
                        nextMinPoints: nextStage ? nextStage.minPoints : null,
                        staked: nft.staked,
                        rewards: nft.rewards,
                        mintTimestamp: nft.mintTimestamp,
                        imageUri: nft.imageUri
                    };
                };
                const nftDataEntry = await retryRPC(operation);
                nftData.push(nftDataEntry);
            }

            console.log(`[NFT] Fetched for ${username}:`, JSON.stringify(nftData, null, 2));
            res.json({ success: true, nfts: nftData });
        } catch (error) {
            console.error('[NFT] Error:', error.message, error.stack);
            res.status(500).json({ error: 'Failed to fetch NFTs', details: error.message });
        }
    });

    app.post('/mint/:username', async (req, res) => {
        try {
            const username = req.params.username;
            const { wallet: walletAddress } = req.body;
            console.log(`[Mint] Attempt for ${username} with wallet ${walletAddress}`);
            const user = users[username];
            if (!user) return res.status(400).json({ error: 'User not found—please login' });

            const serverWallet = await loadWallet();
            const serverBalance = await connection.getBalance(serverWallet.publicKey);
            console.log(`[Mint] Server wallet balance: ${serverBalance / LAMPORTS_PER_SOL} SOL`);
            if (serverBalance < 0.03 * LAMPORTS_PER_SOL) {
                throw new Error('Server wallet needs SOL. Airdrop to: 9kkHQYtLU142sFFHB7u7rB2C8MqQyhRKFiM85h81Ctgd');
            }

            const tokenId = Date.now();
            const { imagePath, metadataPath } = await generateNFT(tokenId, 'Lemon Seed');
            console.log(`[Mint] Generated files: ${imagePath}, ${metadataPath}`);

            const imageUri = `http://localhost:${port}/output/nft_${tokenId}.png`;
            const metadataContent = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            metadataContent.image = imageUri;
            await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));
            const metadataUri = `file://${metadataPath}`;

            const mintKeypair = Keypair.generate();
            const tokenOwner = new PublicKey(walletAddress);

            console.log('[Mint] Creating NFT...');
            const createOperation = () => metaplex.nfts().create({
                uri: metadataUri,
                name: `Lemon Seed #${tokenId}`,
                symbol: 'LSEED',
                sellerFeeBasisPoints: 500,
                creators: [{ address: serverWallet.publicKey, share: 100 }],
                tokenOwner: tokenOwner,
                mint: mintKeypair,
                isMutable: true,
                payer: serverWallet,
                mintAuthority: serverWallet,
                updateAuthority: serverWallet
            }, { commitment: 'finalized' });
            const { nft, response } = await retryRPC(createOperation);

            if (!response.signature) throw new Error('No transaction signature returned');

            const actualMintAddress = nft.mint.address.toString();
            const mintTimestamp = Date.now();
            console.log(`[Mint] Success: Minted Lemon Seed #${tokenId}, Address: ${actualMintAddress}`);

            user.nfts.push({ 
                mintAddress: actualMintAddress, 
                points: 0, 
                staked: false, 
                stakeStart: 0, 
                rewards: 0,
                mintTimestamp,
                imageUri
            });
            updateQuestProgress(username, 'daily', 'lemon-picker', 1);
            saveData(USERS_FILE, users);

            res.json({
                success: true,
                mintAddress: actualMintAddress,
                transactionSignature: response.signature,
                imageUri,
                metadataUri,
                mintTimestamp
            });
        } catch (error) {
            console.error('[Mint] Error:', error.message, error.stack);
            res.status(500).json({ error: 'Failed to mint NFT', details: error.message });
        }
    });

    app.get('/evolve/:username/:mintAddress', async (req, res) => {
        try {
            const username = req.params.username;
            const mintAddressStr = req.params.mintAddress;
            const user = users[username];
            if (!user) return res.status(400).json({ error: 'User not found—please login' });

            const nftRecord = user.nfts.find(nft => nft.mintAddress === mintAddressStr);
            if (!nftRecord) return res.status(400).json({ error: 'NFT not found' });

            const mintAddress = new PublicKey(nftRecord.mintAddress);
            const nft = await metaplex.nfts().findByMint({ mintAddress });
            const currentStage = stages.find(s => s.name === nft.name) || stages[0];
            const currentStageIndex = stages.indexOf(currentStage);
            const nextStage = stages[currentStageIndex + 1];

            if (!nextStage) return res.status(400).json({ error: 'No next stage available' });

            if (nftRecord.points < nextStage.minPoints && nftRecord.rewards < 5) {
                return res.status(400).json({ error: 'Need 30+ points or 5+ rewards' });
            }

            let usedRewards = false;
            if (nftRecord.rewards >= 5) {
                nftRecord.rewards -= 5;
                usedRewards = true;
            } else {
                nftRecord.points -= nextStage.minPoints;
            }

            const tokenId = Date.now();
            const { imagePath, metadataPath } = await generateNFT(tokenId, nextStage.name);
            const imageUri = `http://localhost:${port}/output/nft_${tokenId}.png`;
            const metadataContent = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
            metadataContent.image = imageUri;
            await fs.writeFile(metadataPath, JSON.stringify(metadataContent, null, 2));
            const metadataUri = `file://${metadataPath}`;

            const { response } = await metaplex.nfts().update({
                nftOrSft: nft,
                name: nextStage.name,
                symbol: nextStage.symbol,
                uri: metadataUri,
                sellerFeeBasisPoints: 500,
                authority: wallet
            }, { commitment: 'finalized' });

            nftRecord.imageUri = imageUri;
            updateQuestProgress(username, 'limited', 'million-lemon-bash', 1);
            saveData(USERS_FILE, users);
            res.json({
                success: true,
                newStage: { name: nextStage.name, symbol: nextStage.symbol },
                transactionSignature: response.signature,
                usedRewards,
                imageUri
            });
        } catch (error) {
            console.error('[Evolve] Error:', error.message, error.stack);
            res.status(500).json({ error: 'Failed to evolve NFT', details: error.message });
        }
    });

    app.post('/stake/:username/:mintAddress', async (req, res) => {
        try {
            const username = req.params.username;
            const mintAddressStr = req.params.mintAddress;
            const user = users[username];
            if (!user) return res.status(400).json({ error: 'User not found—please login' });

            const nftRecord = user.nfts.find(nft => nft.mintAddress === mintAddressStr);
            if (!nftRecord) return res.json({ error: 'NFT not found' });

            if (nftRecord.staked) return res.json({ error: 'NFT already staked' });

            nftRecord.staked = true;
            nftRecord.stakeStart = Date.now();
            updateQuestProgress(username, 'weekly', 'grove-keeper', 1);
            saveData(USERS_FILE, users);
            res.json({ success: true, message: 'NFT staked' });
        } catch (error) {
            console.error('[Stake] Error:', error.message);
            res.status(500).json({ error: 'Failed to stake NFT' });
        }
    });

    app.post('/unstake/:username/:mintAddress', async (req, res) => {
        try {
            const username = req.params.username;
            const mintAddressStr = req.params.mintAddress;
            const user = users[username];
            if (!user) return res.status(400).json({ error: 'User not found—please login' });

            const nftRecord = user.nfts.find(nft => nft.mintAddress === mintAddressStr);
            if (!nftRecord) return res.json({ error: 'NFT not found' });

            if (!nftRecord.staked) return res.json({ error: 'NFT not staked' });

            const now = Date.now();
            const secondsStaked = (now - nftRecord.stakeStart) / 1000;
            nftRecord.rewards += Math.floor(secondsStaked / 60);
            nftRecord.staked = false;
            nftRecord.stakeStart = 0;
            saveData(USERS_FILE, users);
            res.json({ success: true, message: 'NFT unstaked', rewards: nftRecord.rewards });
        } catch (error) {
            console.error('[Unstake] Error:', error.message);
            res.status(500).json({ error: 'Failed to unstake NFT' });
        }
    });

    app.get('/posts', (req, res) => {
        const postsWithUserData = posts.map(post => ({
            ...post,
            username: post.username,
            profilePic: users[post.username]?.profilePic || 'https://via.placeholder.com/50'
        }));
        res.json(postsWithUserData);
    });

    app.post('/posts', (req, res) => {
        try {
            const { wallet, content, username } = req.body;
            if (!wallet || !content || content.length > 280 || !username) {
                return res.status(400).json({ error: 'Invalid post: Wallet, username, and content (max 280 chars) required' });
            }

            if (!users[username]) return res.status(400).json({ error: 'User not found' });

            const post = {
                wallet,
                username,
                profilePic: users[username].profilePic,
                content,
                timestamp: Date.now(),
                likes: 0,
                comments: []
            };
            posts.unshift(post);
            updateQuestProgress(username, 'daily', 'community-zest', 1);
            updateQuestProgress(username, 'weekly', 'lemon-bard', 1);
            saveData(POSTS_FILE, posts);
            res.json({ success: true, post });
        } catch (error) {
            console.error('[Posts] Error:', error.message);
            res.status(500).json({ error: 'Failed to create post' });
        }
    });

    app.post('/posts/like', (req, res) => {
        try {
            const { wallet, postIndex } = req.body;
            if (!wallet || postIndex === undefined || postIndex < 0 || postIndex >= posts.length) {
                return res.status(400).json({ error: 'Invalid like request' });
            }

            posts[postIndex].likes += 1;
            saveData(POSTS_FILE, posts);
            res.json({ success: true, likes: posts[postIndex].likes });
        } catch (error) {
            console.error('[Posts] Error liking:', error.message);
            res.status(500).json({ error: 'Failed to like post' });
        }
    });

    app.post('/posts/comment', (req, res) => {
        try {
            const { wallet, postIndex, content, username } = req.body;
            if (!wallet || postIndex === undefined || postIndex < 0 || postIndex >= posts.length || !content || content.length > 280 || !username) {
                return res.status(400).json({ error: 'Invalid comment: Wallet, username, and content (max 280 chars) required' });
            }

            if (!users[username]) return res.status(400).json({ error: 'User not found' });

            const comment = {
                wallet,
                username,
                profilePic: users[username].profilePic,
                content,
                timestamp: Date.now(),
                likes: 0,
                replies: []
            };
            posts[postIndex].comments = posts[postIndex].comments || [];
            posts[postIndex].comments.push(comment);
            updateQuestProgress(username, 'weekly', 'lemon-bard', 1);
            saveData(POSTS_FILE, posts);
            res.json({ success: true, comment });
        } catch (error) {
            console.error('[Comments] Error:', error.message);
            res.status(500).json({ error: 'Failed to add comment' });
        }
    });

    app.post('/posts/comment/reply', (req, res) => {
        try {
            const { wallet, postIndex, path, content, username } = req.body;
            if (!wallet || postIndex === undefined || postIndex < 0 || postIndex >= posts.length || 
                !path || !Array.isArray(path) || !content || content.length > 280 || !username) {
                return res.status(400).json({ error: 'Invalid reply: Wallet, username, post index, path, and content (max 280 chars) required' });
            }

            if (!users[username]) return res.status(400).json({ error: 'User not found' });

            let currentLevel = posts[postIndex].comments;
            for (let i = 0; i < path.length; i++) {
                const index = path[i];
                if (!currentLevel[index]) return res.status(400).json({ error: 'Invalid reply path' });
                currentLevel[index].replies = currentLevel[index].replies || [];
                if (i < path.length - 1) currentLevel = currentLevel[index].replies;
            }

            const reply = {
                wallet,
                username,
                profilePic: users[username].profilePic,
                content,
                timestamp: Date.now(),
                likes: 0,
                replies: []
            };
            currentLevel[path[path.length - 1]].replies.push(reply);
            updateQuestProgress(username, 'weekly', 'lemon-bard', 1);
            saveData(POSTS_FILE, posts);
            res.json({ success: true, reply });
        } catch (error) {
            console.error('[Replies] Error:', error.message);
            res.status(500).json({ error: 'Failed to add reply' });
        }
    });

    app.post('/posts/comment/like', (req, res) => {
        try {
            const { wallet, postIndex, path } = req.body;
            if (!wallet || postIndex === undefined || postIndex < 0 || postIndex >= posts.length || 
                !path || !Array.isArray(path)) {
                return res.status(400).json({ error: 'Invalid comment like request' });
            }

            let currentLevel = posts[postIndex].comments;
            for (let i = 0; i < path.length; i++) {
                const index = path[i];
                if (!currentLevel[index]) return res.status(400).json({ error: 'Invalid like path' });
                if (i === path.length - 1) currentLevel[index].likes += 1;
                else currentLevel = currentLevel[index].replies;
            }

            saveData(POSTS_FILE, posts);
            res.json({ success: true, likes: currentLevel[path[path.length - 1]].likes });
        } catch (error) {
            console.error('[Comments] Error liking:', error.message);
            res.status(500).json({ error: 'Failed to like comment' });
        }
    });

    app.get('/quests/:username', (req, res) => {
        try {
            const { username } = req.params;
            if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });
            if (!users[username].quests) {
                users[username].quests = {
                    daily: quests.daily.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                    weekly: quests.weekly.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                    limited: quests.limited.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false }))
                };
                saveData(USERS_FILE, users);
            }
            resetDailyQuests(username);
            resetWeeklyQuests(username);
            const responseData = {
                success: true,
                daily: users[username].quests.daily,
                weekly: users[username].quests.weekly,
                limited: users[username].quests.limited,
                points: users[username].points
            };
            console.log(`[Quests] Fetching for ${username}:`, JSON.stringify(responseData, null, 2));
            res.json(responseData);
        } catch (error) {
            console.error('[Quests] Error fetching:', error.message);
            res.status(500).json({ error: 'Failed to fetch quests' });
        }
    });

    app.post('/quests/:username/update', (req, res) => {
        try {
            const { username } = req.params;
            const { questId, type, progress } = req.body;
            if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });
            if (!users[username].quests) {
                users[username].quests = {
                    daily: quests.daily.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                    weekly: quests.weekly.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                    limited: quests.limited.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false }))
                };
            }
            const quest = users[username].quests[type].find(q => q.id === questId);
            if (!quest) return res.status(400).json({ success: false, error: 'Quest not found' });
            quest.progress = Math.min(progress, quest.goal);
            if (quest.progress >= quest.goal) quest.completed = true;
            saveData(USERS_FILE, users);
            res.json({ success: true });
        } catch (error) {
            console.error('[Quests] Error updating:', error.message);
            res.status(500).json({ error: 'Failed to update quest' });
        }
    });

    app.post('/quests/:username/claim', (req, res) => {
        try {
            const { username } = req.params;
            const { questId } = req.body;
            console.log(`[Quests] Attempting to claim ${questId} for ${username}`);
            if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });
            if (!users[username].quests) {
                users[username].quests = {
                    daily: quests.daily.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                    weekly: quests.weekly.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                    limited: quests.limited.map(q => ({ id: q.id, name: q.name, desc: q.desc, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false }))
                };
            }
            const allQuests = [
                ...users[username].quests.daily,
                ...users[username].quests.weekly,
                ...users[username].quests.limited
            ];
            const quest = allQuests.find(q => q.id === questId);
            if (!quest) return res.status(400).json({ success: false, error: 'Quest not found' });
            console.log(`[Quests] Quest ${questId} progress: ${quest.progress}/${quest.goal}, completed: ${quest.completed}, claimed: ${quest.claimed}`);
            if (!quest.completed || quest.claimed) return res.status(400).json({ success: false, error: 'Quest not completed or already claimed' });
            quest.claimed = true;
            users[username].waterDroplets = (users[username].waterDroplets || 0) + quest.reward;
            saveData(USERS_FILE, users);
            console.log(`[Quests] Claimed ${questId} for ${username}: ${quest.reward} Water Droplets`);
            res.json({ success: true, waterDroplets: quest.reward });
        } catch (error) {
            console.error('[Quests] Error claiming:', error.message);
            res.status(500).json({ error: 'Failed to claim reward' });
        }
    });

    app.get('/profile/:username', (req, res) => {
        try {
            const { username } = req.params;
            const user = users[username];
            if (!user) return res.status(404).json({ success: false, error: 'User not found' });
            res.json({
                success: true,
                username,
                profilePic: user.profilePic,
                points: user.points,
                arcadePoints: user.arcadePoints || 0,
                waterDroplets: user.waterDroplets || 0,
                nfts: user.nfts,
                quests: user.quests,
                claimedVictories: user.claimedVictories || [],
                isPremium: user.isPremium || false,
                isAdmin: user.isAdmin || false
            });
        } catch (error) {
            console.error('[Profile] Error:', error.message);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    });

    app.post('/profile/:username/update-pic', (req, res) => {
        try {
            const { username } = req.params;
            const { profilePic } = req.body;
            if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });
            if (!profilePics.includes(profilePic)) return res.status(400).json({ success: false, error: 'Invalid profile picture' });
            users[username].profilePic = profilePic;
            saveData(USERS_FILE, users);
            res.json({ success: true, profilePic });
        } catch (error) {
            console.error('[Profile Update] Error:', error.message);
            res.status(500).json({ error: 'Failed to update profile picture' });
        }
    });

    app.post('/profile/:username/upload-pic', upload.single('profilePic'), async (req, res) => {
        try {
            const { username } = req.params;
            if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });
            if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

            const fileName = `${username}-${Date.now()}${path.extname(req.file.originalname)}`;
            const newPath = path.join(__dirname, 'uploads', fileName);
            await fs.rename(req.file.path, newPath);

            const profilePicUrl = `http://localhost:${port}/uploads/${fileName}`;
            users[username].profilePic = profilePicUrl;
            saveData(USERS_FILE, users);
            res.json({ success: true, profilePicUrl });
        } catch (error) {
            console.error('[Profile Upload] Error:', error.message);
            res.status(500).json({ error: 'Failed to upload profile picture', details: error.message });
        }
    });

    app.post('/playtime/:username', (req, res) => {
        try {
            const { username } = req.params;
            const { minutes } = req.body;
            if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });
            if (!minutes || minutes < 0) return res.status(400).json({ success: false, error: 'Invalid playtime' });
            
            users[username].arcadePoints = (users[username].arcadePoints || 0) + Math.floor(minutes);
            saveData(USERS_FILE, users);
            res.json({ success: true, arcadePoints: users[username].arcadePoints });
        } catch (error) {
            console.error('[Playtime] Error:', error.message);
            res.status(500).json({ error: 'Failed to update playtime' });
        }
    });

    app.post('/claim-victory/:username/:gameId', (req, res) => {
        try {
            const { username, gameId } = req.params;
            const validGames = ['big-dill', 'owl-capone', 'lenny-lemon'];
            if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });
            if (!validGames.includes(gameId)) return res.status(400).json({ success: false, error: 'Invalid game ID' });
            if (!users[username].claimedVictories) users[username].claimedVictories = [];
            if (users[username].claimedVictories.includes(gameId)) return res.status(400).json({ success: false, error: 'Victory already claimed this week' });
            if (users[username].claimedVictories.length >= 3) return res.status(400).json({ success: false, error: 'Max victories claimed this week' });

            users[username].claimedVictories.push(gameId);
            updateQuestProgress(username, 'weekly', 'arcade-master', 1);
            saveData(USERS_FILE, users);
            res.json({ success: true });
        } catch (error) {
            console.error('[ClaimVictory] Error:', error.message);
            res.status(500).json({ error: 'Failed to claim victory' });
        }
    });

    app.post('/submit-ticket', async (req, res) => {
        try {
            const { name, email, message } = req.body;
            if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message required' });
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });

            const ticketId = Date.now().toString();
            const ticket = { id: ticketId, name, email, message, timestamp: Date.now() };
            tickets.push(ticket);
            saveData(TICKETS_FILE, tickets);

            const mailOptions = {
                from: 'meredith.ritchie3@ethereal.email',
                to: 'meredith.ritchie3@ethereal.email',
                subject: `New Support Ticket #${ticketId}`,
                text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}\nTimestamp: ${new Date(ticket.timestamp).toLocaleString()}`
            };
            await transporter.sendMail(mailOptions);
            console.log(`[SubmitTicket] Ticket #${ticketId} submitted by ${email}`);
            res.json({ success: true, ticketId });
        } catch (error) {
            console.error('[SubmitTicket] Error:', error.message);
            res.status(500).json({ error: 'Failed to submit ticket' });
        }
    });

    app.post('/create-subscription', async (req, res) => {
        try {
            const { username } = req.body;
            if (!username || !loggedInUsername || username !== loggedInUsername) {
                return res.status(401).json({ error: 'Login required' });
            }
            const customer = await stripe.customers.create({
                email: users[username].email,
                metadata: { username }
            });
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{ price: 'price_1QxczG03zQcNJCYZR4puLHsu' }],
                payment_behavior: 'default_incomplete'
            });
            users[username].subscriptionId = subscription.id;
            users[username].isPremium = false;
            saveData(USERS_FILE, users);
            res.json({ success: true, clientSecret: subscription.latest_invoice.payment_intent.client_secret });
        } catch (error) {
            console.error('[Subscription] Error:', error.message);
            res.status(500).json({ error: 'Subscription failed: ' + error.message });
        }
    });

    app.get('/printify-products', async (req, res) => {
        try {
            const response = await axios.get('https://api.printify.com/v1/shops/21048617/products', {
                headers: { 'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjlkZWZhMzk2MWNiNjExY2I3OGJiMWNjMmU0MDQ0ZjU5NmQyMzYwYmQ2NzEyYjc1YTc1YTdlMmFiNmY0ZWYxYzRjOGQ2YzU2NGNkNDNmMjY2IiwiaWF0IjoxNzQwOTM1NDE1LjE5Mjc2NSwibmJmIjoxNzQwOTM1NDE1LjE5Mjc2NywiZXhwIjoxNzcyNDcxNDE1LjE4NTQxNywic3ViIjoiMjE4ODI2ODciLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.AH8rytFwf6iP240owCDgdZoaRiX0JsjkdCoepHJdYETBkez3xUyb1UMo1s8EvvZBlpnE0_GczGGaN3lpp8Y' }
            });
            const products = response.data.data || [];
            console.log(`[Printify] Fetched ${products.length} products for shop 21048617`);
            if (products.length === 0) {
                console.log('[Printify] Note: No products found—shop might be empty or items are unpublished');
            }
            res.json({ success: true, data: products });
        } catch (error) {
            console.error('[Printify] Error fetching products:', error.response ? error.response.data : error.message);
            res.status(200).json({ success: true, data: [], message: 'No products available yet—check Printify publishing status' });
        }
    });

    app.post('/printify-order', async (req, res) => {
        try {
            const { username, productId, address } = req.body;
            if (!username || !loggedInUsername || username !== loggedInUsername) {
                return res.status(401).json({ error: 'Login required' });
            }
            const order = await axios.post('https://api.printify.com/v1/shops/21048617/orders', {
                line_items: [{ product_id: productId, variant_id: '22788511409976386611', quantity: 1 }],
                shipping_method: 1,
                shipping_address: {
                    first_name: address.split(',')[0].trim(),
                    last_name: '',
                    address1: address.split(',')[1].trim(),
                    city: address.split(',')[2].trim(),
                    state: address.split(',')[3].trim(),
                    zip: address.split(',')[4].trim(),
                    country: address.split(',')[5].trim()
                }
            }, { 
                headers: { 
                    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6IjlkZWZhMzk2MWNiNjExY2I3OGJiMWNjMmU0MDQ0ZjU5NmQyMzYwYmQ2NzEyYjc1YTc1YTdlMmFiNmY0ZWYxYzRjOGQ2YzU2NGNkNDNmMjY2IiwiaWF0IjoxNzQwOTM1NDE1LjE5Mjc2NSwibmJmIjoxNzQwOTM1NDE1LjE5Mjc2NywiZXhwIjoxNzcyNDcxNDE1LjE4NTQxNywic3ViIjoiMjE4ODI2ODciLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.AH8rytFwf6iP240owCDgdZoaRiX0JsjkdCoepHJdYETBkez3xUyb1UMo1s8EvvZBlpnE0_GczGGaN3lpp8Y'
                } 
            });
            console.log(`[Printify Order] Success for ${username}: Order ID ${order.data.id}`);
            res.json({ success: true, orderId: order.data.id });
        } catch (error) {
            console.error('[Printify] Error placing order:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to place order', details: error.response ? error.response.data : error.message });
        }
    });

    app.post('/create-charge', async (req, res) => {
        try {
            const { username, amount } = req.body;
            if (!username || !loggedInUsername || username !== loggedInUsername) {
                return res.status(401).json({ error: 'Login required' });
            }
            const charge = await Charge.create({
                name: 'Lemon Club Merch',
                description: 'Printify Order',
                local_price: { amount: amount, currency: 'USD' },
                pricing_type: 'fixed_price',
                metadata: { username }
            });
            console.log(`[Charge] Created for ${username}: ${charge.hosted_url}`);
            res.json({ success: true, chargeUrl: charge.hosted_url });
        } catch (error) {
            console.error('[Charge] Error:', error.message);
            res.status(500).json({ error: 'Failed to create charge' });
        }
    });

    app.get('/blog-posts', (req, res) => {
        res.json({ success: true, posts: blogs });
    });

    app.post('/blog-posts', requireAdmin, async (req, res) => {
        try {
            const { title, content } = req.body;
            if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
            blogs.push({ title, content, timestamp: Date.now() });
            saveData(BLOGS_FILE, blogs);
            console.log(`[Blog] Posted by ${loggedInUsername}: ${title}`);
            res.json({ success: true });
        } catch (error) {
            console.error('[Blog] Error:', error.message);
            res.status(500).json({ error: 'Failed to post blog' });
        }
    });

    app.get('/videos', (req, res) => {
        res.json({ success: true, videos });
    });

    app.post('/upload-video', requireAdmin, upload.single('video'), async (req, res) => {
        try {
            const { title, description } = req.body;
            if (!req.file) return res.status(400).json({ error: 'No video uploaded' });
            if (!title || !description) return res.status(400).json({ error: 'Title and description required' });

            const fileName = `${Date.now()}${path.extname(req.file.originalname)}`;
            const newPath = path.join(__dirname, 'videos', fileName);
            await fs.rename(req.file.path, newPath);

            const videoUrl = `http://localhost:${port}/videos/${fileName}`;
            videos.push({ title, description, url: videoUrl, timestamp: Date.now() });
            saveData(VIDEOS_FILE, videos);
            console.log(`[UploadVideo] Uploaded by ${loggedInUsername}: ${title}`);
            res.json({ success: true, videoUrl });
        } catch (error) {
            console.error('[UploadVideo] Error:', error.message);
            res.status(500).json({ error: 'Failed to upload video', details: error.message });
        }
    });

    app.post('/subscribe-newsletter', async (req, res) => {
        try {
            const { email } = req.body;
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ error: 'Valid email required' });
            }

            console.log(`[Newsletter] Subscribed: ${email}`);
            const mailOptions = {
                from: 'meredith.ritchie3@ethereal.email',
                to: email,
                subject: 'Welcome to Lemon Club Newsletter!',
                text: 'Thanks for subscribing to the Lemon Club Collective Newsletter!'
            };
            await transporter.sendMail(mailOptions);
            res.json({ success: true });
        } catch (error) {
            console.error('[Newsletter] Error:', error.message);
            res.status(500).json({ error: 'Failed to subscribe' });
        }
    });

    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        Object.keys(users).forEach(username => {
            resetDailyQuests(username);
            resetWeeklyQuests(username);
        });
        setInterval(() => Object.keys(users).forEach(u => users[u].tweetsToday = 0), 24 * 60 * 60 * 1000);

        if (blogs.length === 0) {
            const sampleBlogs = [
                { title: "Welcome to Lemon Club!", content: "We're excited to launch our community!", timestamp: Date.now() }
            ];
            saveData(BLOGS_FILE, sampleBlogs);
            blogs = sampleBlogs;
        }
        if (videos.length === 0) {
            saveData(VIDEOS_FILE, videos);
        }
    });
}

initialize().catch(err => console.error('Initialization failed:', err));