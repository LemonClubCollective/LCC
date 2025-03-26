const { MongoClient, ObjectId } = require('mongodb');

async function migrateComments() {
    const client = new MongoClient('mongodb+srv://lemonclub:Think400Big!@lemonclub.dinfd.mongodb.net/?retryWrites=true&w=majority&appName=LemonClub');
    try {
        await client.connect();
        console.log('[Migration] Connected to MongoDB');
        const db = client.db('lemonclub');
        const postsCollection = db.collection('posts');

        const posts = await postsCollection.find().toArray();
        for (const post of posts) {
            const updatedComments = (post.comments || []).map(comment => {
                if (!comment._id) {
                    comment._id = new ObjectId();
                }
                if (!('parentId' in comment)) {
                    comment.parentId = null;
                }
                if (!comment.likedBy) {
                    comment.likedBy = [];
                }
                return comment;
            });

            await postsCollection.updateOne(
                { _id: post._id },
                { $set: { comments: updatedComments } }
            );
            console.log(`[Migration] Updated comments for post ${post._id}`);
        }
        console.log('[Migration] Migration completed successfully');
    } catch (error) {
        console.error('[Migration] Error:', error);
    } finally {
        await client.close();
    }
}

migrateComments();