import { currentUser, toPublicUser } from "@/server/customerAuth";
import { json } from "@/server/adminAuth";

// The signed-in customer (or null). Called once when the site loads.
export async function GET() {
  const user = await currentUser();
  return json({ user: user ? toPublicUser(user) : null });
}
