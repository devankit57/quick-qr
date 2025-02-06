import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error("Missing MONGO_URI in environment variables");
}

const client = new MongoClient(mongoUri);

const clientPromise = client.connect(); // Use 'const' instead of 'let'

export default clientPromise;
