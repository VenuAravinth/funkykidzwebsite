import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { MongoClient, type Db, type Binary, type ObjectId } from "mongodb";
import type { Product } from "@/lib/products";
import type { Review } from "@/lib/reviews";
import type { AddressLabel } from "@/lib/addresses";
import type { StoredOrder } from "./orderStore";
import type { AdminRecord } from "./adminStore";

// One MongoClient per server process. In development Next.js reloads modules on every edit,
// so the client is parked on globalThis to avoid opening a new connection pool each time.

// Customers sign in with mobile number + SMS OTP; the phone number is their identity.
// `email`/`passwordHash` only exist on accounts created before OTP login.
export type UserDoc = {
  _id: ObjectId;
  name: string;
  phone: string; // 10 digits
  email?: string;
  passwordHash?: string;
  avatarVersion?: number; // set when a profile photo is stored in `avatars`; bumps on every change
  createdAt: Date;
  lastLoginAt?: Date;
};

// One pending login code per mobile number. Only a salted hash of the code is stored.
export type LoginOtpDoc = {
  _id: string; // phone
  codeHash: string | null; // null once used
  salt: string;
  codeExpiresAt: Date;
  expiresAt: Date; // TTL: the record (and its send counter) lives until the rate window ends
  attempts: number;
  sends: number; // codes sent in the current window
  windowStart: Date;
  lastSentAt: Date;
};

// Redeem codes, created in Admin → Redeem Codes. `usedCount` is reserved atomically when an order
// is placed and given back if that order is cancelled.
export type CouponDoc = {
  _id: ObjectId;
  code: string; // upper case, e.g. "WELCOME100"
  type: "percent" | "flat";
  value: number; // percent (1–90) or rupees
  maxDiscount?: number; // cap for percent codes, in rupees
  minOrder: number; // minimum item subtotal in rupees (0 = none)
  startsAt?: Date;
  expiresAt?: Date;
  usageLimit?: number; // total uses across all customers
  perCustomerLimit: number;
  usedCount: number;
  active: boolean;
  note?: string; // internal, never shown to customers
  createdAt: Date;
};

export type CouponRedemptionDoc = { _id: ObjectId; couponId: ObjectId; code: string; userId: ObjectId; orderNumber: string; discount: number; at: Date };

export type AvatarDoc = { _id: ObjectId; contentType: string; data: Binary; updatedAt: Date }; // _id = user id

export type SessionDoc = { _id: ObjectId; tokenHash: string; userId: ObjectId; createdAt: Date; expiresAt: Date; ua: string };

export type CartItemDoc = { lineId: string; slug: string; colorwayName: string; size: string; quantity: number };
export type CartDoc = { _id: ObjectId; userId: ObjectId; items: CartItemDoc[]; updatedAt: Date };

export type WishlistDoc = { _id: ObjectId; userId: ObjectId; slugs: string[]; updatedAt: Date };

export type AddressDoc = {
  _id: ObjectId;
  userId: ObjectId;
  label: AddressLabel;
  customLabel?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  createdAt: Date;
};

export type ProductDoc = Product & { _id?: ObjectId; active: boolean; updatedAt: Date };
export type ReviewDoc = Omit<Review, "id"> & {
  _id?: ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  userId?: ObjectId; // customer reviews only
  orderNumber?: string; // the purchase that made them eligible
};
export type OrderDoc = StoredOrder & { _id?: ObjectId; userId: ObjectId | null };
export type ProofDoc = { _id?: ObjectId; orderNumber: string; contentType: string; data: Binary; createdAt: Date };
export type ContactMessageDoc = {
  _id?: ObjectId;
  userId: ObjectId | null;
  name: string;
  phone: string;
  orderNumber: string;
  message: string;
  channel: "whatsapp" | "email";
  createdAt: Date;
};
export type AdminDoc = AdminRecord & { _id: "admin" };

type Globals = { client?: MongoClient; ready?: Promise<Db> };
const g = globalThis as unknown as { __fkMongo?: Globals };
const state: Globals = (g.__fkMongo ??= {});

function uri(): string {
  const value = process.env.MONGODB_URI?.trim();
  if (!value) throw new Error("MONGODB_URI is not set. Add it to .env.local (e.g. mongodb://127.0.0.1:27017/funkykidz).");
  return value;
}

