import type { NextRequest } from "next/server";
import { collections } from "@/server/db";
import { currentUser, guardMutation } from "@/server/customerAuth";
import { clientIp, json } from "@/server/adminAuth";
import { rateLimit } from "@/server/rateLimit";
import { readBody, str } from "@/server/http";

// Keeps a copy of every contact-form message, even though the customer also sends it on
// WhatsApp or email — so nothing is lost if they close the app before hitting send.
export async function POST(req: NextRequest) {
  const blocked = guardMutation(req);
  if (blocked) return blocked;
  const limit = rateLimit(`contact:${clientIp(req.headers)}`, 10, 60 * 60_000);
  if (!limit.ok) return json({ error: "Too many messages. Please try again later." }, 429);

  const body = await readBody(req);
  const name = str(body.name, 100);
  const message = str(body.message, 2000);
  if (!name || !message) return json({ error: "Please add your name and a message." }, 400);

  const user = await currentUser();
  const { messages } = await collections();
  await messages.insertOne({
    userId: user?._id ?? null,
    name,
    phone: str(body.phone, 20),
    orderNumber: str(body.orderNumber, 20),
    message,
    channel: body.channel === "email" ? "email" : "whatsapp",
    createdAt: new Date(),
  });
  return json({ ok: true }, 201);
}
