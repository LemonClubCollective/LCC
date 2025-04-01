// Imports
require('dotenv').config();
const express = require('express');
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL, Transaction, SystemProgram, TransactionInstruction } = require('@solana/web3.js');
const { TOKEN_METADATA_PROGRAM_ID: IMPORTED_TOKEN_METADATA_PROGRAM_ID } = require('@metaplex-foundation/mpl-token-metadata');
const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const splToken = require('@solana/spl-token');
const stripe = require('stripe')('sk_test51Qxc9v03zQcNJCYZCY8NEg0wC8LHnCd1c8OiWeqsOPyHKzBponH5gObOzGOdRgMnbcx3nCEQuzatt53kIrC9ScoA0022Lt1WDy');
const CoinbaseCommerce = require('coinbase-commerce-node');
const Client = CoinbaseCommerce.Client;
Client.init('989417de-057c-4d9f-9a80-30b2f29b8198');
const Charge = CoinbaseCommerce.resources.Charge;
const multer = require('multer');
const axios = require('axios');
const { TOKEN_PROGRAM_ID: TokenProgramId, createInitializeMintInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createMintToInstruction, ASSOCIATED_TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const cors = require('cors');
const { exec } = require('child_process');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb'); 
const solanaWeb3 = require('@solana/web3.js');
const { S3Client, HeadObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIAW5WU5LN7HKW7BNXV',
        secretAccessKey: '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'
    }
});

// Constants
const port = process.env.PORT || 8080;
const PRIMARY_RPC = 'https://api.devnet.solana.com';
const FALLBACK_RPC = 'https://rpc.ankr.com/solana_devnet';
const DATA_DIR = path.join(__dirname, 'data');

// Define TOKEN_METADATA_PROGRAM_ID with fallback
const DEFAULT_TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const TOKEN_METADATA_PROGRAM_ID = IMPORTED_TOKEN_METADATA_PROGRAM_ID || DEFAULT_TOKEN_METADATA_PROGRAM_ID;
if (!IMPORTED_TOKEN_METADATA_PROGRAM_ID) {
    console.warn('TOKEN_METADATA_PROGRAM_ID not found in @metaplex-foundation/mpl-token-metadata. Using hardcoded fallback. Consider updating the package.');
}

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public'));
app.use(cors());

// Increase request size limit for JSON and form-data
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.post('/claim-quest/:username/:type/:questId', async (req, res) => {
    console.log(`[ClaimQuest] Attempting claim for ${req.params.username}, type: ${req.params.type}, questId: ${req.params.questId}`);
    try {
        const { username, type, questId } = req.params;
        const lowerUsername = username.toLowerCase();
        if (!users[lowerUsername] || !users[lowerUsername].quests || !users[lowerUsername].quests[type]) {
            console.error(`[ClaimQuest] User or quest type not found: ${lowerUsername}, ${type}`);
            return res.status(404).json({ success: false, error: 'User or quest not found' });
        }
        const quest = users[lowerUsername].quests[type].find(q => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) {
            console.error(`[ClaimQuest] Invalid quest state: ${questId}, completed: ${quest?.completed}, claimed: ${quest?.claimed}`);
            return res.status(400).json({ success: false, error: 'Quest not completed or already claimed' });
        }
        quest.claimed = true;
        awardPoints(lowerUsername, 'quest', quest.reward, `Quest ${quest.title}`);
        await saveData(users, 'users');
        console.log(`[ClaimQuest] Success: ${lowerUsername} claimed ${quest.reward} points for ${questId}`);
        res.json({ success: true, reward: quest.reward });
    } catch (error) {
        console.error('[ClaimQuest] Error:', error.message);
        res.status(500).json({ error: 'Failed to claim quest reward' });
    }
});

// Serve static files from folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/output', express.static(path.join(__dirname, 'output')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(path.join(__dirname, 'videos')));
app.use('/node_modules', express.static('node_modules'))



// Ensure these directories exist
const requiredDirs = ['uploads', 'output', 'public', 'videos'];
requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`[Server] Created directory: ${dirPath}`);
    }
});

const { Metaplex, keypairIdentity, TransactionBuilder } = require('@metaplex-foundation/js');

// Global variables
let users = {};
let posts = [];
let tickets = [];
let blogs = [];
let videos = [];
let wallet;
let connection;
let metaplex;
let transporter;
let db;


const nftLayers = {
    backgrounds: [
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGsunset.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGsunsetforest1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGstars.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGstars1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGnightforest.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGnightforest1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGgreengrass.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGgrassfield.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGgrassfieldswirl.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGforestsunset.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGanimesunset.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGcloudsevening.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/backgrounds/BGforestgrass.png'
    ],
    seed: [
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/brownseed.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/goldseed.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/greenseed.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/magicseed.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/magicseed1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/magicseed2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/magicseed3.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/purpleseed.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/purpleseed1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/purpleseed3.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rarediamondseed.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rarediamondseed2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rarediamondseed3.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/raregoldseed.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rareredseed.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/seeds/rareredseed2.png'
    ],
    sprout: [
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/diamondsprout.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/diamondsprout1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/diamondsprout3.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/goldsprout.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/goldsprout1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/goldsprout2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/greensprout.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/greensprout2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/magicsprout.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/magicsprout1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/purplesprout1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/purplesprout2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/redrubysprout.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/sprouts/redrubysprout2.png'
    ],
    sapling: [
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/goldensapling.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/goldensapling1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/goldensapling2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/greensapling.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/purplesapling.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/purplesapling1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/purplesapling2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/redrubysapling.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/redrubysapling2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/saplings/redrubysapling3.png'
    ],
    tree: [
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/diamondtree.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/emeraldtree.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/goldentree.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/goldentree3.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/goldtree1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/goldtree2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/lemontree.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/purpletree.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/purpletree1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/purpletree2.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/redtree.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/redtree1.png',
        'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/trees/redtree2.png'
    ]
};

const profilePics = [
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP2.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP3.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(1).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(10).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(2).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(3).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(4).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(5).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(6).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(7).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(8).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP4(9).jpeg',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP5.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP6.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP7.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP8.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP9.png',
    'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP10.png'
];

const saveData = async (data, collectionName) => {
    if (!db) {
        console.log(`[SaveData] No MongoDB connection, skipping save to ${collectionName}`);
        return;
    }
    try {
        const collectionMap = {
            'users.json': 'users',
            'posts.json': 'posts',
            'tickets.json': 'tickets',
            'blogs.json': 'blogs',
            'videos.json': 'videos'
        };
        const mappedName = collectionMap[collectionName.split('/').pop()] || collectionName;
        const collection = db.collection(mappedName);
        if (mappedName === 'users') {
            const usersArray = Object.values(data);
            for (const user of usersArray) {
                await collection.updateOne(
                    { username: user.username },
                    { $set: user },
                    { upsert: true }
                );
            }
        } else {
            await collection.deleteMany({});
            if (Array.isArray(data) && data.length > 0) {
                await collection.insertMany(data);
            }
        }
        console.log(`[SaveData] Saved to ${mappedName}`);
    } catch (error) {
        console.error(`[SaveData] Error saving to ${collectionName}: ${error.message}`);
    }
};
const quests = {
    daily: [
        { id: 'arcade-play', title: 'Arcade Play', description: 'Play arcade games for 5 mins', goal: 5, reward: 20 },
        { id: 'social-squeeze', title: 'Social Squeeze', description: 'Visit 2 social links', goal: 2, reward: 20 },
        { id: 'citrus-explorer', title: 'Citrus Explorer', description: 'Post or comment 5 times today', goal: 5, reward: 20 },
        { id: 'section-adventurer', title: 'Section Adventurer', description: 'Visit 7 unique sections today', goal: 7, reward: 40 }
    ],
    weekly: [
        { id: 'grove-keeper', title: 'Grove Keeper', description: 'Stake 3 NFTs', goal: 3, reward: 150 },
        { id: 'lemon-bard', title: 'Lemon Bard', description: 'Post 5 comments or posts', goal: 5, reward: 120 },
        { id: 'arcade-master', title: 'Arcade Master', description: 'Beat all 3 arcade games', goal: 3, reward: 90 },
        { id: 'lemon-evolutionist', title: 'Lemon Evolutionist', description: 'Evolve NFTs', goal: 1, reward: 40 }
    ],
    limited: [
        { id: 'launch-party', title: 'Launch Party', description: 'Mint 1 NFT this week', goal: 1, reward: 75 },
        { id: 'million-lemon-bash', title: 'Million Lemon Bash', description: 'Evolve 2 NFTs', goal: 2, reward: 500 }
    ]
};

async function retryRPC(operation, maxAttempts = 5, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (error.message.includes('429 Too Many Requests') || error.message.includes('timeout')) {
                console.log(`RPC failed: ${error.message}. Retrying after ${delay * attempt}ms...`);
                if (attempt === maxAttempts) {
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
  try {
    const walletData = await fsPromises.readFile(path.join(__dirname, 'data', 'dev-wallet.json'), 'utf8');
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(walletData)));
  } catch (error) {
    console.error('[loadWallet] Error loading dev-wallet.json:', error.message);
    throw new Error('Failed to load dev wallet');
  }
}

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

let isInitialized = false; // Guard to prevent multiple calls

