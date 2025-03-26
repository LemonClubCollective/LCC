const { MongoClient } = require('mongodb');

async function fixNFTUrls() {
    const client = new MongoClient('mongodb+srv://lemonclub:Think400Big!@lemonclub.dinfd.mongodb.net/?retryWrites=true&w=majority&appName=LemonClub');
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('lemonclub');
        const usersCollection = db.collection('users');

        const users = await usersCollection.find().toArray();
        for (const user of users) {
            if (user.nfts && user.nfts.length > 0) {
                const updatedNFTs = user.nfts.map(nft => {
                    if (nft.imageUri && nft.imageUri.startsWith('http://localhost:3001/output/')) {
                        const tokenId = nft.imageUri.split('nft_')[1].split('.png')[0];
                        return {
                            ...nft,
                            imageUri: `https://drahmlrfgetmm.cloudfront.net/usernft/nft_${tokenId}.png`
                        };
                    }
                    return nft;
                });
                await usersCollection.updateOne(
                    { username: user.username },
                    { $set: { nfts: updatedNFTs } }
                );
                console.log(`Updated NFTs for user ${user.username}`);
            }
        }
        console.log('NFT URLs updated successfully');
    } catch (error) {
        console.error('Error updating NFT URLs:', error);
    } finally {
        await client.close();
    }
}

fixNFTUrls();