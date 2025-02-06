// src/app/api/registration/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// MongoDB connection URI and database details
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "event_database";
const participantsCollection = "participants";
const eventsCollection = "events";

// Create a single MongoClient instance
const client = new MongoClient(mongoUri);
let isConnected = false; // Track the connection status

async function connectToDatabase() {
  if (!isConnected) {
    await client.connect();
    isConnected = true; // Update the connection status
  }
  return client.db(dbName);
}

export async function POST(req: NextRequest) {
  try {
    const { _id } = await req.json();

    // Validate input
    if (!_id) {
      return NextResponse.json(
        { message: "_id is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(_id)) {
      return NextResponse.json(
        { message: "Invalid _id format" },
        { status: 400 }
      );
    }

    // Convert _id to ObjectId
    const objectId = new ObjectId(_id);

    // Connect to the database
    const db = await connectToDatabase();

    // Find the participant by _id
    const participant = await db.collection(participantsCollection).findOne({
      _id: objectId,
    });

    if (!participant) {
      return NextResponse.json(
        { 
          message: "Participant not found. Please check the QR again.", 
          exists: false 
        },
        { status: 404 }
      );
    }

    const eventId = participant.eventId;

    // Verify if the event exists and is active
    const event = await db.collection(eventsCollection).findOne({
      _id: new ObjectId(eventId),
      status: "active",
    });

    if (!event) {
      return NextResponse.json(
        { 
          message: "Event not found or inactive.", 
          exists: false 
        },
        { status: 404 }
      );
    }

    // Check if the attendance is already marked as "present"
    if (participant.attendance === "present") {
      return NextResponse.json({
        exists: true,
        message: "Attendance already marked as present for this participant.",
      });
    }

    // Update attendance to "present"
    await db.collection(participantsCollection).updateOne(
      { _id: objectId },
      { $set: { attendance: "present" } }
    );

    return NextResponse.json({
      exists: true,
      message: "Attendance marked as present for the participant.",
    });
  } catch (error) {
    console.error("Database query failed:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
