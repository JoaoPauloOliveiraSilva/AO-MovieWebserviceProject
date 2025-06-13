import dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';

const uri = process.env.URL;
const dbName = process.env.DB;

let db = null;
let client = null;

async function connectToDB() {
  if (db) return db;
  if (!uri || !dbName) {
    throw new Error('Missing MongoDB URI or database name in environment variables.');
  }
  try {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    throw err;
  }
}

async function closeConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed!');
    client = null;
    db = null;
  }
}

export { connectToDB, closeConnection };
