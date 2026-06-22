## Unit Assignment: Student Store

Submitted by: **Muhammed Enes Bilek**

Deployed Application (optional): [Student Store Deployed Site](ADD_LINK_HERE)

### Application Features

#### CORE FEATURES

- [x] **Database Creation**: Set up a Postgres database to store information about products and orders.
  - [x] Use Prisma to define models for `products`, `orders`, and `order_items`.
- [x] **Products Model**
  - [x] Develop a products model to represent individual items available in the store.
  - [x] This model should at minimum include the attributes:
    - [x] `id`
    - [x] `name`
    - [x] `description`
    - [x] `price`
    - [x] `image_url` (stored as `imageUrl` in Prisma; same column in JSON responses)
    - [x] `category`
  - [x] Implement methods for CRUD operations on products.
  - [x] Ensure transaction handling such that when a product is deleted, any `order_items` that reference that product are also deleted.
- [x] **Orders Model**
  - [x] Develop a model to manage orders.
  - [x] This model should at minimum include the attributes:
    - [x] `order_id` (stored as `id`)
    - [x] `customer_id` (stored as `customer`)
    - [x] `total_price` (stored as `totalPrice`)
    - [x] `status`
    - [x] `created_at` (stored as `createdAt`)
  - [x] Implement methods for CRUD operations on orders.
  - [x] Ensure transaction handling such that when an order is deleted, any `order_items` that reference that order are also deleted.
- [x] **Order Items Model**
  - [x] Develop a model to represent the items within an order.
  - [x] This model should at minimum include the attributes:
    - [x] `order_item_id` (stored as `id`)
    - [x] `order_id` (stored as `orderId`)
    - [x] `product_id` (stored as `productId`)
    - [x] `quantity`
    - [x] `price`
  - [x] Implement methods for fetching and creating order items.
- [x] **API Endpoints**
  - [x] Application supports the following **Product Endpoints**:
    - [x] `GET /products`: Fetch a list of all products.
    - [x] `GET /products/:id`: Fetch details of a specific product by its ID.
    - [x] `POST /products`: Add a new product to the database.
    - [x] `PUT /products/:id`: Update the details of an existing product.
    - [x] `DELETE /products/:id`: Remove a product from the database.
  - [x] Application supports the following **Order Endpoints**:
    - [x] `GET /orders`: Fetch a list of all orders.
    - [x] `GET /orders/:order_id`: Fetch details of a specific order by its ID, including the order items.
    - [x] `POST /orders`: Create a new order with specified order items.
    - [x] `PUT /orders/:order_id`: Update the details of an existing order (e.g., change status).
    - [x] `DELETE /orders/:order_id`: Remove an order from the database.
- [x] **Frontend Integration**
  - [x] Connect the backend API to the provided frontend interface, ensuring dynamic interaction for product browsing, cart management, and order placement.
  - [x] Ensure the home page displays products contained in the product table.

### Stretch Features

- [x] **Added Endpoints**
  - [x] `GET /order-items`: Create an endpoint for fetching all order items in the database.
  - [x] `POST /orders/:order_id/items`: Create an endpoint that adds a new order item to an existing order.
- [x] **Past Orders Page**
  - [x] Built a page in the UI at `/orders` that displays all past orders.
  - [x] Each order shows order id, date, status, total cost.
  - [x] Clicking an order expands it to show items, quantities, line costs, and total.
- [x] **Filter Orders**
  - [x] Email input on the Past Orders page filters via `GET /orders?customerEmail=...`.
  - [x] Clear button restores the full list.
  - [x] Shows "No orders found." when the filter matches nothing.
- [ ] **Deployment**
  - [ ] Website is deployed using [Render](https://courses.codepath.org/snippets/site/render_deployment_guide).

### Setup

Backend:

```
cd student-store-api
npm install
# Edit .env to point DATABASE_URL at your local Postgres
npx prisma migrate dev
npm run seed
npm run dev    # http://localhost:3001
```

Frontend:

```
cd student-store-ui
npm install
npm run dev    # http://localhost:5173
```

See [student-store-api/planning.md](student-store-api/planning.md) for the full system spec.

### Walkthrough Video

`ADD_EMBEDDED_CODE_HERE`

### Reflection

* Did the topics discussed in your labs prepare you to complete the assignment? Be specific, which features in your weekly assignment did you feel unprepared to complete?

Add your response here

* If you had more time, what would you have done differently? Would you have added additional features? Changed the way your project responded to a particular event, etc.

Add your response here

* Reflect on your project demo, what went well? Were there things that maybe didn't go as planned? Did you notice something that your peer did that you would like to try next time?

Add your response here

### Open-source libraries used

- [Express](https://expressjs.com/), [Prisma](https://www.prisma.io/), [pg](https://node-postgres.com/), [cors](https://github.com/expressjs/cors), [dotenv](https://github.com/motdotla/dotenv)
- [React](https://react.dev/), [React Router](https://reactrouter.com/), [axios](https://axios-http.com/), [moment](https://momentjs.com/), [Vite](https://vitejs.dev/)

### Shout out

Add your response here
