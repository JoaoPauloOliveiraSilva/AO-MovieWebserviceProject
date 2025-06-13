import express from 'express';
import cors from 'cors';
import { connectToDB, closeConnection } from './mongo_iterate.js';
import {ObjectId} from "mongodb";

const app = express();
const PORT = process.env.PORT || 3006;

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Endpoint


app.get('/movies', async (req, res) => {
    try {
        const db = await connectToDB();
        const movies = await db.collection('movies').find().limit(200).toArray();
        res.json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/Comments', async (req, res) => {
    try {
        const db = await connectToDB();
        const Comments = await db.collection('comments').find().toArray();
        res.json(Comments);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/Comments/:id', async (req, res) => {
    try {
        const db = await connectToDB();
        const movieid = new ObjectId(req.params.id);
        const Comments = await db.collection('comments').find({ movie_id: movieid })
            .toArray();
        res.json(Comments);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.post('/Comments/add', async (req, res) => {
    try {
        const db = await connectToDB();

        const { name, email, movie_id, text } = req.body;

        if (!name || !email || !movie_id || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newComment = {
            name,
            email,
            movie_id: new ObjectId(movie_id),
            text,
            date: new Date()
        };

        const result = await db.collection('comments').insertOne(newComment);

        res.status(201).json({
            message: 'Comment added successfully',
            commentId: result.insertedId
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

app.put('/Comments/update/:id', async (req, res) => {
    try {
        const db = await connectToDB();
        const {text} = req.body;
        const id = new ObjectId(req.params.id);
        if (!id || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await db.collection('comments').updateOne(
            { _id: new ObjectId(id) },
            { $set: {  text, date: new Date() } }
        );
        res.status(201).json({
            message: 'Comment updated successfully',
            commentId: result.insertedId
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});


app.delete('/Comments/delete/:id', async (req, res) => {
    try {
        const db = await connectToDB();
        const commentid = new ObjectId(req.params.id);
        const Comments = await db.collection('comments').deleteOne({ _id: commentid })
        res.json(Comments);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, async () => {
    try {
        await connectToDB();

        console.log(`Server running at http://localhost:${PORT}`);
    } catch (err) {
        console.error('Failed to connect to MongoDB on startup', err);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await closeConnection();
    process.exit(0);
});
