const { MongoClient } = require('mongodb');

async function fixVideoUrls() {
    const client = new MongoClient('mongodb+srv://lemonclub:Think400Big!@lemonclub.dinfd.mongodb.net/?retryWrites=true&w=majority&appName=LemonClub');
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db('lemonclub');
        const videosCollection = db.collection('videos');

        const videos = await videosCollection.find().toArray();
        for (const video of videos) {
            if (video.url && video.url.startsWith('http://localhost:3001/videos/')) {
                const filename = video.url.split('/videos/')[1];
                const newUrl = `https://d18hbxl467xhey.cloudfront.net/videos/${filename}`;
                await videosCollection.updateOne(
                    { _id: video._id },
                    { $set: { url: newUrl } }
                );
                console.log(`Updated video URL for ${video._id}: ${newUrl}`);
            }
        }
        console.log('Video URLs updated successfully');
    } catch (error) {
        console.error('Error updating video URLs:', error);
    } finally {
        await client.close();
    }
}

fixVideoUrls();