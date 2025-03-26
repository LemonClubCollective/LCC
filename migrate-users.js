const fs = require('fs').promises;
const { MongoClient } = require('mongodb');

async function migrateUsers() {
    const data = await fs.readFile('C:\\Users\\public.DESKTOP-1IFDKN4\\my-nft-project\\data\\users.json', 'utf8');
    const users = JSON.parse(data);
    const client = new MongoClient('mongodb+srv://lemonclub:Think400Big!@lemonclub.dinfd.mongodb.net/?retryWrites=true&w=majority&appName=LemonClub');
    try {
        await client.connect();
        const db = client.db('lemonclub');
        const userDocs = Object.keys(users).map(username => ({ username, ...users[username] }));
        await db.collection('users').deleteMany({});
        await db.collection('users').insertMany(userDocs);
        console.log('Users migrated to MongoDB successfully');
    } catch (error) {
        console.error('Migration error:', error.message);
    } finally {
        await client.close();
    }
}

migrateUsers();