async function initialize() {
    if (isInitialized) return;
    isInitialized = true;

    console.log('[Initialize] Starting initialization');

    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
            console.log('[Initialize] Created data directory:', DATA_DIR);
        }
    } catch (error) {
        console.error('[Initialize] Error creating data directory:', error.message);
    }

    const mongoUri = 'mongodb+srv://lemonclub:Think400Big!@lemonclub.dinfd.mongodb.net/?retryWrites=true&w=majority&appName=LemonClub';
    console.log('[Initialize] MongoDB URI:', mongoUri);

    let client;
    try {
        if (!mongoUri || (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://'))) {
            throw new Error('Invalid MongoDB URI format');
        }
        client = new MongoClient(mongoUri, { connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 });
        await client.connect();
        console.log('[Initialize] Connected to MongoDB successfully');
        db = client.db('lemonclub');
        // Migration and data load...
        users = (await db.collection('users').find().toArray()).reduce((acc, user) => {
            if (user && user.username) acc[user.username.toLowerCase()] = user;
            return acc;
        }, {});
        console.log('[Initialize] Loading posts...');
        posts = await db.collection('posts').find().toArray() || [];
        console.log('[Initialize] Loading tickets...');
        tickets = await db.collection('tickets').find().toArray() || [];
        console.log('[Initialize] Loading blogs...');
        blogs = await db.collection('blogs').find().toArray() || [];
        console.log('[Initialize] Loading videos...');
        videos = await db.collection('videos').find().toArray() || [];
        console.log('[Initialize] Data loaded successfully');
    } catch (error) {
        console.error('[Initialize] MongoDB connection error:', error.message);
        db = null;
        users = {};
        posts = [];
        tickets = [];
        blogs = [];
        videos = [];
        console.error('[Initialize] Proceeding without MongoDB');
    }

    console.log('[Initialize] Attempting wallet load...');
    try {
        wallet = await loadWallet();
        console.log(`[Init] Wallet loaded: ${wallet.publicKey.toString()}`);
    } catch (error) {
        console.error('[Initialize] Failed to load wallet:', error.message);
        wallet = null;
    }

	console.log('[Initialize] Attempting Solana/Metaplex init');
    try {
        connection = new Connection(PRIMARY_RPC, 'confirmed');
        metaplex = wallet ? Metaplex.make(connection).use(keypairIdentity(wallet)) : null;
        console.log('[Initialize] Solana and Metaplex initialized successfully');
    } catch (error) {
        console.error('[Initialize] Failed to initialize Solana/Metaplex:', error.message);
        connection = null;
        metaplex = null;
    }

 console.log('[Initialize] Attempting SES init');
    try {
        const sesClient = new SESClient({
            region: 'us-east-1',
            credentials: {
                accessKeyId: 'AKIAW5WU5LN7HKW7BNXV',
            secretAccessKey: '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'
         },
            requestTimeout: 5000
        });
        transporter = sesClient;
        console.log('[Initialize] SES transporter initialized successfully');
    } catch (error) {
        console.error('[Initialize] Failed to initialize SES transporter:', error.message);
        transporter = null;
    }

 console.log('[Initialize] Starting server');
    const startServer = async (portToTry = process.env.PORT || 80) => {
        try {
            const net = require('net');
            const checkPort = (port) => new Promise((resolve) => {
                const tester = net.createServer()
                    .once('error', (err) => resolve(err.code === 'EADDRINUSE' ? false : true))
                    .once('listening', () => { tester.close(); resolve(true); })
                    .listen(port);
            });

            const isPortFree = await checkPort(portToTry);
            console.log(`[PortCheck] Port ${portToTry} is ${isPortFree ? 'free' : 'in use'}`);
            let retryCount = 0;
            const maxRetries = 5;
            const retryDelay = 5000;
            const fallbackPort = 8080;

            
        if (!isPortFree && portToTry === (process.env.PORT || 3001) && retryCount < maxRetries) {
                retryCount++;
                console.log(`[PortCheck] Port ${portToTry} is in use, retrying (${retryCount}/${maxRetries}) in ${retryDelay/1000} seconds...`);
                return new Promise((resolve) => setTimeout(resolve, retryDelay)).then(() => startServer(port));
            } else if (!isPortFree && portToTry === port) {
                console.warn(`[PortCheck] Port ${port} failed after ${maxRetries} retries, trying fallback port ${fallbackPort}...`);
                return startServer(fallbackPort);
            } else if (!isPortFree) {
                console.error(`[PortCheck] Fallback port ${fallbackPort} is also in use. Proceeding without binding.`);
                return;
            }

            const server = app.listen(portToTry, () => {
                console.log(`Server running on http://localhost:${portToTry}`);
                if (blogs.length === 0) {
                    const sampleBlogs = [{ title: "Welcome to Lemon Club!", content: "We're excited to launch our community!", timestamp: Date.now() }];
                    saveData(sampleBlogs, 'blogs');
                    blogs = sampleBlogs;
                }
                if (videos.length === 0) {
                    saveData(videos, 'videos');
                }
                setLeviAsAdmin();
            });

            server.on('error', (err) => {
                console.error('[ServerError] Server error:', err.message);
            });
        } catch (error) {
            console.error('[startServer] Error starting server:', error.message);
        }
    };

    console.log('[Initialize] Starting server');
    await startServer();
    console.log('[Initialize] Initialization complete');
}

// Helper to standardize timestamps
function getCurrentTime() {
    return Date.now(); // Always milliseconds
}

