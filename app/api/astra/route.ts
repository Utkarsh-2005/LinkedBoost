import { NextResponse } from "next/server";
import { db } from "@/lib/astraClient";

export async function GET() {
  try {
    console.log("📡 Connecting to AstraDB...");

    // Retrieve the collection name and collection instance
    const collectionName = process.env.ASTRA_DB_COLLECTION!;
    const collection = db.collection(collectionName);

    // Log the collection object for debugging purposes
    console.log("📚 Collection Object:", collection);

    // Verify connection by listing collections
    const collections = await db.listCollections();
    console.log("✅ Connected to AstraDB:", collections.map(c => c.name || c));

    // Ensure the target collection exists
    if (!collection) {
      return NextResponse.json(
        { error: `Collection '${collectionName}' not found.` },
        { status: 500 }
      );
    }
    console.log(`📂 Using collection: ${collectionName}`);

    // Execute the vector search query
    const cursor = collection.find(
      {},
      {
        sort: { $vectorize: "others" },
        limit: 5,
        includeSimilarity: true,
        projection: { $vectorize: 1 } // explicitly include the $vectorize field
      }
    );

    // Convert the cursor to an array of results.
    const searchResults: { text: string; similarity: number }[] = [];
    for await (const doc of cursor) {
      searchResults.push({
        text: doc.$vectorize || "No text available",
        similarity: doc.$similarity || 0,
      });
    }

    console.log("🔹 Vector Search Results:", searchResults);

    if (searchResults.length === 0) {
      return NextResponse.json(
        { message: "No matching documents found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ searchResults }, { status: 200 });
  } catch (error) {
    console.error("❌ Vector search error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
