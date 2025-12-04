import { MongoClient, Db } from "mongodb";

const uri = "mongodb://localhost:27017";
const dbName = "banco";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  db = client.db(dbName);
  return db;
}

export async function getNextId(collectionName: string, idField: string): Promise<number> {
  const database = await getDb();
  const coll = database.collection(collectionName);
  const doc = await coll.find().sort({ [idField]: -1 }).limit(1).toArray();
  if (doc.length === 0 || typeof doc[0][idField] !== "number") {
    return 1;
  }
  return (doc[0][idField] as number) + 1;
}
