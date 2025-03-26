const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { MongoClient } = require('mongodb');

const s3Client = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'AKIAW5WU5LN7HKW7BNXV',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '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'
    }
});

async function uploadNFTImages() {
    const client = new MongoClient('mongodb+srv://lemonclub:Think400Big!@lemonclub.dinfd.mongodb.net/?retryWrites=true&w=majority&appName=LemonClub');
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('lemonclub');
        const usersCollection = db.collection('users');

        const users = await usersCollection.find().toArray();
        const outputDir = path.join(__dirname, 'output');
        if (!fs.existsSync(outputDir)) {
            console.log('Output directory does not exist. No images to upload.');
            return;
        }

        for (const user of users) {
            if (user.nfts && user.nfts.length > 0) {
                for (const nft of user.nfts) {
                    const imageUri = nft.imageUri;
                    if (imageUri && imageUri.includes('nft_')) {
                        const tokenId = imageUri.match(/nft_(\d+)\.png/)[1];
                        const localImagePath = path.join(outputDir, `nft_${tokenId}.png`);
                        const s3Key = `usernft/nft_${tokenId}.png`;

                        if (fs.existsSync(localImagePath)) {
                            const imageFile = fs.readFileSync(localImagePath);
                            await s3Client.send(new PutObjectCommand({
                                Bucket: 'lemonclub-nftgen',
                                Key: s3Key,
                                Body: imageFile,
                                ContentType: 'image/png',
                                
                            }));
                            console.log(`Uploaded image for NFT ${tokenId} to S3: ${s3Key}`);
                        } else {
                            console.warn(`Local image not found for NFT ${tokenId}: ${localImagePath}`);
                        }
                    }
                }
            }
        }
        console.log('NFT images uploaded successfully');
    } catch (error) {
        console.error('Error uploading NFT images:', error);
    } finally {
        await client.close();
    }
}

uploadNFTImages();