app.post('/reset-levi-quests', async (req, res) => {
    try {
        const username = 'levi';
        const now = Date.now();
        await db.collection('users').updateOne(
            { username: username },
            {
                $set: {
                    'quests.daily': [
                        { id: 'arcade-play', title: 'Arcade Play', description: 'Play arcade games for 5 mins', goal: 5, reward: 20, progress: 0, completed: false, claimed: false, resetTimestamp: now },
                        { id: 'social-squeeze', title: 'Social Squeeze', description: 'Visit 2 social links', goal: 2, reward: 20, progress: 0, completed: false, claimed: false, resetTimestamp: now },
                        { id: 'citrus-explorer', title: 'Citrus Explorer', description: 'Post or comment 5 times today', goal: 5, reward: 20, progress: 0, completed: false, claimed: false, resetTimestamp: now },
                        { id: 'section-adventurer', title: 'Section Adventurer', description: 'Visit 7 unique sections today', goal: 7, reward: 40, progress: 0, completed: false, claimed: false, resetTimestamp: now }
                    ],
                    'quests.weekly': [
                        { id: 'grove-keeper', title: 'Grove Keeper', description: 'Stake 3 NFTs', goal: 3, reward: 150, progress: 0, completed: false, claimed: false, resetTimestamp: now },
                        { id: 'lemon-bard', title: 'Lemon Bard', description: 'Post 5 comments or posts', goal: 5, reward: 120, progress: 0, completed: false, claimed: false, resetTimestamp: now },
                        { id: 'arcade-master', title: 'Arcade Master', description: 'Beat all 3 arcade games', goal: 3, reward: 90, progress: 0, completed: false, claimed: false, resetTimestamp: now },
                        { id: 'lemon-evolutionist', title: 'Lemon Evolutionist', description: 'Evolve NFTs', goal: 1, reward: 40, progress: 0, completed: false, claimed: false, resetTimestamp: now }
                    ],
                    'quests.limited': [
                        { id: 'launch-party', title: 'Launch Party', description: 'Mint 1 NFT this month', goal: 1, reward: 75, progress: 0, completed: false, claimed: false, resetTimestamp: now },
                        { id: 'million-lemon-bash', title: 'Million Lemon Bash', description: 'Evolve 2 NFTs this month', goal: 2, reward: 500, progress: 0, completed: false, claimed: false, resetTimestamp: now }
                    ],
                    lastDailyReset: now,
                    weeklyResetTimestamp: now,
                    limitedResetTimestamp: now
                }
            }
        );
        users[username] = await db.collection('users').findOne({ username: username });
        console.log(`[ResetLeviQuests] All quests reset for ${username}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[ResetLeviQuests] Error:', error.message);
        res.status(500).json({ error: 'Failed to reset Levi\'s quests' });
    }
});

function getRandomItem(array, rarityRules = null) {
    if (!array || array.length === 0) throw new Error('No items available in array for random selection');
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

const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');

const lambdaClient = new LambdaClient({
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIAW5WU5LN7HKW7BNXV',
        secretAccessKey: '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'
    }
});

async function generateNFT(tokenId, stageName = 'Lemon Seed') {
    console.log(`[GenerateNFT] Invoking Lambda for tokenId: ${tokenId}, stageName: ${stageName}`);
    const rarityRules = { 'diamond': 0.2, 'red': 0.4, 'purple': 0.5 };

    const payload = {
        stageName: stageName,
        tokenId: tokenId.toString(),
        rarityRules: rarityRules
    };

    const command = new InvokeCommand({
        FunctionName: 'GenerateNFT',
        Payload: JSON.stringify(payload),
        InvocationType: 'RequestResponse'
    });

    try {
        const response = await lambdaClient.send(command);
        const result = JSON.parse(Buffer.from(response.Payload).toString());
        if (response.FunctionError) {
            console.error(`[GenerateNFT] Lambda error: ${result.errorMessage}`);
            throw new Error(result.errorMessage);
        }

        const body = JSON.parse(result.body);
        console.log(`[GenerateNFT] Lambda success: imageUrl: ${body.imageUrl}, metadataUrl: ${body.metadataUrl}`);
        return { imagePath: body.imageUrl, metadataPath: body.metadataUrl };
    } catch (error) {
        console.error(`[GenerateNFT] Failed to invoke Lambda: ${error.message}`);
        throw error;
    }
}

async function updateQuestProgress(username, type, questId, increment) {
    const lowerUsername = username.toLowerCase();
    const user = users[lowerUsername];
    console.log(`[Quest Update] Attempting ${lowerUsername}, ${type}, ${questId}, increment: ${increment}`);
    if (!user || !user.quests || !user.quests[type]) {
        console.error(`[Quest Update] Invalid user or type: ${lowerUsername}, ${type}`);
        return;
    }
    const quest = user.quests[type].find(q => q.id === questId);
    if (!quest) {
        console.error(`[Quest Update] Quest not found: ${questId} in ${type}`);
        return;
    }

    const now = Date.now();
    const todayMidnight = new Date().setUTCHours(0, 0, 0, 0);
    const weekInterval = 7 * 24 * 60 * 60 * 1000;
    const monthInterval = 30 * 24 * 60 * 60 * 1000;

    // Reset logic
    if (type === 'daily' && (user.lastDailyReset < todayMidnight || !user.lastDailyReset)) {
        console.log(`[Quest Update] Resetting all daily quests for ${lowerUsername}`);
        user.quests.daily = user.quests.daily.map(q => ({ ...q, progress: 0, completed: false, claimed: false, resetTimestamp: now }));
        user.lastDailyReset = now;
        await saveData(users, 'users'); // Save reset immediately
    } else if (type === 'weekly' && (now >= (user.weeklyResetTimestamp || 0) + weekInterval)) {
        console.log(`[Quest Update] Resetting weekly quests for ${lowerUsername}`);
        user.quests.weekly = user.quests.weekly.map(q => ({ ...q, progress: 0, completed: false, claimed: false, resetTimestamp: now }));
        user.weeklyResetTimestamp = now;
        await saveData(users, 'users');
    } else if (type === 'limited' && (now >= (user.limitedResetTimestamp || 0) + monthInterval)) {
        console.log(`[Quest Update] Resetting limited quests for ${lowerUsername}`);
        user.quests.limited = user.quests.limited.map(q => ({ ...q, progress: 0, completed: false, claimed: false, resetTimestamp: now }));
        user.limitedResetTimestamp = now;
        await saveData(users, 'users');
    }

    // Re-fetch quest after reset
    const updatedQuest = user.quests[type].find(q => q.id === questId);
    if (updatedQuest.completed && !updatedQuest.claimed) {
        console.log(`[Quest Update] ${questId} completed but not claimed—awaiting claim`);
        return;
    }

    const numericIncrement = Number(increment) || 1;
    updatedQuest.progress = Math.min(updatedQuest.progress + numericIncrement, updatedQuest.goal);
    if (updatedQuest.progress >= updatedQuest.goal) updatedQuest.completed = true;
    updatedQuest.resetTimestamp = now;
    console.log(`[Quest Update] ${lowerUsername} - ${type} - ${questId}: Progress ${updatedQuest.progress}/${updatedQuest.goal}, Completed: ${updatedQuest.completed}`);

    try {
        await saveData(users, 'users');
    } catch (error) {
        console.error(`[Quest Update] Save failed for ${lowerUsername}: ${error.message}`);
    }
}

function awardPoints(username, category, points, activity) {
    if (!users[username]) return;
    const pointValue = BigInt(points);
    if (category === 'staking') users[username].stakingPoints = Number((BigInt(users[username].stakingPoints || 0) + pointValue));
    else if (category === 'arcade') users[username].arcadePoints = Number((BigInt(users[username].arcadePoints || 0) + pointValue));
    else if (category === 'quest') users[username].questPoints = Number((BigInt(users[username].questPoints || 0) + pointValue));
    else if (category === 'minting') users[username].mintingPoints = Number((BigInt(users[username].mintingPoints || 0) + pointValue));
    else if (category === 'bonus') users[username].bonusPoints = Number((BigInt(users[username].bonusPoints || 0) + pointValue));
    console.log(`[Points] ${username} earned ${points} ${category} points for ${activity}`);
    saveData(users, 'users');
}

function getLemonadePoints(username) {
    const user = users[username];
    return Number((BigInt(user.stakingPoints || 0) + BigInt(user.arcadePoints || 0) + BigInt(user.questPoints || 0) + BigInt(user.mintingPoints || 0) + BigInt(user.bonusPoints || 0)));
}


initialize().then(() => {
   
});

let loggedInUsername = null;

async function requireAdmin(req, res, next) {
    if (!req.session || !req.session.username) {
        console.log('[RequireAdmin] No session or username found');
        return res.status(401).json({ error: 'Please log in' });
    }
    loggedInUsername = req.session.username;
    try {
        const user = await db.collection('users').findOne({ username: loggedInUsername });
        if (!user || !user.isAdmin) {
            console.log(`[RequireAdmin] User ${loggedInUsername} not found or not admin:`, user);
            return res.status(403).json({ error: 'Admin access required' });
        }
        console.log(`[RequireAdmin] Admin ${loggedInUsername} authenticated`);
        next();
    } catch (err) {
        console.error('[RequireAdmin] DB Error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
}

function requirePermission(permission) {
    return (req, res, next) => {
        if (!loggedInUsername) {
            return res.status(401).json({ error: 'Please log in' });
        }
        const user = users[loggedInUsername];
        if (!user.isAdmin && (!user.permissions || !user.permissions[permission])) {
            return res.status(403).json({ error: `Permission ${permission} required` });
        }
        next();
    };
}

// Ensure session is initialized
const session = require('express-session');
app.use(session({
    secret: 'bc9bdf51beca4d820288cf27171c9f33b7ace452aca29f71efecb812bb5e023b', 
    resave: false,
    saveUninitialized: false,
     cookie: { 
        secure: false, // Set to false for local dev (http), true for production (https)
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true
    }
}));

// Debug logging middleware
app.use((req, res, next) => {
    console.log('[Session] Session ID:', req.sessionID, 'Username:', req.session.username);
    next();
});

function trackLoginStreak(username) {
    if (!users[username]) return 0;
    const now = new Date();
    const lastLogin = users[username].lastLogin ? new Date(users[username].lastLogin) : new Date(0);
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayMidnight = new Date(todayMidnight.getTime() - 24 * 60 * 60 * 1000);

    let pointsAwarded = 0;
    if (lastLogin < todayMidnight) {
        if (lastLogin >= yesterdayMidnight) {
            users[username].loginStreak = (users[username].loginStreak || 0) + 1;
        } else {
            users[username].loginStreak = 1;
        }
        pointsAwarded = users[username].loginStreak * 5;
        console.log(`[LoginStreak] ${username} logged in, streak: ${users[username].loginStreak}, points: ${pointsAwarded}`);
        awardPoints(username, 'bonus', pointsAwarded, `Login Streak (Day ${users[username].loginStreak})`);
    }
    users[username].lastLogin = now.getTime();
    saveData(users, 'users');
    return pointsAwarded;
}

app.post('/register', async (req, res) => {
    try {
        const { email, username, password, emailConsent } = req.body;
        if (!email || !username || !password) return res.status(400).json({ error: 'Email, username, and password required' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });

        const lowerUsername = username.toLowerCase();
        const userExists = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (userExists) return res.status(400).json({ error: 'Username already taken' });

        const verificationToken = Math.random().toString(36).substring(2, 15);
        const newUser = { 
            email,
            password, 
            username: lowerUsername,
            nfts: [], 
            stakingPoints: 0,
            arcadePoints: 0,
            questPoints: 0,
            mintingPoints: 0,
            bonusPoints: 0,
            stakingCount: 0,
            postingCount: 0,
            arcadePlaytime: 0,
            loginStreak: 0,
            lastLogin: 0,
            lastDailyReset: 0,
            weeklyResetTimestamp: Date.now(),
            limitedResetTimestamp: Date.now(), // Add this
            profilePic: getRandomItem(profilePics),
            quests: {
                daily: quests.daily.map(q => ({ id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                weekly: quests.weekly.map(q => ({ id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
                limited: quests.limited.map(q => ({ id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() }))
            },
            isVerified: false,
            verificationToken,
            emailConsent,
            subscriptionId: null,
            isPremium: false,
            isAdmin: false,
            tweetsToday: 0
        };
        await db.collection('users').insertOne(newUser);
        users[lowerUsername] = newUser;
        await saveData(users, 'users');

        const command = new SendEmailCommand({
            Source: 'lemonclub@usa.com',
            Destination: { ToAddresses: [email] },
            Message: {
                Subject: { Data: 'Verify Your Lemon Club Collective Account' },
                Body: {
                     Html: { 
                        Data: `<p>Welcome to Lemon Club Collective! Click <a href="http://lemonclub-env2.us-east-1.elasticbeanstalk.com/verify-email/${username}/${verificationToken}">this link</a> to verify your email.</p>` 
                    },
                    Text: { Data: `Welcome to Lemon Club Collective! Verify your email by copying this link into your browser: http://lemonclub-env2.us-east-1.elasticbeanstalk.com/verify-email/${username}/${verificationToken}` }
                }
            }
        });
        await transporter.send(command);
        console.log(`[Register] New user: ${username}, verification email sent to ${email}`);
        res.json({ success: true, message: 'Registered—check email to verify!' });
    } catch (error) {
        console.error('[Register] Error:', error.message);
        res.status(500).json({ error: 'Failed to register' });
    }
});

app.get('/verify-email/:username/:token', async (req, res) => {
    const { username, token } = req.params;
    const lowerUsername = username.toLowerCase(); // Normalize to lowercase
    const user = await db.collection('users').findOne({ username: lowerUsername });
    if (!user || user.verificationToken !== token) {
        console.log(`[Verify-Email] Failed for ${lowerUsername}: user=${JSON.stringify(user)}, token=${token}`);
        return res.status(400).send('Invalid verification token');
    }
    await db.collection('users').updateOne(
        { username: lowerUsername },
        { $set: { isVerified: true, verificationToken: null } }
    );
    users[lowerUsername] = { ...user, isVerified: true, verificationToken: null };
    await saveData(users, 'users');
    console.log(`[Verify-Email] Successfully verified ${lowerUsername}`);
    res.send('Email Verified! <a href="/">Click here to log in</a>');
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            console.log('[Login] Missing credentials');
            return res.status(400).json({ error: 'Username and password required' });
        }
        const lowerUsername = username.toLowerCase();
        console.log('[Login] Querying for:', lowerUsername);
        const user = await db.collection('users').findOne({ username: lowerUsername });
        if (!user) {
            console.log('[Login] User not found:', lowerUsername);
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        if (user.password !== password) {
            console.log('[Login] Password mismatch for:', lowerUsername);
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        if (!user.isVerified) {
            console.log('[Login] User not verified:', lowerUsername);
            return res.status(403).json({ error: 'Please verify your email first' });
        }
        req.session.username = lowerUsername;
        console.log('[Login] Session set for:', req.session.username);
        loggedInUsername = lowerUsername;
        const pointsAwarded = trackLoginStreak(lowerUsername);
        console.log('[Login] Points awarded:', pointsAwarded);
        user.lemonadePoints = getLemonadePoints(lowerUsername);
        console.log('[Login] Lemonade points:', user.lemonadePoints);
        await db.collection('users').updateOne({ username: lowerUsername }, { $set: user });
        res.json({ 
            success: true, 
            profilePic: user.profilePic, 
            isAdmin: user.isAdmin || false,
            lemonadePoints: user.lemonadePoints,
            stakingPoints: user.stakingPoints || 0,
            arcadePoints: user.arcadePoints || 0,
            questPoints: user.questPoints || 0,
            mintingPoints: user.mintingPoints || 0,
            bonusPoints: user.bonusPoints || 0
        });
        users[lowerUsername] = user;
        await saveData(users, 'users');
    } catch (error) {
        console.error('[Login] Error:', error.message, error.stack);
        res.status(500).json({ error: 'Login failed' });
    }
});

app.get('/node_modules/big-integer/big-integer.js', (req, res) => {
    const filePath = path.join(__dirname, 'node_modules', 'big-integer', 'BigInteger.js');
    console.log('[Route Hit] Serving big-integer.js from:', filePath);
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('[File Serve Error]', err);
            res.status(404).send('BigInteger file not found');
        }
    });
});

