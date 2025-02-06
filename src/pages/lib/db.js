import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("Missing MONGO_URI in environment variables");
}

// Disable client-side encryption
const client = new MongoClient(mongoUri, {
  autoEncryption: undefined, // Ensure autoEncryption is disabled
});

const clientPromise = client.connect();

export default clientPromise;
