
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("Missing MONGODB_URI in env");

let cachedClient: MongoClient | null = null;

export async function getMongoClient() {
  if (cachedClient && cachedClient.topology && (cachedClient as any).isConnected !== false) {
    return cachedClient;
  }
  const client = new MongoClient(uri, { });
  await client.connect();
  cachedClient = client;
  return client;
}

export async function getCollection(name = "documents") {
  const client = await getMongoClient();
  return client.db("farmer_ai").collection(name);
}