/** Connected database, with indexes and first-run data in place. */
export function getDb(): Promise<Db> {
  if (!state.ready) {
    state.client = new MongoClient(uri(), { maxPoolSize: 20, serverSelectionTimeoutMS: 5000, appName: "funkykidz-web" });
    state.ready = state.client
      .connect()
      .then(async (client) => {
        const db = client.db(); // database name comes from the connection string
        await prepare(db);
        return db;
      })
      .catch((err) => {
        // Allow the next request to retry instead of caching the failure forever.
        state.ready = undefined;
        throw err;
      });
  }
  return state.ready;
}

export async function collections() {
  const db = await getDb();
  return {
    users: db.collection<UserDoc>("users"),
    loginOtps: db.collection<LoginOtpDoc>("login_otps"),
    avatars: db.collection<AvatarDoc>("avatars"),
    coupons: db.collection<CouponDoc>("coupons"),
    couponRedemptions: db.collection<CouponRedemptionDoc>("coupon_redemptions"),
    sessions: db.collection<SessionDoc>("sessions"),
    carts: db.collection<CartDoc>("carts"),
    wishlists: db.collection<WishlistDoc>("wishlists"),
    addresses: db.collection<AddressDoc>("addresses"),
    products: db.collection<ProductDoc>("products"),
    reviews: db.collection<ReviewDoc>("reviews"),
    orders: db.collection<OrderDoc>("orders"),
    proofs: db.collection<ProofDoc>("payment_proofs"),
    messages: db.collection<ContactMessageDoc>("contact_messages"),
    admin: db.collection<AdminDoc>("admin"),
  };
}

export type Collections = Awaited<ReturnType<typeof collections>>;

async function prepare(db: Db) {
  await migrateUserEmailIndex(db);
  await Promise.all([
    db.collection("users").createIndexes([
      // Phone-only customers have no email, so uniqueness applies only where one is set.
      { key: { email: 1 }, name: "email_1", unique: true, partialFilterExpression: { email: { $type: "string" } } },
      { key: { phone: 1 }, unique: true },
    ]),
    db.collection("login_otps").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("coupons").createIndex({ code: 1 }, { unique: true }),
    db.collection("coupon_redemptions").createIndexes([{ key: { couponId: 1, userId: 1 } }, { key: { orderNumber: 1 }, unique: true }]),
    db.collection("sessions").createIndexes([
      { key: { tokenHash: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // MongoDB deletes expired sessions
    ]),
    db.collection("carts").createIndex({ userId: 1 }, { unique: true }),
    db.collection("wishlists").createIndex({ userId: 1 }, { unique: true }),
    db.collection("addresses").createIndex({ userId: 1, createdAt: 1 }),
    db.collection("reviews").createIndexes([
      { key: { status: 1, productSlug: 1, date: -1 } },
      // One review per customer per product.
      { key: { userId: 1, productSlug: 1 }, unique: true, partialFilterExpression: { userId: { $type: "objectId" } } },
    ]),
    db.collection("orders").createIndexes([
      { key: { orderNumber: 1 }, unique: true },
      { key: { userId: 1, placedAt: -1 } },
      { key: { placedAt: -1 } },
    ]),
    db.collection("payment_proofs").createIndex({ orderNumber: 1 }, { unique: true }),
    db.collection("contact_messages").createIndex({ createdAt: -1 }),
  ]);

  // First run: bring over the admin login created before the database existed
  // (data/admin.json), so the existing password and authenticator keep working.
  const admin = db.collection<AdminDoc>("admin");
  if (!(await admin.findOne({ _id: "admin" }))) {
    const legacy = await readLegacyAdmin();
    if (legacy) await admin.insertOne({ ...legacy, _id: "admin" });
  }
}

// Older databases have a plain unique email index, which would let only one phone-only
// customer exist. Replace it with the partial version above.
async function migrateUserEmailIndex(db: Db) {
  const users = db.collection("users");
  const indexes = await users.indexes().catch(() => []);
  const old = indexes.find((i) => i.name === "email_1");
  if (old && !old.partialFilterExpression) await users.dropIndex("email_1");
}

async function readLegacyAdmin(): Promise<AdminRecord | null> {
  const dir = process.env.DATA_DIR?.trim() || path.join(process.cwd(), "data");
  try {
    return JSON.parse(await fs.readFile(path.join(/*turbopackIgnore: true*/ dir, "admin.json"), "utf8")) as AdminRecord;
  } catch {
    return null;
  }
}

/** Strips Mongo's _id and returns plain JSON-safe data for server → client props. */
export function plain<T extends { _id?: unknown }>(doc: T): Omit<T, "_id"> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, ...rest } = doc;
  return rest;
}
