import dns from "dns";
import { MongoClient, type Db } from "mongodb";

function usableDns() {
  const servers = dns.getServers();
  const loopback = servers.length > 0 && servers.every((server) => server === "127.0.0.1" || server === "::1");
  if (loopback) dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

/**
 * One shared client for this Next.js process.
 * The shop is a single server with light checkout and dashboard traffic, so the
 * pool stays small (10) and idle (min 0). A 5s server selection fails fast when
 * Atlas is unreachable instead of hanging Pay now.
 */
const globalMongo = globalThis as typeof globalThis & {
  __piuraMongo?: { client: MongoClient; indexes?: Promise<void> };
};

let dnsReady = false;

async function ensureIndexes(database: Db) {
  await Promise.all([
    database.collection("orders").createIndex({ paymentIntentId: 1 }, { unique: true }),
    database.collection("affiliates").createIndex({ code: 1 }, { unique: true }),
    database.collection("affiliates").createIndex({ token: 1 }, { unique: true }),
    database.collection("commissions").createIndex({ paymentIntentId: 1 }, { unique: true }),
    database.collection("commissions").createIndex({ code: 1 }),
    database.collection("products").createIndex({ slug: 1 }, { unique: true }),
  ]);
}

export async function db() {
  usableDns();
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MongoDB is not configured.");
  if (!dnsReady && globalMongo.__piuraMongo) {
    await globalMongo.__piuraMongo.client.close().catch(() => undefined);
    globalMongo.__piuraMongo = undefined;
  }
  dnsReady = true;

  if (!globalMongo.__piuraMongo) {
    globalMongo.__piuraMongo = {
      client: new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 5000,
      }),
    };
  }

  const cached = globalMongo.__piuraMongo;
  await cached.client.connect();
  const database = cached.client.db(process.env.MONGODB_DB || "piura");
  if (!cached.indexes) {
    cached.indexes = ensureIndexes(database).catch((error: unknown) => {
      cached.indexes = undefined;
      throw error;
    });
  }
  await cached.indexes;
  return database;
}
