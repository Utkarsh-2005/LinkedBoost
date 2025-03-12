import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);

// Replace with your actual AstraDB endpoint URL.
const db = client.db('https://9a185f16-b112-4214-a60f-c51d3a8eed95-us-east-2.apps.astra.datastax.com');

// Immediately test the connection
(async () => {
  try {
    const collections = await db.listCollections();
    console.log("✅ Connected to AstraDB:", collections);
  } catch (error) {
    console.error("❌ Error connecting to AstraDB:", error);
  }
})();

export { db };