app.post('/fix-user-case', async (req, res) => {
    try {
        const username = 'Test123';
        const lowerUsername = username.toLowerCase();
        const user = users[username];
        if (user) {
            users[lowerUsername] = user;
            delete users[username];
            await db.collection('users').updateOne(
                { username: username },
                { $set: { username: lowerUsername } }
            );
            await saveData(users, 'users');
            console.log(`[FixUserCase] Updated username from ${username} to ${lowerUsername}`);
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('[FixUserCase] Error:', error.message);
        res.status(500).json({ error: 'Failed to fix user case' });
    }
});

app.post('/reset-all-quests', async (req, res) => {
    try {
        const username = 'levi';
        if (!users[username]) return res.status(404).json({ error: 'User not found' });
        const now = Date.now();
        users[username].quests.daily = quests.daily.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            goal: q.goal,
            reward: q.reward,
            progress: 0,
            completed: false,
            claimed: false,
            resetTimestamp: now
        }));
        users[username].quests.weekly = quests.weekly.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            goal: q.goal,
            reward: q.reward,
            progress: 0,
            completed: false,
            claimed: false,
            resetTimestamp: now
        }));
        users[username].quests.limited = quests.limited.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            goal: q.goal,
            reward: q.reward,
            progress: 0,
            completed: false,
            claimed: false,
            resetTimestamp: now
        }));
        users[username].lastDailyReset = now;
        users[username].weeklyResetTimestamp = now;
        users[username].limitedResetTimestamp = now;
        await saveData(users, 'users');
        console.log(`[ResetAllQuests] All quests reset for ${username}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[ResetAllQuests] Error:', error.message);
        res.status(500).json({ error: 'Failed to reset all quests' });
    }
});

app.post('/fix-timestamps', async (req, res) => {
    try {
        const username = 'levi';
        if (!users[username]) return res.status(404).json({ error: 'User not found' });
        const now = Date.now();
        users[username].lastDailyReset = now;
        users[username].weeklyResetTimestamp = now;
        users[username].limitedResetTimestamp = now;
        await saveData(users, 'users');
        console.log(`[FixTimestamps] Timestamps reset for ${username}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[FixTimestamps] Error:', error.message);
        res.status(500).json({ error: 'Failed to fix timestamps' });
    }
});

