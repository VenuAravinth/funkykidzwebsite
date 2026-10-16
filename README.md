# FunkyKidz storefront

Next.js 16 app (storefront, admin panel and all backend APIs) backed by MongoDB.

## Setup

1. Start MongoDB locally (default `mongodb://127.0.0.1:27017`, no auth needed).
2. Copy `.env.example` to `.env.local` and fill in the values. The database is set by:

   ```
   MONGODB_URI=mongodb://127.0.0.1:27017/funkykidz
   ```

3. `npm install`, then `npm run dev` (or `npm run build && npm start`).

On the first request the app creates its collections and indexes, inserts the starting
catalogue from `src/server/seed/catalog.ts`, and imports `data/admin.json` (the admin login
from before the database existed) if present. Nothing else needs to be run.

The `funkykidz` database is separate from `kids_fashion_store`, which belongs to the older
Express backend in `~/Desktop/funky-kidz-updated` and is never touched by this app.

## Data (MongoDB collections)

| Collection | Contents |
| --- | --- |
| `products` | Catalogue. Edit prices, `oldPrice`, `stock` (units per size), photos (`colorways[].images`) or set `active: false` to hide. Changes show within a minute. |
| `users` | Customer accounts. Passwords are scrypt hashes. Email and phone are unique. |
| `sessions` | Login sessions (token hashes). Expire automatically after 30 days. |
| `carts`, `wishlists`, `addresses` | One per customer, saved on the server so they follow the customer across devices. |
| `orders` | Orders with price snapshot, delivery address snapshot and status history. |
| `payment_proofs` | UPI payment screenshots, private (admin only). |
| `reviews` | Shown on the site only when `status: "approved"`. |
| `contact_messages` | Copies of contact-form messages. |
| `admin` | The single admin account (credentials, authenticator, sessions, audit log). |

Stock: a size with a number in `stock` is reduced when an order is placed and put back if
the admin cancels the order; a size with no number is treated as always available.

## API

All customer routes use the `fk_session` HTTP-only cookie and reject cross-site requests.

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account and sign in |
| POST | `/api/auth/login` | Sign in with phone or email + password |
| POST | `/api/auth/logout` | Sign out (session deleted) |
| GET | `/api/auth/me` | Current customer or `null` |
| PATCH | `/api/account` | Update name / email / phone, optionally password |
| GET, POST, PATCH, DELETE | `/api/cart` | Read, add, change quantity, remove (`?lineId=`) |
| GET, POST | `/api/wishlist` | Read, toggle a product |
| GET, POST | `/api/addresses` | List, add |
| PATCH, DELETE | `/api/addresses/:id` | Edit, delete |
| POST | `/api/addresses/:id/default` | Make default |
| GET, POST | `/api/orders` | My orders, place an order (prices, stock and address checked on the server) |
| POST | `/api/orders/track` | Public tracking with order number + mobile |
| GET | `/api/products`, `/api/products/:slug` | Catalogue, one product with reviews |
| GET | `/api/reviews?product=` | Approved reviews |
| POST | `/api/contact` | Save a contact-form message |
| … | `/api/admin/*` | Admin login (password, email code, authenticator), orders, analytics |

## Visual search (search by photo)

Customers can upload, paste or take a photo (e.g. a screenshot of an Instagram post) and see
matching products. It runs entirely on this server — photos are never stored or sent anywhere.

- **Model:** CLIP (`Xenova/clip-vit-base-patch32`, ~160 MB) via `@huggingface/transformers`,
  downloaded once into `DATA_DIR/models` (git-ignored). Run `npm run visual-search:setup` after
  deploying so the first customer search doesn't wait for the download.
- **How matching works:** the photo is compared with each product's description (type, colour,
  girls/boys) and, once products have photos (`colorways[].images` in MongoDB), with those photos.
  A precise alignment check then confirms **exact matches** — real screenshots of a product photo
  (crops, borders, story stickers) score 0.7–0.99, different products stay below ~0.56.
- **Add product photos** to get exact matches for your own Instagram posts: put images in
  `/public/products/…` and list them under the colourway's `images`. Embeddings are computed and
  cached in the `product_embeddings` collection automatically.
- `@huggingface/transformers` is pinned to **3.7.6**: newer versions dropped Intel-Mac support.
- API: `POST /api/visual-search` with `{ image: "data:image/jpeg;base64,…" }` (≤ 2 MB).

## Voice search

The microphone in the search bar uses the browser's built-in speech recognition (Chrome, Edge,
Safari, Android). It's hidden where unsupported (Firefox). Recognition is set to Indian English.
