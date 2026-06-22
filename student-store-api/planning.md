# Student Store - System Spec

System spec for the Student Store backend. I'm writing this before any Prisma or Express code so the rest of the build is mostly translation.

Error response shape used everywhere: `{ "error": "human readable message" }`.

---

## Section 1: Data Models

Naming note: Prisma fields are camelCase because [seed.js](seed.js) already writes camelCase keys. JSON responses are camelCase end-to-end.

### Product

| Field         | Type     | Required | Default              | Notes                                    |
|---------------|----------|----------|----------------------|------------------------------------------|
| `id`          | Int      | yes      | autoincrement        | Primary key                              |
| `name`        | String   | yes      | none                 |                                          |
| `description` | String   | yes      | none                 |                                          |
| `price`       | Float    | yes      | none                 | USD                                      |
| `imageUrl`    | String   | yes      | none                 |                                          |
| `category`    | String   | yes      | none                 | Used by GET /products?category=...       |
| `orderItems`  | OrderItem[] | n/a   | n/a                  | Reverse relation                         |

### Order

| Field           | Type      | Required | Default       | Notes                                              |
|-----------------|-----------|----------|---------------|----------------------------------------------------|
| `id`            | Int       | yes      | autoincrement | Primary key (the spec's `order_id`)                |
| `customer`      | Int       | yes      | none          | Customer identifier (the spec's `customer_id`)     |
| `customerEmail` | String?   | no       | null          | Added now so the stretch email filter is unblocked |
| `totalPrice`    | Float     | yes      | none          | Server computed, never trust the client            |
| `status`        | String    | yes      | `"pending"`   |                                                    |
| `createdAt`     | DateTime  | yes      | `now()`       |                                                    |
| `orderItems`    | OrderItem[] | n/a    | n/a           | Reverse relation                                   |

### OrderItem

| Field       | Type   | Required | Default       | Notes                                  |
|-------------|--------|----------|---------------|----------------------------------------|
| `id`        | Int    | yes      | autoincrement | Primary key (spec's `order_item_id`)   |
| `orderId`   | Int    | yes      | none          | FK to Order.id, onDelete: Cascade      |
| `productId` | Int    | yes      | none          | FK to Product.id, onDelete: Cascade    |
| `quantity`  | Int    | yes      | none          |                                        |
| `price`     | Float  | yes      | none          | Price at time of purchase              |

### Cascade rules (plain English)

- Deleting a Product removes every OrderItem that references it. Historical orders that contained that product lose those line items. Fine for this assignment.
- Deleting an Order removes every OrderItem that belongs to it.
- Both rules are implemented with Prisma's `onDelete: Cascade` on the OrderItem side.

---

## Section 2: API Contract

Base URL: `http://localhost:3001`. All responses are JSON. Error shape: `{ "error": "..." }`.

### Products

| Method | Path             | Request                                                                 | Success                       | Errors                              |
|--------|------------------|-------------------------------------------------------------------------|-------------------------------|-------------------------------------|
| GET    | `/products`      | Query: `category?`, `sort?` (`price`\|`name`)                           | 200, `Product[]`              | none                                |
| GET    | `/products/:id`  | Param: `id`                                                             | 200, `Product`                | 404 if not found                    |
| POST   | `/products`      | Body: `{ name, description, price, imageUrl, category }`                | 201, `Product`                | 400 if required field missing       |
| PUT    | `/products/:id`  | Body: any subset of product fields                                      | 200, `Product`                | 404 if not found                    |
| DELETE | `/products/:id`  | Param: `id`                                                             | 204 (no body)                 | 404 if not found                    |

#### GET /products query params (Milestone 2)

- `category`: exact match, case sensitive (e.g. `?category=Snacks`).
- `sort`: allowlisted to `price` or `name`, ascending. Anything else falls back to `id asc`.
- No params: all products in `id asc` order.

### Orders

| Method | Path           | Request                                                                                       | Success                                | Errors                                                  |
|--------|----------------|-----------------------------------------------------------------------------------------------|----------------------------------------|---------------------------------------------------------|
| GET    | `/orders`      | Query: `customerEmail?` (stretch)                                                             | 200, `Order[]`                         | none                                                    |
| GET    | `/orders/:id`  | Param: `id`                                                                                   | 200, `Order` with `orderItems`         | 404 if not found                                        |
| POST   | `/orders`      | Body: `{ customer, customerEmail?, status?, items: [{ productId, quantity }] }`               | 201, `Order` with `orderItems`         | 400 empty/invalid items, 404 if any productId not found |
| PUT    | `/orders/:id`  | Body: `{ status? }` or `{ customerEmail? }`                                                   | 200, `Order`                           | 400 bad field, 404 if not found                         |
| DELETE | `/orders/:id`  | Param: `id`                                                                                   | 204                                    | 404 if not found                                        |

### Order items (stretch)

| Method | Path                       | Request                                | Success                              | Errors                                 |
|--------|----------------------------|----------------------------------------|--------------------------------------|----------------------------------------|
| GET    | `/order-items`             | none                                   | 200, `OrderItem[]` (with product)    | none                                   |
| POST   | `/orders/:order_id/items`  | Body: `{ productId, quantity }`        | 201, updated `Order` with items      | 404 unknown order/product, 400 bad body |

---

## Section 3: Transactional Flow, POST /orders

Body shape:

```json
{
  "customer": 101,
  "customerEmail": "alice@example.com",
  "status": "pending",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 4, "quantity": 1 }
  ]
}
```

Note: the client only sends `productId` and `quantity`. The server looks up each product's price and computes `totalPrice` itself, so a tampered client can't underpay.

### Steps

1. Validate body (before the transaction):
   - `customer` is an integer
   - `items` is a non-empty array
   - every item has `productId` (int) and `quantity` (positive int)
   - On any failure, 400 with `{ "error": "..." }`. Nothing has touched the DB yet.

2. Open transaction: `prisma.$transaction(async (tx) => { ... })`.

3. Fetch products referenced by the cart:
   - `tx.product.findMany({ where: { id: { in: productIds } } })`
   - If the result count doesn't match, throw a `ProductNotFound` error (caught outside the tx, maps to 404). The transaction rolls back, no Order row is created.

4. Build a price map `Map<productId, price>`.

5. Compute totalPrice server side: sum of `priceMap.get(item.productId) * item.quantity` across items.

6. Create the Order with nested order items in one call:

   ```js
   tx.order.create({
     data: {
       customer, customerEmail, status: status ?? "pending",
       totalPrice,
       orderItems: {
         create: items.map(i => ({
           productId: i.productId,
           quantity: i.quantity,
           price: priceMap.get(i.productId),
         })),
       },
     },
     include: { orderItems: { include: { product: true } } },
   });
   ```

7. Return the created order with its items, 201.

### Error cases

| Case                          | Status | Body                                            |
|-------------------------------|--------|-------------------------------------------------|
| `items` empty or missing      | 400    | `{ "error": "items must be a non-empty array" }`|
| `productId` not in DB         | 404    | `{ "error": "product <id> not found" }`         |
| Any DB error mid-transaction  | 500    | `{ "error": "internal server error" }`          |

Because everything sits inside `$transaction`, a failure at any step rolls back the partially created Order plus any OrderItem rows. No orphaned data.

---

## Decisions Log, Product Model

- `price` as `Float` mapped cleanly to Postgres double precision. For real money I'd use `Decimal` but Float is what the assignment intends.
- Routes return raw Prisma objects, no field renaming. The frontend's `ProductDetail.jsx` was reading `product.image_url`, so I fixed the frontend to use `imageUrl` instead of renaming the column, since `seed.js` was already camelCase.
- `DELETE /products/:id` returns 204 (no body). Updated the API contract above to match.

---

## Spec Reconciliation, Milestone 4 (Schema Audit)

### Schema vs spec gaps

- Shipped one consolidated migration named `init_schema` instead of three sequential migrations. The schema is identical to the spec, just the migration history is simpler.
- Added `customerEmail String?` to `Order` in the same migration so the stretch email filter doesn't need a second migration. Reflected in the Order table above.

### Cascade delete verification

- Deleting a Product removes its OrderItems: tested via `DELETE /products/2`, SQL count went from 1 to 0.
- Deleting an Order removes its OrderItems: tested in Prisma Studio.

---

## Decisions Log, Order Creation Transaction

- The Transactional Flow step order translated 1:1 into [models/order.js](src/models/order.js).
- The spec didn't say what happens if the same `productId` appears twice in `items`. I merge duplicate productIds before the transaction so the order ends up with one line per product and the quantity summed.
- `prisma.$transaction(async tx => { ... })` runs the callback against a transactional client. If the callback throws or any tx call fails, every write inside it rolls back. So when I throw `NotFoundError` after `findMany`, no Order row exists.
- If I started over I'd reach for `Decimal` for price and a real request validator like zod. The inline checks are fine for a one week assignment.

---

## Final Spec Reconciliation: Project Complete

### Full system audit

- All 10 required endpoints plus the stretch endpoints match the API Contract.
- Curl smoke test covered: GET /, GET /products (with filter and sort), GET /products/:id (200 and 404), POST /products, GET /orders, GET /orders/:id (with nested items), POST /orders (valid plus 400 empty items plus 404 bad productId), POST /orders/:id/items, GET /orders?customerEmail=..., GET /order-items, DELETE /products/:id (with cascade verification at the SQL level), PUT validation for both products and orders.

### Gaps resolved during frontend integration

- Frontend's `ProductDetail.jsx` and `ProductCard.jsx` read `product.image_url` (snake_case). Renamed to `imageUrl`.
- `ProductDetail.jsx` wasn't actually fetching the product. Added a `useEffect` that calls `GET /products/:productId`.
- `PaymentInfo.jsx` had a broken email input (labelled "Dorm Room Number", reading `userInfo.id`). Replaced with a real email field that writes to `userInfo.email`.
- `CheckoutSuccess.jsx` was rendering a fake `order.purchase.receipt.lines` shape. Rewrote it to render the real `{ id, status, totalPrice, orderItems[] }` response.
- `seed.js` referenced `../data/...` (wrong dir) and used `deleteMany()` which doesn't reset autoincrement, so re-seeding broke foreign key references in `orders.json` because product ids drifted. Fixed both.

### What the spec enabled

Writing the contract first meant the frontend wiring and the transactional flow fell out as translation work, not design work. The "POST /orders never trusts client price" line in the Transactional Flow section is what kept me from doing the obvious wrong thing of reading `price` off the request body.

---

## Deployment Notes (Render)

API service (Web Service):

- Build: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start: `npm start`
- Env: `DATABASE_URL` from the Render Postgres connection string. `PORT` is provided automatically.
- Run `npm run seed` once from the Render shell after the first deploy.
- Tighten CORS before deploy: swap `app.use(cors())` in [src/server.js](src/server.js) for `app.use(cors({ origin: process.env.UI_ORIGIN }))` and set `UI_ORIGIN` to the deployed UI URL.

UI service (Static Site):

- Build: `npm install && npm run build`
- Publish: `dist`
- Env: `VITE_API_URL` set to the deployed API URL.