app.post('/api/mint-nft', async (req, res) => {
    try {
        const { walletAddress, username } = req.body;
        if (!walletAddress || !username) {
            console.log('[Mint] Missing walletAddress or username');
            return res.status(400).json({ error: 'Missing required fields' });
        }
        console.log('[Mint] Starting mint for:', username, walletAddress);

        // Initialize Solana connection and constants
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const userPubkey = new PublicKey(walletAddress);
        const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
        const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
        const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

        const mintKeypair = Keypair.generate();
        const mintPublicKey = mintKeypair.publicKey.toBase58();
        console.log('[Mint] Mint Pubkey:', mintPublicKey);

        // Transaction 1: Create and Initialize Mint
        const lamports = await connection.getMinimumBalanceForRentExemption(82);
        const tx1 = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: userPubkey,
                newAccountPubkey: mintKeypair.publicKey,
                lamports,
                space: 82,
                programId: TOKEN_PROGRAM_ID
            }),
            createInitializeMintInstruction(
                mintKeypair.publicKey,
                0,
                wallet.publicKey, // Server wallet as mint authority
                null,
                TOKEN_PROGRAM_ID
            )
        );

        // Add ATA and Mint To instructions to tx1
        const tokenAccount = await getAssociatedTokenAddress(
            mintKeypair.publicKey,
            userPubkey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        );
        tx1.add(
            createAssociatedTokenAccountInstruction(
                userPubkey,
                tokenAccount,
                userPubkey,
                mintKeypair.publicKey,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            ),
            createMintToInstruction(
                mintKeypair.publicKey,
                tokenAccount,
                wallet.publicKey,
                1,
                [],
                TOKEN_PROGRAM_ID
            )
        );

        // Transaction 2: Set Metadata
        const tx2 = new Transaction();
        const [metadataPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBytes(), mintKeypair.publicKey.toBytes()],
            TOKEN_METADATA_PROGRAM_ID
        );

        // Generate NFT assets
        const tokenId = Date.now();
        console.log('[Mint] Generating NFT for tokenId:', tokenId);
        let imagePath, metadataPath;
        try {
            const result = await generateNFT(tokenId, 'Lemon Seed');
            imagePath = result.imagePath;
            metadataPath = result.metadataPath;
        } catch (error) {
            console.error('[Mint] Failed to generate NFT:', error);
            throw new Error('NFT generation failed: ' + error.message);
        }
        console.log('[Mint] Image:', imagePath, 'Metadata:', metadataPath);

        // Verify metadata in S3
        const metadataKey = `usernft/nft_${tokenId}.json`;
        let attempts = 0;
        const maxAttempts = 10;
        while (attempts < maxAttempts) {
            try {
                await s3Client.send(new HeadObjectCommand({
                    Bucket: 'lemonclub-nftgen',
                    Key: metadataKey
                }));
                console.log(`[Mint] Metadata verified in S3: ${metadataKey}`);
                break;
            } catch (error) {
                console.warn(`[Mint] Metadata not yet available in S3 (attempt ${attempts + 1}/${maxAttempts}):`, error);
                attempts++;
                if (attempts === maxAttempts) throw new Error('Metadata not available in S3 after retries');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // Verify metadata accessibility via CloudFront
        attempts = 0;
        let metadataContent;
        while (attempts < maxAttempts) {
            try {
                const response = await axios.get(metadataPath, { responseType: 'json' });
                metadataContent = response.data;
                console.log(`[Mint] Metadata fetched from CloudFront: ${metadataPath}`, metadataContent);
                break;
            } catch (error) {
                console.warn(`[Mint] Failed to fetch metadata from CloudFront (attempt ${attempts + 1}/${maxAttempts}):`, error.message);
                attempts++;
                if (attempts === maxAttempts) throw new Error('Metadata not accessible via CloudFront after retries');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }

        // Set on-chain metadata
        const name = `Lemon Seed #${tokenId}`;
        const symbol = 'LSEED';
        const metadataUri = metadataPath;
        const dataBuffer = Buffer.concat([
            Buffer.from([33]), // createMetadataAccountV3 instruction
            Buffer.from(Uint32Array.from([name.length]).buffer),
            Buffer.from(name),
            Buffer.from(Uint32Array.from([symbol.length]).buffer),
            Buffer.from(symbol),
            Buffer.from(Uint32Array.from([metadataUri.length]).buffer),
            Buffer.from(metadataUri),
            Buffer.from(Uint16Array.from([500]).buffer), // Seller fee basis points
            Buffer.from([0]), // No update authority
            Buffer.from([0]), // No collection
            Buffer.from([0]), // No uses
            Buffer.from([1]), // Is mutable
            Buffer.from([0])  // No creators
        ]);

        tx2.add(
            new TransactionInstruction({
                keys: [
                    { pubkey: metadataPDA, isSigner: false, isWritable: true },
                    { pubkey: mintKeypair.publicKey, isSigner: false, isWritable: false },
                    { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
                    { pubkey: userPubkey, isSigner: true, isWritable: false },
                    { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
                    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                ],
                programId: TOKEN_METADATA_PROGRAM_ID,
                data: dataBuffer,
            })
        );

        // Set blockhash and sign transactions
        const { blockhash } = await connection.getLatestBlockhash();
        tx1.recentBlockhash = blockhash;
        tx2.recentBlockhash = blockhash;
        tx1.feePayer = userPubkey;
        tx2.feePayer = userPubkey;
        tx1.partialSign(mintKeypair);
        tx2.partialSign(wallet);

        // Database update with enhanced retry and validation
        const lowerUsername = username.toLowerCase();
        let user = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user) {
            console.error('[Mint] User not found in database:', username);
            throw new Error('User not found');
        }
        if (!user.nfts) user.nfts = [];
        const nftData = {
            mintAddress: mintPublicKey,
            name: name,
            imageUri: imagePath,
            staked: false,
            stakeStart: 0,
            lastPoints: 0
        };
        user.nfts.push(nftData);
        console.log('[Mint] Added NFT to user.nfts:', nftData);

        let dbUpdateSuccess = false;
        attempts = 0;
        const maxDbAttempts = 5;
        while (attempts < maxDbAttempts) {
            try {
                const updateResult = await db.collection('users').updateOne(
                    { username: { $regex: `^${username}$`, $options: 'i' } },
                    { $set: { nfts: user.nfts } }
                );
                console.log('[Mint] Database update result:', updateResult);
                if (updateResult.matchedCount === 0) {
                    throw new Error('No matching user found in database');
                }
                if (updateResult.modifiedCount === 0) {
                    console.warn('[Mint] No changes made to database - possible duplicate update');
                }
                dbUpdateSuccess = true;
                break;
            } catch (error) {
                console.error(`[Mint] Database update attempt ${attempts + 1}/${maxDbAttempts} failed:`, error.message);
                attempts++;
                if (attempts === maxDbAttempts) {
                    throw new Error('Failed to update user data in database after retries');
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Verify the update
        if (dbUpdateSuccess) {
            const updatedUser = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
            const nftExists = updatedUser.nfts.some(nft => nft.mintAddress === mintPublicKey);
            if (!nftExists) {
                console.error('[Mint] NFT not found in database after update:', mintPublicKey);
                throw new Error('NFT not saved to database');
            }
            console.log('[Mint] Verified NFT in database:', updatedUser.nfts.find(nft => nft.mintAddress === mintPublicKey));
            users[lowerUsername] = updatedUser; // Update in-memory cache
            await saveData(users, 'users');
            console.log('[Mint] In-memory users updated for:', lowerUsername);
        } else {
            throw new Error('Database update not confirmed');
        }

        // Award points and update quest progress
        awardPoints(lowerUsername, 'minting', 25, `Minting NFT ${mintPublicKey.slice(0, 8)}...`);
        updateQuestProgress(lowerUsername, 'limited', 'launch-party', 1);

        // Send response
        res.json({
            transaction1: Buffer.from(tx1.serialize({ requireAllSignatures: false })).toString('hex'),
            transaction2: Buffer.from(tx2.serialize({ requireAllSignatures: false })).toString('hex'),
            mintPublicKey
        });
    } catch (error) {
        console.error('[Mint] Error:', error);
        res.status(500).json({ error: 'Failed to prepare mint transaction', details: error.message });
    }
});

app.get('/check-nft/:mintAddress', async (req, res) => {
    const { mintAddress } = req.params;
    try {
        const mintPubkey = new PublicKey(mintAddress);
        console.log('[CheckNFT] Checking mint:', mintAddress);
        const metadataAccount = await metaplex.nfts().findByMint({ mintAddress: mintPubkey });
        console.log('[CheckNFT] Metadata for', mintAddress, ':', JSON.stringify(metadataAccount, null, 2));
        res.json(metadataAccount);
    } catch (error) {
        console.error('[CheckNFT] Error for', mintAddress, ':', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/node_modules/big-integer/big-integer.js', (req, res) => {
    const filePath = path.join(__dirname, 'node_modules', 'big-integer', 'BigInteger.js');
    console.log('[Route Hit] Serving big-integer.js from:', filePath);
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('[File Serve Error]', err);
            res.status(404).send('BigInteger file not found');
        }
    });
});

// server.js, replace /delete-video (around line 2678+)
app.post('/delete-video', async (req, res) => {
    try {
        const { id } = req.body; // Change from index to id
        if (!req.session || !req.session.username) {
            console.log('[DeleteVideo] No session or username found');
            return res.status(401).json({ error: 'Please log in' });
        }
        const user = await db.collection('users').findOne({ username: req.session.username });
        if (!user || !user.isAdmin) {
            console.log(`[DeleteVideo] User ${req.session.username} not admin`);
            return res.status(403).json({ error: 'Admin access required' });
        }

        const video = await db.collection('videos').findOne({ _id: new ObjectId(id) });
        if (!video) {
            console.log(`[DeleteVideo] Video not found: ${id}`);
            return res.status(404).json({ error: 'Video not found' });
        }

        const videoPath = path.join(__dirname, 'videos', path.basename(video.url));
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
            console.log(`[DeleteVideo] Deleted video file: ${videoPath}`);
        } else {
            console.log(`[DeleteVideo] Video file not found: ${videoPath}`);
        }

        await db.collection('videos').deleteOne({ _id: new ObjectId(id) });
        videos = await db.collection('videos').find().toArray();
        console.log(`[DeleteVideo] Admin ${req.session.username} deleted video ${id}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[DeleteVideo] Error:', error.message);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

/// server.js, replace /delete-blog (around your line 2678+)
app.post('/delete-blog', async (req, res) => {
    try {
        const { id } = req.body; // Use id, not index
        if (!req.session || !req.session.username) {
            console.log('[DeleteBlog] No session or username found');
            return res.status(401).json({ error: 'Please log in' });
        }
        const user = await db.collection('users').findOne({ username: req.session.username });
        if (!user || !user.isAdmin) {
            console.log(`[DeleteBlog] User ${req.session.username} not admin`);
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await db.collection('blogs').deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            console.log(`[DeleteBlog] Blog not found: ${id}`);
            return res.status(404).json({ error: 'Blog not found' });
        }

        blogs = await db.collection('blogs').find().toArray();
        console.log(`[DeleteBlog] Admin ${req.session.username} deleted blog ${id}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[DeleteBlog] Error:', error.message);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
});

app.post('/delete-post', async (req, res) => {
    try {
        const { postId } = req.body;
        console.log('[DeletePost] Attempting to delete post:', postId);

        // Check if user is logged in via session
        if (!req.session || !req.session.username) {
            console.log('[DeletePost] No session or username');
            return res.status(401).json({ error: 'Please log in' });
        }

        // Verify admin status
        const user = await db.collection('users').findOne({ username: req.session.username });
        if (!user || !user.isAdmin) {
            console.log('[DeletePost] User not admin:', req.session.username);
            return res.status(403).json({ error: 'Admin access required' });
        }

        const result = await db.collection('posts').deleteOne({ _id: new ObjectId(postId) });
        if (result.deletedCount === 0) {
            console.log('[DeletePost] Post not found:', postId);
            return res.status(404).json({ error: 'Post not found' });
        }

        posts = await db.collection('posts').find().toArray();
        console.log(`[DeletePost] Admin ${req.session.username} deleted post ${postId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[DeletePost] Error:', error.message);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

app.post('/upload-profile-pic/:username', async (req, res) => {
    try {
        const username = req.params.username;
        if (!users[username.toLowerCase()]) return res.status(404).json({ error: 'User not found' });

        const storage = multer.diskStorage({
            destination: path.join(__dirname, '..', 'uploads'),
            filename: (req, file, cb) => {
                cb(null, `${Date.now()}.jpg`);
            }
        });
        const upload = multer({ storage: storage }).single('profilePic');

        upload(req, res, async (err) => {
            if (err) return res.status(500).json({ error: 'File upload failed' });
            const baseUrl = process.env.EB_URL || 'https://lemonclubcollective.com';
	    const profilePicUrl = `${baseUrl}/uploads/${req.file.filename}`;
	    users[username.toLowerCase()].profilePic = profilePicUrl;
            await db.collection('users').updateOne({ username: { $regex: `^${username}$`, $options: 'i' } }, { $set: { profilePic: profilePicUrl } });
            await saveData(users, 'users');
            res.json({ success: true, profilePicUrl });
        });
    } catch (error) {
        console.error('[UploadProfilePic] Error:', error.message);
        res.status(500).json({ error: 'Failed to upload profile picture' });
    }
});


app.post('/upload-video', async (req, res) => {
    try {
        const videoDir = path.join(__dirname, 'videos');
        if (!fs.existsSync(videoDir)) {
            fs.mkdirSync(videoDir, { recursive: true });
            console.log(`[VideoUpload] Created videos directory: ${videoDir}`);
        } else {
            console.log(`[VideoUpload] Using existing videos directory: ${videoDir}`);
        }

        if (!req.session || !req.session.username) {
            return res.status(401).json({ error: 'Please log in' });
        }
        const user = await db.collection('users').findOne({ username: req.session.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (!user.isAdmin && (!user.permissions || !user.permissions.canPostVideos)) {
            return res.status(403).json({ error: 'Permission to post videos required' });
        }

        const storage = multer.diskStorage({
            destination: (req, file, cb) => cb(null, videoDir),
            filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
        });
        const upload = multer({
            storage: storage,
            limits: { fileSize: 1024 * 1024 * 1024 } // 1GB limit
        }).single('video');

        upload(req, res, async (err) => {
            if (err) {
                console.error('[VideoUpload] Multer error:', err.message);
                return res.status(500).json({ error: 'Video upload failed: ' + err.message });
            }
            if (!req.file) {
                return res.status(400).json({ error: 'No video file uploaded' });
            }
            const { title = 'Default Title', description = 'Default Description' } = req.body;
           const fileContent = fs.readFileSync(req.file.path);
            const uploadParams = {
    Bucket: 'lemonclub-videos',
    Key: `videos/${req.file.filename}`,
    Body: fileContent,
    ContentType: 'video/mp4', // Explicitly set to video/mp4
    ContentDisposition: 'inline', // Ensure it’s playable in the browser
};
            await s3Client.send(new PutObjectCommand(uploadParams));

            // Delete the local file after uploading to S3
            fs.unlinkSync(req.file.path);

            // Use CloudFront URL
            const videoUrl = `https://d18hbxl467xhey.cloudfront.net/videos/${req.file.filename}`;
            const videoDoc = { title, description, url: videoUrl, timestamp: new Date().toISOString(), uploadedBy: req.session.username };
            
            await db.collection('videos').insertOne(videoDoc);
            videos = await db.collection('videos').find().toArray();
            console.log(`[VideoUpload] Saved to MongoDB: ${videoUrl}`);
            res.json({ success: true, video: videoDoc });
        });
    } catch (error) {
        console.error('[VideoUpload] Error:', error.message);
        res.status(500).json({ error: 'Failed to upload video' });
    }
});

app.post('/playtime/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { minutes } = req.body;
        if (!users[username.toLowerCase()]) return res.status(404).json({ success: false, error: 'User not found' });
        if (!minutes || minutes < 0) return res.status(400).json({ success: false, error: 'Invalid playtime' });

        const wholeMinutes = Math.floor(minutes);
        awardPoints(username.toLowerCase(), 'arcade', wholeMinutes, `Arcade Playtime (${wholeMinutes} minutes)`);
        updateQuestProgress(username.toLowerCase(), 'daily', 'arcade-play', wholeMinutes);
        await saveData(users, 'users');
        res.json({
            success: true,
            arcadePoints: users[username.toLowerCase()].arcadePoints,
            lemonadePoints: getLemonadePoints(username.toLowerCase())
        });
    } catch (error) {
        console.error('[Playtime] Error:', error.message);
        res.status(500).json({ error: 'Failed to update playtime' });
    }
});

app.post('/claim-victory/:username/:gameId', async (req, res) => {
    try {
        const { username, gameId } = req.params;
        if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });
        if (!users[username].claimedVictories) users[username].claimedVictories = [];
        if (users[username].claimedVictories.includes(gameId)) return res.status(400).json({ success: false, error: 'Victory already claimed' });
        users[username].claimedVictories.push(gameId);
        awardPoints(username, 'arcade', 25, `Victory Claimed (${gameId})`);
        updateQuestProgress(username, 'weekly', 'arcade-master', 1);
        saveData(users, 'users');
        res.json({ success: true });
    } catch (error) {
        console.error('[ClaimVictory] Error:', error.message);
        res.status(500).json({ error: 'Failed to claim victory' });
    }
});

