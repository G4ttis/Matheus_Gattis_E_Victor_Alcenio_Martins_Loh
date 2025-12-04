"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.getNextId = getNextId;
const mongodb_1 = require("mongodb");
const uri = "mongodb://localhost:27017";
const dbName = "banco";
let client = null;
let db = null;
async function getDb() {
    if (db)
        return db;
    if (!client) {
        client = new mongodb_1.MongoClient(uri);
        await client.connect();
    }
    db = client.db(dbName);
    return db;
}
async function getNextId(collectionName, idField) {
    const database = await getDb();
    const coll = database.collection(collectionName);
    const doc = await coll.find().sort({ [idField]: -1 }).limit(1).toArray();
    if (doc.length === 0 || typeof doc[0][idField] !== "number") {
        return 1;
    }
    return doc[0][idField] + 1;
}