app.post('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await db.collection('users').findOne({ username });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        console.error('[Profile] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/profile/:username/update-pic', requireAdmin, async (req, res) => {
    try {
        const { username } = req.params;
        const { profilePic } = req.body;
        const user = await db.collection('users').findOne({ username });
        if (!user) return res.status(404).json({ error: 'User not found' });
        await db.collection('users').updateOne(
            { username },
            { $set: { profilePic } }
        );
        users[username.toLowerCase()] = { ...user, profilePic }; // Sync in-memory
        console.log(`[Profile] Updated profile pic for ${username}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[ProfileUpdate] Error:', error.message);
        res.status(500).json({ error: 'Failed to update profile pic' });
    }
});

app.post('/quests/:username/update', async (req, res) => {
    console.log(`[Quest Update Endpoint] Received request for ${req.params.username}:`, req.body);
    try {
        const { username } = req.params;
        const lowerUsername = username.toLowerCase();
        const { type, questId, increment } = req.body;
        if (!users[lowerUsername]) {
            console.error(`[Quest Update] User not found: ${lowerUsername}`);
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        if (!type || !questId) {
            console.error(`[Quest Update] Invalid request: type=${type}, questId=${questId}, increment=${increment}`);
            return res.status(400).json({ success: false, error: 'Missing type or questId' });
        }
        const numericIncrement = Number(increment) || 1;
        if (isNaN(numericIncrement)) {
            console.error(`[Quest Update] Invalid increment value: ${increment}`);
            return res.status(400).json({ success: false, error: 'Increment must be a number' });
        }
        updateQuestProgress(lowerUsername, type, questId, numericIncrement);
        const quest = users[lowerUsername].quests[type].find(q => q.id === questId);
        res.json({ success: true, progress: quest ? quest.progress : 0 });
    } catch (error) {
        console.error('[Quest Update Endpoint] Error:', error.message);
        res.status(500).json({ error: 'Failed to update quest progress' });
    }
});

app.post('/nft/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await db.collection('users').findOne({ username });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({ success: true, nfts: user.nfts });
    } catch (error) {
        console.error('[NFT] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch NFTs' });
    }
});

app.get('/profile/:username', async (req, res) => {
 console.log('[Profile] Hit route for:', req.params.username); 
    try {
        const { username } = req.params;
        const user = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        const lemonadePoints = getLemonadePoints(username.toLowerCase()).toString(); 
        res.json({ 
            success: true, 
            username: user.username, 
               profilePic: user.profilePic || 'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png', // Fix this
            lemonadePoints, // Use computed value
            stakingPoints: user.stakingPoints || 0, 
            arcadePoints: user.arcadePoints || 0, 
            questPoints: user.questPoints || 0, 
            mintingPoints: user.mintingPoints || 0, 
            bonusPoints: user.bonusPoints || 0, 
	    isAdmin: user.isAdmin || false // Add this field
        });
    } catch (error) {
        console.error('[Profile] Error fetching profile:', error.message);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/profile/:username/update-pic', requireAdmin, async (req, res) => {
    try {
        const { username } = req.params;
        const { profilePic } = req.body;
        const user = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        await db.collection('users').updateOne(
            { username: { $regex: `^${username}$`, $options: 'i' } },
            { $set: { profilePic } }
        );
        if (users[username.toLowerCase()]) {
            users[username.toLowerCase()].profilePic = profilePic;
        }
        console.log(`[Profile] Updated profile pic for ${username}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[ProfileUpdate] Error:', error.message);
        res.status(500).json({ error: 'Failed to update profile pic' });
    }
});

app.get('/api/quests/:username', async (req, res) => {
    console.log(`[Quest Fetch] Fetching quests for ${req.params.username}`);
    try {
        const { username } = req.params;
        const lowerUsername = username.toLowerCase();
        const user = await db.collection('users').findOne({ username: { $regex: `^${lowerUsername}$`, $options: 'i' } });
        if (!user) {
            console.error(`[Quest Fetch] User not found: ${lowerUsername}`);
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const quests = user.quests || { daily: [], weekly: [], limited: [] };
        res.json({ success: true, quests });
    } catch (error) {
        console.error('[Quest Fetch] Error:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch quests' });
    }
});

app.get('/nft/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user) {
            console.error(`[NFT] User not found: ${username}`);
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        console.log(`[NFT] Fetched NFTs for ${username}:`, user.nfts.length);
        res.json({ success: true, nfts: user.nfts || [] });
    } catch (error) {
        console.error('[NFT] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch NFTs' });
    }
});


app.post('/stake/:username/:mintAddress', async (req, res) => {
    try {
        const { username, mintAddress } = req.params;
        const lowerUsername = username.toLowerCase();
        console.log(`[Stake] Attempting to stake NFT ${mintAddress} for ${lowerUsername}`);
        const user = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const nft = user.nfts.find(n => n.mintAddress === mintAddress);
        if (!nft || nft.staked) return res.status(400).json({ success: false, error: 'NFT not found or already staked' });

        nft.staked = true;
        nft.stakeStart = Date.now();
        user.stakingPoints = (user.stakingPoints || 0) + 50;
        updateQuestProgress(lowerUsername, 'weekly', 'grove-keeper', 1);
        await db.collection('users').updateOne(
            { username: { $regex: `^${username}$`, $options: 'i' } },
            { $set: user }
        );
        users[lowerUsername] = user; // Sync in-memory
        await saveData(users, 'users');
        console.log(`[Stake] Success: ${lowerUsername} staked ${mintAddress}, +50 staking points`);
        res.json({ success: true });
    } catch (error) {
        console.error('[Stake] Error:', error.message);
        res.status(500).json({ error: 'Failed to stake NFT' });
    }
});

// server.js, replace entire function at line 2500
app.post('/unstake/:username/:mintAddress', async (req, res) => {
    try {
        const { username, mintAddress } = req.params;
        const lowerUsername = username.toLowerCase();
        console.log(`[Unstake] Attempting to unstake NFT ${mintAddress} for ${lowerUsername}`);
        const user = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const nft = user.nfts.find(n => n.mintAddress === mintAddress);
        if (!nft || !nft.staked) return res.status(400).json({ success: false, error: 'NFT not found or not staked' });

        nft.staked = false;
        nft.stakeStart = 0;
        await db.collection('users').updateOne(
            { username: { $regex: `^${username}$`, $options: 'i' } },
            { $set: user }
        );
        users[lowerUsername] = user; // Sync in-memory
        await saveData(users, 'users');
        console.log(`[Unstake] Success: ${lowerUsername} unstaked ${mintAddress}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[Unstake] Error:', error.message);
        res.status(500).json({ error: 'Failed to unstake NFT' });
    }
});


app.get('/evolve/:username/:mintAddress', async (req, res) => {
    try {
        const { username, mintAddress } = req.params;
        const lowerUsername = username.toLowerCase();
        console.log(`[Evolve] Attempting to evolve NFT ${mintAddress} for ${lowerUsername}`);
        const user = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user) {
            console.log(`[Evolve] User not found: ${username}`);
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const lemonadePoints = getLemonadePoints(lowerUsername);
        if (lemonadePoints < 10) return res.status(400).json({ success: false, error: 'Not enough Lemonade Points' });

        const nft = user.nfts.find(n => n.mintAddress === mintAddress);
        if (!nft) return res.status(404).json({ success: false, error: 'NFT not found' });

        const baseStageName = nft.name.split('#')[0].trim();
        console.log(`[Evolve] Attempting to evolve NFT ${mintAddress}, current stage: ${nft.name}, baseStageName: ${baseStageName}`);
        const stageMap = { 'Lemon Seed': 'Lemon Sprout', 'Lemon Sprout': 'Lemon Sapling', 'Lemon Sapling': 'Lemon Tree' };
        if (!stageMap[baseStageName]) {
            console.log(`[Evolve] Cannot evolve further - baseStageName ${baseStageName} not in stageMap`);
            return res.status(400).json({ success: false, error: 'NFT cannot evolve further' });
        }

        const oldStage = nft.name;
        const newStageBase = stageMap[baseStageName];
        nft.name = `${newStageBase} #${oldStage.split('#')[1]}`;
        console.log(`[Evolve] NFT ${mintAddress} evolved from ${oldStage} to ${nft.name}`);

        const tokenId = Date.now();
        const { imagePath, metadataPath } = await generateNFT(tokenId, newStageBase);
        nft.imageUri = imagePath; // Use the CloudFront URL

        const mintPublicKey = new PublicKey(mintAddress);
        try { // Added missing opening brace
            const metadataAccount = await metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
            await metaplex.nfts().update({
                nftOrSft: metadataAccount,
                name: nft.name,
                uri: metadataPath,
                sellerFeeBasisPoints: 500
            });
            console.log(`[Evolve] Metadata updated for ${mintAddress}`);
        } catch (error) {
            console.warn(`[Evolve] Metadata update failed for ${mintAddress}: ${error.message}. Proceeding without on-chain metadata update.`);
        }

        const categories = [
            { name: 'stakingPoints', value: BigInt(user.stakingPoints || 0) },
            { name: 'arcadePoints', value: BigInt(user.arcadePoints || 0) },
            { name: 'questPoints', value: BigInt(user.questPoints || 0) },
            { name: 'mintingPoints', value: BigInt(user.mintingPoints || 0) },
            { name: 'bonusPoints', value: BigInt(user.bonusPoints || 0) }
        ];

        const totalPoints = categories.reduce((sum, cat) => sum + cat.value, BigInt(0));
        if (totalPoints > 0) {
            let pointsToDeduct = BigInt(10);
            for (const category of categories) {
                if (pointsToDeduct <= 0) break;
                const categoryShare = (category.value * pointsToDeduct) / totalPoints || BigInt(1);
                const newValue = BigInt(Math.max(0, Number(category.value - categoryShare)));
                user[category.name] = Number(newValue);
                pointsToDeduct -= categoryShare;
            }
            if (pointsToDeduct > 0) {
                const largestCategory = categories.reduce((max, cat) => cat.value > max.value ? cat : max, categories[0]);
                user[largestCategory.name] = Number(BigInt(Math.max(0, Number(BigInt(user[largestCategory.name]) - pointsToDeduct))));
            }
        }

        await db.collection('users').updateOne(
            { username: { $regex: `^${username}$`, $options: 'i' } },
            { $set: user }
        );
        users[lowerUsername] = user;
        await saveData(users, 'users');
        console.log(`[Evolve] Success: ${lowerUsername} evolved ${mintAddress} to ${nft.name}`);
        res.json({ 
            success: true, 
            lemonadePoints: getLemonadePoints(lowerUsername),
            stakingPoints: user.stakingPoints,
            arcadePoints: user.arcadePoints,
            questPoints: user.questPoints,
            mintingPoints: user.mintingPoints,
            bonusPoints: user.bonusPoints
        });
    } catch (error) {
        console.error('[Evolve] Error:', error.message);
        res.status(500).json({ error: 'Failed to evolve NFT' });
    }
});

app.get('/solana-web3.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules', '@solana', 'web3.js', 'dist', 'index.js'));
});

app.post('/posts', async (req, res) => {
    try {
        const { wallet, content, username } = req.body;
        if (!wallet || !content || !username) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newPost = {
            username: username,
            content: content,
            wallet: wallet,
            timestamp: new Date().toISOString(),
            likes: 0,
            comments: [],
            profilePic: users[username.toLowerCase()]?.profilePic || null,
            likedBy: []
        };
        const result = await db.collection('posts').insertOne(newPost);
        newPost._id = result.insertedId;
        posts.push(newPost);
        await saveData(posts, 'posts');
        updateQuestProgress(username.toLowerCase(), 'daily', 'citrus-explorer', 1);
        updateQuestProgress(username.toLowerCase(), 'weekly', 'lemon-bard', 1);
        res.json({ success: true });
    } catch (error) {
        console.error('[Post] Error:', error);
        res.status(500).json({ error: 'Failed to submit post', details: error.message });
    }
});

app.post('/posts/comment', async (req, res) => {
    try {
        const { postId, parentId, wallet, content, username, profilePic } = req.body;
        if (!wallet || !content || !username || !postId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const newComment = {
            _id: new ObjectId(),
            username,
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
            likedBy: [],
            parentId: parentId ? new ObjectId(parentId) : null,
            profilePic: profilePic || 'https://drahmlrfgetmm.cloudfront.net/assetsNFTmain/profilepics/PFP1.png'
        };
        const result = await db.collection('posts').updateOne(
            { _id: new ObjectId(postId) },
            { $push: { comments: newComment } }
        );
        if (result.modifiedCount === 0) {
            return res.status(500).json({ error: 'Failed to add comment' });
        }
        posts = await db.collection('posts').find().toArray();
        updateQuestProgress(username.toLowerCase(), 'daily', 'citrus-explorer', 1);
        updateQuestProgress(username.toLowerCase(), 'weekly', 'lemon-bard', 1);
        res.json({ success: true, postId });
    } catch (error) {
        console.error('[Comment] Error:', error);
        res.status(500).json({ error: 'Failed to submit comment', details: error.message });
    }
});

app.post('/posts/comment/reply', async (req, res) => {
    try {
        if (!loggedInUsername) return res.status(401).json({ error: 'Please log in to reply' });
        const { postIndex, path, content } = req.body;
        if (!content || postIndex < 0 || postIndex >= posts.length || !Array.isArray(path)) return res.status(400).json({ error: 'Invalid post, path, or content' });
        let comment = posts[postIndex].comments;
        for (let i = 0; i < path.length; i++) {
            if (!comment[path[i]] || !comment[path[i]].replies) return res.status(400).json({ error: 'Invalid comment path' });
            comment = comment[path[i]].replies;
        }
        const reply = { username: loggedInUsername, content, timestamp: new Date().toISOString(), likes: 0, replies: [] };
        comment.unshift(reply);
        await saveData(posts, 'posts');
        await db.collection('posts').updateOne({ timestamp: posts[postIndex].timestamp }, { $set: { comments: posts[postIndex].comments } });
        console.log('[Reply] Added reply to post:', postIndex, 'path:', path, reply);
        res.json({ success: true, reply });
    } catch (error) {
        console.error('[Reply] Error:', error.message);
        res.status(500).json({ error: 'Failed to reply' });
    }
});

// [Unchanged imports and setup]

// Update /posts/like to return a better message
app.post('/posts/like', async (req, res) => {
    try {
        const { wallet, postId } = req.body;
        if (!wallet || !postId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        post.likedBy = post.likedBy || [];
        if (post.likedBy.includes(wallet)) {
            return res.status(400).json({ error: 'You have already liked this post' });
        }
        post.likedBy.push(wallet);
        const updatedLikes = (post.likes || 0) + 1;
        await db.collection('posts').updateOne(
            { _id: new ObjectId(postId) },
            { $set: { likes: updatedLikes, likedBy: post.likedBy } }
        );
        posts = await db.collection('posts').find().toArray();
        res.json({ success: true, likes: updatedLikes });
    } catch (error) {
        console.error('[Like] Error:', error);
        res.status(500).json({ error: 'Failed to like post', details: error.message });
    }
});

// Update /posts/like-comment to handle missing _id gracefully
app.post('/posts/like-comment', async (req, res) => {
    try {
        const { postId, commentId, wallet } = req.body;
        if (!wallet || !postId || !commentId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const comment = post.comments.find(c => c._id && c._id.toString() === commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.likedBy = comment.likedBy || [];
        if (comment.likedBy.includes(wallet)) {
            return res.status(400).json({ error: 'You have already liked this comment' });
        }
        comment.likedBy.push(wallet);
        comment.likes = (comment.likes || 0) + 1;

        await db.collection('posts').updateOne(
            { _id: new ObjectId(postId), 'comments._id': new ObjectId(commentId) },
            { $set: { 'comments.$': comment } }
        );

        posts = await db.collection('posts').find().toArray();
        res.json({ success: true, likes: comment.likes });
    } catch (error) {
        console.error('[LikeComment] Error:', error);
        res.status(500).json({ error: 'Failed to like comment', details: error.message });
    }
});

// [Unchanged remaining endpoints]
app.post('/posts/delete-comment', async (req, res) => {
    try {
        const { postId, commentId } = req.body;
        console.log('[DeleteComment] Attempting to delete comment:', commentId, 'from post:', postId);

        if (!req.session || !req.session.username) {
            console.log('[DeleteComment] No session or username');
            return res.status(401).json({ error: 'Please log in' });
        }

        const user = await db.collection('users').findOne({ username: req.session.username });
        if (!user || !user.isAdmin) {
            console.log('[DeleteComment] User not admin:', req.session.username);
            return res.status(403).json({ error: 'Admin access required' });
        }

        const post = await db.collection('posts').findOne({ _id: new ObjectId(postId) });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const result = await db.collection('posts').updateOne(
            { _id: new ObjectId(postId) },
            { $pull: { comments: { _id: new ObjectId(commentId) } } }
        );

        if (result.modifiedCount === 0) {
            console.log('[DeleteComment] Comment not found:', commentId);
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Also remove any replies to this comment
        await db.collection('posts').updateOne(
            { _id: new ObjectId(postId) },
            { $pull: { comments: { parentId: new ObjectId(commentId) } } }
        );

        posts = await db.collection('posts').find().toArray();
        console.log(`[DeleteComment] Admin ${req.session.username} deleted comment ${commentId} from post ${postId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('[DeleteComment] Error:', error.message);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

app.post('/submit-ticket', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ error: 'All fields required' });
        const ticket = { name, email, message, status: 'open', timestamp: new Date().toISOString() };
        tickets.push(ticket);
        await saveData(tickets, 'tickets');
        const mailOptions = {
            from: 'lemonclub@usa.com',
            to: 'lemonclub@usa.com',
            subject: 'New Support Ticket',
            text: `New ticket from ${name} (${email}):\n\n${message}`
        };
        await transporter.send(new SendEmailCommand(mailOptions));
        res.json({ success: true, ticketId: tickets.length });
    } catch (error) {
        console.error('[SubmitTicket] Error:', error.message);
        res.status(500).json({ error: 'Failed to submit ticket' });
    }
});


app.get('/videos', (req, res) => {
    console.log('[Videos] Returning:', videos);
    res.json({ success: true, videos });
});

app.post('/blog-posts', async (req, res) => {
    try {
        if (!req.session || !req.session.username) {
            return res.status(401).json({ error: 'Please log in' });
        }
        const user = await db.collection('users').findOne({ username: req.session.username });
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const newBlog = {
            title,
            content,
            timestamp: Date.now(),
            uploadedBy: req.session.username
        };

        await db.collection('blogs').insertOne(newBlog);
        blogs = await db.collection('blogs').find().toArray();
        res.json({ success: true });
    } catch (error) {
        console.error('[PostBlog] Error:', error.message);
        res.status(500).json({ error: 'Failed to post blog' });
    }
});

app.get('/blog-posts', async (req, res) => {
    try {
        const blogPosts = await db.collection('blogs').find().toArray();
        res.json({ success: true, posts: blogPosts });
    } catch (error) {
        console.error('[GetBlogs] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch blog posts' });
    }
});

app.get('/posts', async (req, res) => {
    try {
        posts = await db.collection('posts').find().toArray() || [];
        console.log('[Posts] Fetched posts:', posts);
        res.json(posts);
    } catch (error) {
        console.error('[Posts] Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

app.get('/tickets', requireAdmin, (req, res) => {
    res.json({ success: true, tickets });
});

app.post('/logout', (req, res) => {
    loggedInUsername = null;
    res.json({ success: true });
});

app.post('/section-visit/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const lowerUsername = username.toLowerCase();
        if (!users[lowerUsername]) return res.status(404).json({ success: false, error: 'User not found' });
        updateQuestProgress(lowerUsername, 'daily', 'section-adventurer', 1);
        res.json({ success: true });
    } catch (error) {
        console.error('[SectionVisit] Error:', error.message);
        res.status(500).json({ error: 'Failed to track section visit' });
    }
});

app.post('/social-visit/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const lowerUsername = username.toLowerCase();
        if (!users[lowerUsername]) return res.status(404).json({ success: false, error: 'User not found' });
        
        const quest = users[lowerUsername].quests.daily.find(q => q.id === 'social-squeeze');
        if (!quest) {
            console.error(`[SocialVisit] Quest social-squeeze not found for ${lowerUsername}`);
            return res.status(400).json({ success: false, error: 'Quest not found' });
        }
        
        console.log(`[SocialVisit] Before - ${lowerUsername} - social-squeeze: ${quest.progress}/${quest.goal}`);
        await updateQuestProgress(lowerUsername, 'daily', 'social-squeeze', 1);
        console.log(`[SocialVisit] After - ${lowerUsername} - social-squeeze: ${quest.progress}/${quest.goal}, completed: ${quest.completed}`);
        
        res.json({ 
            success: true, 
            progress: quest.progress, 
            goal: quest.goal, 
            completed: quest.completed, 
            claimed: quest.claimed 
        });
    } catch (error) {
        console.error('[SocialVisit] Error:', error.message);
        res.status(500).json({ error: 'Failed to track social visit' });
    }
});

app.post('/checkout', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });
        if (!users[username]) return res.status(404).json({ error: 'User not found' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: { name: 'Lemon Club Premium Membership' },
                    unit_amount: 500
                },
                quantity: 1
            }],
            mode: 'subscription',
            success_url: `http://localhost:${port}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:${port}/cancel`,
            metadata: { username }
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error('[Checkout] Error:', error.message);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

app.get('/success', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
        if (session.payment_status === 'paid') {
            const username = session.metadata.username;
            users[username].isPremium = true;
            users[username].subscriptionId = session.subscription;
            await saveData(users, 'users');
            res.send('Subscription successful! <a href="/">Return to site</a>');
        } else {
            res.send('Payment not completed. <a href="/">Return to site</a>');
        }
    } catch (error) {
        console.error('[Success] Error:', error.message);
        res.status(500).send('Error verifying payment');
    }
});

app.get('/cancel', (req, res) => {
    res.send('Payment canceled. <a href="/">Return to site</a>');
});

app.post('/coinbase-checkout', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'Username required' });
        if (!users[username]) return res.status(404).json({ error: 'User not found' });

        const chargeData = {
            name: 'Lemon Club Premium Membership',
            description: 'One-time purchase for premium access',
            pricing_type: 'fixed_price',
            local_price: { amount: '5.00', currency: 'USD' },
            metadata: { username }
        };
        const charge = await Charge.create(chargeData);
        res.json({ url: charge.hosted_url });
    } catch (error) {
        console.error('[CoinbaseCheckout] Error:', error.message);
        res.status(500).json({ error: 'Failed to create Coinbase checkout' });
    }
});

app.post('/coinbase-webhook', express.json(), async (req, res) => {
    try {
        const event = req.body.event;
        if (event.type === 'charge:confirmed') {
            const username = event.data.metadata.username;
            users[username].isPremium = true;
            await saveData(users, 'users');
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('[CoinbaseWebhook] Error:', error.message);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

app.get('/store-items', (req, res) => {
    res.json([
        { id: 1, name: 'Water Droplets', price: 100, description: 'Boost your NFT growth with water droplets!' },
        { id: 2, name: 'Bonus Points Pack', price: 200, description: 'Get 200 bonus points instantly!' }
    ]);
});

app.post('/store/purchase/:username/:itemId', async (req, res) => {
    try {
        const { username, itemId } = req.params;
        if (!users[username]) return res.status(404).json({ success: false, error: 'User not found' });

        const items = [
            { id: 1, name: 'Water Droplets', price: 100, description: 'Boost your NFT growth with water droplets!' },
            { id: 2, name: 'Bonus Points Pack', price: 200, description: 'Get 200 bonus points instantly!' }
        ];
        const item = items.find(i => i.id === parseInt(itemId));
        if (!item) return res.status(400).json({ success: false, error: 'Item not found' });

        const lemonadePoints = getLemonadePoints(username);
        if (BigInt(lemonadePoints) < BigInt(item.price)) {
            return res.status(400).json({ success: false, error: 'Not enough points' });
        }

        if (item.id === 1) {
            users[username].waterDroplets = (users[username].waterDroplets || 0) + 100;
        } else if (item.id === 2) {
            awardPoints(username, 'bonus', 200, 'Bonus Points Pack Purchase');
        }
        users[username].lemonadePoints = Number(BigInt(lemonadePoints) - BigInt(item.price));
        await saveData(users, 'users');
        res.json({ success: true });
    } catch (error) {
        console.error('[Purchase] Error:', error.message);
        res.status(500).json({ error: 'Failed to process purchase' });
    }
});

app.post('/apply-water/:username/:mintAddress', async (req, res) => {
    try {
        const { username, mintAddress } = req.params;
        const user = await db.collection('users').findOne({ username });
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });

        const nft = user.nfts.find(n => n.mintAddress === mintAddress);
        if (!nft || !nft.staked) return res.status(400).json({ success: false, error: 'NFT not found or not staked' });
        if (!user.waterDroplets || user.waterDroplets < 10) return res.status(400).json({ success: false, error: 'Not enough water droplets' });

        user.waterDroplets -= 10;
        const pointsEarned = 5;
        awardPoints(username, 'staking', pointsEarned, `Watering NFT ${mintAddress.slice(0, 8)}...`);
        await db.collection('users').updateOne({ username }, { $set: user });
        res.json({ success: true, pointsEarned });
    } catch (error) {
        console.error('[ApplyWater] Error:', error.message);
        res.status(500).json({ error: 'Failed to apply water droplets' });
    }
});

app.post('/admin/update-ticket/:ticketId', requireAdmin, async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        const ticketIndex = parseInt(ticketId) - 1;
        if (ticketIndex < 0 || ticketIndex >= tickets.length) return res.status(400).json({ error: 'Invalid ticket ID' });
        tickets[ticketIndex].status = status;
        await saveData(tickets, 'tickets');
        res.json({ success: true });
    } catch (error) {
        console.error('[UpdateTicket] Error:', error.message);
        res.status(500).json({ error: 'Failed to update ticket' });
    }
});

app.post('/admin/update-user/:username', requireAdmin, async (req, res) => {
    try {
        const { username } = req.params;
        const { isPremium, isAdmin } = req.body;
        if (!users[username]) return res.status(404).json({ error: 'User not found' });
        if (typeof isPremium !== 'undefined') users[username].isPremium = isPremium;
        if (typeof isAdmin !== 'undefined') users[username].isAdmin = isAdmin;
        await saveData(users, 'users');
        res.json({ success: true });
    } catch (error) {
        console.error('[UpdateUser] Error:', error.message);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.post('/admin/update-quests', requireAdmin, async (req, res) => {
    try {
        const { daily, weekly, limited } = req.body;
        if (daily) quests.daily = daily;
        if (weekly) quests.weekly = weekly;
        if (limited) quests.limited = limited;
        Object.keys(users).forEach(username => {
            if (daily) {
                users[username].quests.daily = daily.map(q => ({
                    id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now()
                }));
            }
            if (weekly) {
                users[username].quests.weekly = weekly.map(q => ({
                    id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now()
                }));
            }
            if (limited) {
                users[username].quests.limited = limited.map(q => ({
                    id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now()
                }));
            }
        });
        await saveData(users, 'users');
        res.json({ success: true });
    } catch (error) {
        console.error('[UpdateQuests] Error:', error.message);
        res.status(500).json({ error: 'Failed to update quests' });
    }
});

app.post('/admin/reset-user/:username', requireAdmin, async (req, res) => {
    try {
        const { username } = req.params;
        if (!users[username]) return res.status(404).json({ error: 'User not found' });
        users[username].nfts = [];
        users[username].stakingPoints = 0;
        users[username].arcadePoints = 0;
        users[username].questPoints = 0;
        users[username].mintingPoints = 0;
        users[username].bonusPoints = 0;
        users[username].stakingCount = 0;
        users[username].postingCount = 0;
        users[username].arcadePlaytime = 0;
        users[username].loginStreak = 0;
        users[username].lastLogin = 0;
        users[username].lastDailyReset = 0;
        users[username].weeklyResetTimestamp = Date.now();
        users[username].quests = {
             daily: quests.daily.map(q => ({ id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
        weekly: quests.weekly.map(q => ({ id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() })),
        limited: quests.limited.map(q => ({ id: q.id, title: q.title, description: q.description, goal: q.goal, reward: q.reward, progress: 0, completed: false, claimed: false, resetTimestamp: Date.now() }))
    };
    await saveData(users, 'users');
    res.json({ success: true });
} catch (error) {
    console.error('[ResetUser] Error:', error.message);
    res.status(500).json({ error: 'Failed to reset user' });
}

});

app.post('/admin/ban-user/:username', requireAdmin, async (req, res) => {
    try {
        const { username } = req.params;
        if (!users[username]) return res.status(404).json({ error: 'User not found' });
        await db.collection('users').deleteOne({ username });
        users = await db.collection('users').findOne({}) || {};
        await saveData(users, 'users');
        res.json({ success: true });
    } catch (error) {
        console.error('[BanUser] Error:', error.message);
        res.status(500).json({ error: 'Failed to ban user' });
    }
});

app.post('/admin/update-user-permissions/:username', requireAdmin, async (req, res) => {
    try {
        const { username } = req.params;
        const { isAdmin, permissions } = req.body;
        const user = await db.collection('users').findOne({ username: { $regex: `^${username}$`, $options: 'i' } });
        if (!user) {
            console.log(`[AdminUpdatePermissions] User not found: ${username}`);
            return res.status(404).json({ error: 'User not found' });
        }

        const updates = {};
        if (typeof isAdmin !== 'undefined') updates.isAdmin = isAdmin;
        if (permissions) {
            if (!user.permissions) user.permissions = {};
            updates.permissions = {
                ...user.permissions,
                canPostBlogs: permissions.canPostBlogs ?? user.permissions.canPostBlogs ?? false,
                canPostVideos: permissions.canPostVideos ?? user.permissions.canPostVideos ?? false,
                canDeletePosts: permissions.canDeletePosts ?? user.permissions.canDeletePosts ?? false,
                canDeleteBlogs: permissions.canDeleteBlogs ?? user.permissions.canDeleteBlogs ?? false,
                canDeleteVideos: permissions.canDeleteVideos ?? user.permissions.canDeleteVideos ?? false
            };
        }

        await db.collection('users').updateOne(
            { username: { $regex: `^${username}$`, $options: 'i' } },
            { $set: updates }
        );
        users[username.toLowerCase()] = { ...user, ...updates };
        console.log(`[Admin] Updated permissions for ${username}:`, updates);
        res.json({ success: true });
    } catch (error) {
        console.error('[AdminUpdatePermissions] Error:', error);
        res.status(500).json({ error: 'Failed to update user permissions: ' + error.message });
    }
});


async function setLeviAsAdmin() {
    try {
        await db.collection('users').updateOne(
            { username: 'Levi' },
            { 
                $set: { 
                    isAdmin: true,
                    permissions: {
                        canPostBlogs: true,
                        canPostVideos: true,
                        canDeletePosts: true,
                        canDeleteBlogs: true,
                        canDeleteVideos: true
                    }
                }
            }
        );
        console.log('[AdminSetup] Levi set as admin with full permissions');
    } catch (error) {
        console.error('[AdminSetup] Error setting Levi as admin:', error.message);
    }
}

console.log('[Route Check] Registered GET routes:', app._router.stack
    .filter(r => r.route && r.route.methods.get)
    .map(r => r.route.path));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ensure initialize runs only once
if (!isInitialized) {
    initialize().catch((err) => {
        console.error('[Initialize] Failed:', err);
        process.exit(1);
    });
}