# 🛠️ ResQ-Bite — Technical Architecture & Interview Guide

> This document covers the complete technical stack, design decisions, and engineering concepts behind ResQ-Bite. Written in a student-friendly, interview-ready format.

---

## 📐 Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Tech Stack — Full Breakdown](#2-tech-stack--full-breakdown)
3. [Database Design](#3-database-design)
4. [Authentication & Security](#4-authentication--security)
5. [JWT — Deep Dive](#5-jwt--deep-dive)
6. [API Design & REST Principles](#6-api-design--rest-principles)
7. [Core Business Logic](#7-core-business-logic)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Security Measures](#9-security-measures)
10. [Key Engineering Decisions & Trade-offs](#10-key-engineering-decisions--trade-offs)
11. [Interview Q&A Cheatsheet](#11-interview-qa-cheatsheet)

---

## 1. System Architecture Overview

ResQ-Bite follows a **3-tier client-server architecture**, which is the industry standard for web applications.

```
+---------------------------------------------------------------+
|                        CLIENT LAYER                           |
|           React + Vite (runs on port 5173)                    |
|   Components -> Context API -> API Service -> HTTP Requests   |
+-----------------------------+---------------------------------+
                              | HTTPS / REST API calls
                              v
+---------------------------------------------------------------+
|                      SERVER LAYER                             |
|             Node.js + Express.js (port 5000)                  |
|   Routes -> Middleware (JWT, Rate Limit) -> Controllers       |
+-----------------------------+---------------------------------+
                              | SQL Queries (mysql2/promise)
                              v
+---------------------------------------------------------------+
|                      DATA LAYER                               |
|                    MySQL 8.0 Database                         |
|         Connection Pool (max 10 concurrent connections)       |
+---------------------------------------------------------------+
```

**In plain English:** The browser (React) talks to the Node.js server via HTTP. The server processes the request, talks to MySQL, and sends back JSON. The browser then renders the data.

---

## 2. Tech Stack — Full Breakdown

### Backend

| Technology | Version | Why we used it |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime; handles many concurrent requests efficiently using its non-blocking, event-driven I/O model |
| **Express.js** | 4.x | Minimal and fast web framework for Node.js; handles routing, middleware chaining, and error handling |
| **MySQL 2** | (mysql2/promise) | MySQL driver for Node.js; the `promise` variant lets us use `async/await` instead of callbacks, keeping code readable |
| **bcryptjs** | 2.x | Password hashing library; never stores plain text passwords |
| **jsonwebtoken** | 9.x | Generates and verifies JWT tokens for stateless authentication |
| **helmet** | 7.x | Sets secure HTTP headers automatically (e.g., X-Frame-Options, Content-Security-Policy) |
| **express-rate-limit** | 6.x | Prevents brute-force attacks by limiting repeated requests from the same IP |
| **cors** | 2.x | Controls which origins (domains) can access the API |
| **dotenv** | 16.x | Loads secret config variables from a `.env` file into `process.env` |
| **crypto** | Built-in | Node.js built-in module; we use `randomUUID()` to generate unique IDs for every record |

### Frontend

| Technology | Why we used it |
|---|---|
| **React 18** | Component-based UI library; lets us build reusable pieces (FoodCard, Navbar, etc.) |
| **Vite** | Ultra-fast build tool and development server; much faster than Create React App |
| **Tailwind CSS** | Utility-first CSS framework; lets us style directly in JSX without separate CSS files |
| **React Router DOM v6** | Client-side routing; navigates between pages without refreshing the browser |
| **Lucide React** | Clean, consistent icon library (SVG icons as React components) |
| **@react-google-maps/api** | React wrapper for the Google Maps JavaScript API |
| **Context API** | React's built-in global state management (no Redux needed for this scale) |

---

## 3. Database Design

### Why MySQL?

> **Interview answer:** "I chose MySQL because the data in ResQ-Bite is highly structured and relational — a restaurant has listings, listings have orders, orders have reviews. This is a classic relational data model. MySQL's ACID guarantees (Atomicity, Consistency, Isolation, Durability) are critical for operations like claiming food, where we need to ensure inventory doesn't go below zero even if 100 users click simultaneously."

### Entity Relationship Overview

```
users
  +-- (role: merchant) --> restaurants --> surplus_listings
  |                                              |
  +-- (role: student)  --> orders  <-------------+
  |        |
  |        +--> reviews
  |
  +-- (role: ngo)      --> orders (bulk, free)
  |
  +--> user_stats  (1-to-1)
  +--> notifications
```

### Tables Explained

#### `users`
```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,           -- UUID, not auto-increment integer
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash, NEVER plain text
    role ENUM('student', 'merchant', 'ngo') NOT NULL,
    INDEX idx_email (email)            -- Index for fast login lookups
)
```
> **Why UUID and not AUTO_INCREMENT integer?** UUIDs are globally unique, non-sequential, and don't leak information about how many users you have. An attacker can't guess `user/2` if your ID is `7f3d-a8b2-...`.

#### `surplus_listings`
```sql
CREATE TABLE surplus_listings (
    id CHAR(36) PRIMARY KEY,
    base_price DECIMAL(10,2),     -- Starting price
    min_price DECIMAL(10,2),      -- Floor price (never goes below this)
    original_price DECIMAL(10,2), -- MRP to calculate discount %
    pickup_end_time DATETIME,     -- Used for dynamic pricing & expiry
    status ENUM('active', 'claimed', 'donated', 'cancelled', 'expired'),
    INDEX idx_status (status),    -- Fast filtering by status
    INDEX idx_category (category)
)
```
> The `min_price` and `original_price` fields power the **Dynamic Decay Pricing Engine**. The algorithm calculates the current price based on elapsed time between `created_at` and `pickup_end_time`.

#### `orders` — Transaction Safety with `FOR UPDATE`
```sql
-- In order.controller.js:
SELECT * FROM surplus_listings
WHERE id = ? AND quantity_available > 0
FOR UPDATE;
```
> `FOR UPDATE` is a **pessimistic lock**. It tells MySQL: "I'm about to modify this row, don't let anyone else read it until I'm done." This prevents the **race condition** where 2 students claim the last item simultaneously.

#### `user_stats` — Upsert with `ON DUPLICATE KEY UPDATE`
```sql
INSERT INTO user_stats (user_id, items_rescued, ...)
VALUES (?, 1, ...)
ON DUPLICATE KEY UPDATE
    items_rescued = items_rescued + 1, ...
```
> This is a powerful MySQL trick called an **upsert** — INSERT if the row doesn't exist, UPDATE if it does. This avoids a separate SELECT query to check existence first.

---

## 4. Authentication & Security

### The Authentication Flow (Step by Step)

```
1. User submits email + password to POST /api/auth/login
2. Server fetches user record from DB by email
3. Server runs: bcrypt.compare(plain_password, stored_hash)
4. If match -> Server signs a JWT: { id, email, role }
5. JWT is returned to the browser
6. Browser stores JWT in localStorage
7. Every future request includes: Authorization: Bearer <token>
8. Server's auth middleware verifies the token on every protected route
9. Decoded user info (id, role) is attached to req.user for controllers
```

### Password Hashing with bcrypt

> **Interview answer:** "We never store passwords. We store a bcrypt hash. bcrypt is a one-way adaptive hashing algorithm — it's intentionally slow to resist brute-force attacks. Even if our database is stolen, the attacker only gets useless hashes."

```javascript
// Registration — hash the password before storing
const password_hash = await bcrypt.hash(password, 10);
// The '10' is the salt rounds (cost factor). Higher = slower = more secure.

// Login — compare plain text against hash
const isMatch = await bcrypt.compare(password, user.password_hash);
// bcrypt extracts the salt from the stored hash automatically.
```

**Why not MD5 or SHA-256?** Those are fast hashing algorithms — great for file checksums, terrible for passwords. A GPU can compute billions of SHA-256 hashes per second. bcrypt's cost factor limits attacks to approximately 100 tries/second.

---

## 5. JWT — Deep Dive

### What is a JWT?

JWT stands for **JSON Web Token**. It is an open standard (RFC 7519) for securely transmitting information between parties as a compact, self-contained string. Think of it as a signed ID card — the server issues it, and every request shows it.

### Structure of a JWT

A JWT has 3 parts, separated by dots: `header.payload.signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.
eyJpZCI6InUyIiwiZW1haWwiOiJzdHVkZW50QGV4YW1wbGUuY29tIiwicm9sZSI6InN0dWRlbnQifQ
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

#### Part 1: Header (Algorithm Declaration)
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
Base64-encoded. Tells the receiver which algorithm was used to sign.

#### Part 2: Payload (The Claims — Your "ID Card" Data)
```json
{
  "id": "u2",
  "email": "student@example.com",
  "role": "student",
  "iat": 1727000000,
  "exp": 1727604800
}
```
> WARNING: The payload is **Base64-encoded, NOT encrypted**. Anyone can decode it. Never put passwords or sensitive data in a JWT payload.

#### Part 3: Signature (Tamper-Proofing)
```
HMAC_SHA256(
  base64(header) + "." + base64(payload),
  JWT_SECRET   <- Only the server knows this!
)
```
The signature guarantees the token hasn't been tampered with. If someone edits the payload (e.g., changes `"role": "student"` to `"role": "merchant"`), the signature will no longer match, and the server rejects the token.

### How we use JWT in ResQ-Bite

```javascript
// auth.controller.js — Sign a token on login
const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,  // Stored in .env file, never in code
    { expiresIn: '7d' }
);
```

```javascript
// middleware/auth.js — Verify on every protected route
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1]; // "Bearer <token>"
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role } is now available in controllers
    next();
};
```

```javascript
// Role-Based Access Control (RBAC)
const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role))
        return res.status(403).json({ error: 'Forbidden' });
    next();
};

// Applied to routes:
router.post('/claim', verifyToken, requireRole('student'), claimItem);
router.post('/donations/claim', verifyToken, requireRole('ngo'), claimDonation);
router.post('/', verifyToken, requireRole('merchant'), create);
```

### JWT vs. Sessions — Why JWT?

| | JWT (Stateless) | Sessions (Stateful) |
|---|---|---|
| **Storage** | Token on client (localStorage) | Session ID in cookie, data on server |
| **Server load** | Zero server-side storage | Must look up session on every request |
| **Scalability** | Any server can verify the token | Requires shared session store (Redis) |
| **Revocation** | Hard — valid until expiry | Easy — delete session from store |
| **We chose** | JWT | — |

> **Interview answer:** "I chose JWT because ResQ-Bite is a stateless REST API. All user info (id, role) is encoded in the token itself. Any of 10 server instances can verify the same token without needing shared state. This makes the backend horizontally scalable by design."

---

## 6. API Design & REST Principles

### REST Principles We Follow

1. **Stateless:** Every request contains all the information the server needs.
2. **Resource-based URLs:** URLs represent nouns, not verbs.
   - Correct: `POST /api/orders/claim` (creates an order resource)
   - Wrong: `POST /api/claimFood`
3. **HTTP Methods carry semantic meaning:**
   - `GET` = Read (no side effects)
   - `POST` = Create
   - `DELETE` = Remove
4. **HTTP Status Codes are used precisely:**
   - `200` Success, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `500` Server Error

### Route to Controller Flow

```
HTTP Request
    |
    v
Express Router (routes/listing.routes.js)
    |
    v
Middleware Chain: verifyToken -> requireRole -> validateBody
    |
    v
Controller Function (controllers/listing.controller.js)
    |
    v
Database Query (config/db.js connection pool)
    |
    v
JSON Response
```

### Complete API Reference

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | /api/auth/register | No | — | Register and receive JWT |
| POST | /api/auth/login | No | — | Login and receive JWT |
| GET | /api/listings/active | Yes | Student | Drops with qty < 10, dynamic pricing |
| GET | /api/listings/donations | Yes | NGO | Bulk or expired drops |
| POST | /api/listings | Yes | Merchant | Create a surplus drop |
| DELETE | /api/listings/:id | Yes | Merchant | Cancel a listing |
| GET | /api/listings/merchant | Yes | Merchant | Store's own listings |
| GET | /api/listings/merchant/stats | Yes | Merchant | Revenue and waste stats |
| POST | /api/orders/claim | Yes | Student | Claim 1 item |
| POST | /api/orders/donations/claim | Yes | NGO | Bulk claim |
| GET | /api/orders/history | Yes | Any | Activity history |
| GET | /api/stats | Yes | Any | Personal impact stats |
| GET | /api/stats/leaderboard | Yes | Any | Global leaderboard |
| GET | /api/stats/global | No | Any | Landing page counters |
| POST | /api/demo/fast-forward | No | Dev | Expire all active listings |

---

## 7. Core Business Logic

### 7.1 Dynamic Decay Pricing Engine

> **The Problem:** A restaurant posts Dal Makhani at Rs.120 at 12:00 PM with a pickup deadline of 4:00 PM. At 3:50 PM, it should be much cheaper to incentivize a last-minute rescue. Static prices don't create urgency.

> **The Solution:** Linear price decay from `base_price` to `min_price` over the listing's lifetime.

```javascript
// Backend: listing.controller.js
const decayRatio = Math.min(elapsed / totalDuration, 1);
// elapsed = time since the listing was created
// totalDuration = total window from creation to expiry

const priceDiff = base_price - min_price;
const dynamicPrice = base_price - (priceDiff * decayRatio);
// At 0% elapsed: price = base_price (Rs.120)
// At 50% elapsed: price = Rs.90
// At 100% elapsed: price = min_price (Rs.60)
```

```javascript
// Frontend: FoodCard.jsx — runs every second for live countdown display
useEffect(() => {
    const interval = setInterval(calculateDynamicState, 1000);
    return () => clearInterval(interval); // cleanup prevents memory leaks
}, [listing]);
```

### 7.2 Smart NGO Routing

| Listing Type | Condition | Route |
|---|---|---|
| Small Surplus | qty < 10 AND not expired | Student Live Radar (/api/listings/active) |
| Bulk Surplus | qty >= 10 OR expired | NGO Donation Radar (/api/listings/donations) |

```sql
-- Student query
WHERE quantity_available > 0
  AND quantity_available < 10
  AND pickup_end_time > NOW()

-- NGO query
WHERE quantity_available > 0
  AND (pickup_end_time <= NOW() OR quantity_available >= 10)
```

### 7.3 Pessimistic Locking — Preventing Race Conditions

> **The Problem:** 50 students all see "1 item left" and click "Claim Now" simultaneously. Without protection, all 50 succeed and inventory goes to -49.

> **The Solution:** `SELECT ... FOR UPDATE` acquires an exclusive row-level lock. The first transaction wins; all others block until it commits.

```javascript
// order.controller.js
const connection = await db.getConnection();
await connection.beginTransaction();

// This acquires a row-level LOCK — only this transaction can read/modify the row
const [listings] = await connection.query(
    'SELECT * FROM surplus_listings WHERE id = ? AND quantity_available > 0 FOR UPDATE',
    [listing_id]
);

if (listings.length === 0) {
    await connection.rollback(); // Item was claimed by the faster transaction
    return res.status(400).json({ error: 'Item not available' });
}

await connection.query(
    'UPDATE surplus_listings SET quantity_available = quantity_available - 1 WHERE id = ?',
    [listing_id]
);
await connection.commit(); // Lock released here
```

### 7.4 Database Transactions (ACID Compliance)

A **transaction** groups multiple SQL statements into one atomic unit. All succeed, or all are rolled back.

```javascript
// Claiming food: 4 operations must ALL succeed or ALL be undone
await connection.beginTransaction();
// Step 1: Lock inventory and decrement
// Step 2: Create an orders record
// Step 3: Update user_stats (streak, CO2, money saved) via UPSERT
// Step 4: Insert a notification
await connection.commit();   // All 4 done? Commit.
// catch:
await connection.rollback(); // Any failure? Undo all 4. Data stays consistent.
```

> **ACID in use:** Atomicity (all or nothing), Consistency (no partial state), Isolation (FOR UPDATE), Durability (committed data survives crashes).

### 7.5 Rescue Streak Logic

```javascript
const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

if (diffDays === 1)      streakDays = current + 1; // Consecutive day
else if (diffDays === 0) streakDays = current;      // Same day, no change
else                     streakDays = 1;             // Gap > 1 day, reset
```

### 7.6 Pickup Code Generation

```javascript
const generatePickupCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();
// Output examples: "A3K9PX", "QW74BZ"
// Base-36 = digits (0-9) + letters (a-z) = short, alphanumeric, easy to read aloud
```

---

## 8. Frontend Architecture

### Component Tree

```
App.jsx (React Router)
|
+-- LandingPage
|   +-- HeroSection
|   +-- LiveImpactCounter     (polls /api/stats/global)
|   +-- HowItWorks
|   +-- TestimonialsSection
|   +-- PartnersMarquee
|   +-- FAQSection
|
+-- StudentDashboard
|   +-- Navbar
|   +-- Helper Banner (dismissable)
|   +-- Impact Sidebar         (reads from /api/stats)
|   +-- Daily Mission Card
|   +-- FoodCard[]             (live price countdown every 1 second)
|   +-- GoogleMapView
|
+-- MerchantDashboard
|   +-- Navbar
|   +-- ResQ Score Card        (waste sustainability profile)
|   +-- Smart Prediction       (calculated from historical stats)
|   +-- CreateListingForm
|   +-- Store History
|
+-- NGODashboard
    +-- Navbar
    +-- Helper Banner (dismissable)
    +-- Community Impact Sidebar
    +-- DonationCard[]
    +-- GoogleMapView
```

### State Management with Context API

```javascript
// context/AuthContext.jsx
// Stores: who is currently logged in (user object + JWT token)

// Persist across page refresh — stored in localStorage:
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Any component accesses auth state like this:
const { user, token, logout } = useAuth();
```

> **Why Context API and not Redux?** Redux adds significant boilerplate — actions, reducers, dispatch, a store. For ResQ-Bite, the only global state is authentication. Everything else is component-local data fetched from the API. Context API handles this cleanly with minimal code.

### API Service Layer

```javascript
// services/api.js — All API calls live here, not in components

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Attach JWT to every request automatically
const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

export const getActiveListings = (params) =>
    fetch(`${API_URL}/listings/active?${new URLSearchParams(params)}`, {
        headers: authHeader()
    }).then(handleResponse);
```

> **Why a service layer?** Separation of concerns. If the API URL changes, we fix it in one file. Components just call `getActiveListings()` — they don't care about fetch details.

### Environment Variables

```bash
# Frontend: resq-bite/.env
VITE_GOOGLE_MAPS_API_KEY=AIza...
# Accessed as: import.meta.env.VITE_GOOGLE_MAPS_API_KEY

# Backend: backend/.env
JWT_SECRET=resq_bite_super_secret...
DB_PASSWORD=...
# Accessed as: process.env.JWT_SECRET
```

> **Why env vars?** Secrets must NEVER be in source code. If DB_PASSWORD is hardcoded and pushed to GitHub, it's immediately compromised. `.env` files are always in `.gitignore`.

---

## 9. Security Measures

| Threat | Mitigation | Where in code |
|---|---|---|
| Password theft | bcrypt hashing, cost factor 10 | auth.controller.js |
| JWT tampering | HMAC-SHA256 signature with server secret | middleware/auth.js |
| Brute-force login | Rate limit: 20 requests / 15 min on /api/auth/* | app.js |
| XSS, Clickjacking | helmet.js sets 12+ secure HTTP response headers | app.js |
| CORS attacks | Only http://localhost:5173 allowed as API origin | app.js |
| SQL Injection | Parameterized queries (? placeholders), never string concat | All controllers |
| Race conditions (inventory) | MySQL SELECT ... FOR UPDATE row locking | order.controller.js |
| Request size DoS | JSON body limited to 10KB | app.js |
| ID enumeration | UUID primary keys (non-sequential, non-guessable) | All tables |

### SQL Injection — Safe vs Unsafe

```javascript
// SAFE: Parameterized query — mysql2 escapes the input
db.query('SELECT * FROM users WHERE email = ?', [email]);

// DANGEROUS: String concatenation — NEVER do this
db.query(`SELECT * FROM users WHERE email = '${email}'`);
// If email = "' OR '1'='1" --> returns every user in the database
```

---

## 10. Key Engineering Decisions & Trade-offs

### Why MySQL over MongoDB?

> "ResQ-Bite has strong relational data — listings belong to restaurants, orders belong to users and listings, reviews belong to orders. MySQL's JOIN capabilities, foreign key constraints, and ACID transactions are a better fit. Specifically, the `SELECT ... FOR UPDATE` pessimistic lock that prevents inventory over-claiming is a relational DB feature that would require complex application-level workarounds in MongoDB."

### Why Connection Pooling?

```javascript
const pool = mysql.createPool({ connectionLimit: 10 });
```
> A connection pool pre-creates database connections. Requests borrow one, use it, return it. Without pooling, every HTTP request spends ~50-100ms establishing a new TCP connection to MySQL — unacceptable at scale.

### Why `async/await` over Callbacks?

```javascript
// Old: Callback Hell — hard to read, hard to error-handle
db.query('SELECT ...', (err, results) => {
    db.query('INSERT ...', (err2, r2) => { /* deeply nested */ });
});

// Modern: async/await — reads like synchronous code, easy try/catch
const [results] = await db.query('SELECT ...');
const [r2] = await db.query('INSERT ...');
```

### JWT localStorage vs. HttpOnly Cookies

> Currently we store JWTs in `localStorage` for simplicity. This means a successful XSS attack could steal the token. The production-safe alternative is **HttpOnly cookies** (inaccessible to JavaScript) combined with **CSRF tokens**. For production, the auth flow would need to be updated to use `Set-Cookie` on the backend and `withCredentials: true` on the frontend.

---

## 11. Interview Q&A Cheatsheet

**Q: Tell me about your project.**  
A: "ResQ-Bite is a full-stack food rescue platform connecting restaurants with surplus food to students and NGOs. It has a dynamic decay pricing engine — food gets cheaper as the pickup deadline approaches — and smart NGO routing that automatically directs bulk orders exclusively to NGOs. It's built with React + Vite on the frontend, Node.js + Express on the backend, and MySQL for the database."

**Q: How does authentication work?**  
A: "I use JWT-based stateless authentication. On login, the server verifies the bcrypt-hashed password and signs a JWT containing the user's ID, email, and role. Every subsequent API request sends this token in the Authorization header. An Express middleware verifies the signature and extracts user info before the controller runs. Role-based access control then checks whether the user's role matches what the route requires."

**Q: How do you prevent two people from claiming the last item simultaneously?**  
A: "Pessimistic locking — a MySQL `SELECT ... FOR UPDATE` inside a database transaction. This acquires an exclusive row-level lock. The first transaction to get the lock proceeds; all others block. When the first transaction commits (decrementing qty to 0), the waiting transactions then read qty = 0 and return 'Item not available'. This prevents inventory from going negative under concurrent load."

**Q: Explain JWT — what's inside it, how does it work?**  
A: "A JWT has three parts: a header declaring the algorithm (HS256), a payload containing the claims (user ID, role, expiry), and a signature. The signature is an HMAC-SHA256 hash of the header + payload using a secret key only the server knows. If anyone tampers with the payload, the signature won't match the new content, and the server rejects it. The payload is Base64-encoded, not encrypted, so it's readable — you never put passwords in it."

**Q: What is bcrypt and why not SHA-256?**  
A: "bcrypt is a password hashing function designed to be slow — computationally expensive on purpose. SHA-256 can run at billions of hashes per second on a GPU. bcrypt with cost factor 10 runs at roughly 100 hashes per second — making brute-force 40 million times harder. It also generates a unique cryptographic salt per password automatically, defeating rainbow table attacks."

**Q: What is CORS and why did you configure it?**  
A: "CORS — Cross-Origin Resource Sharing — is a browser security mechanism that blocks JavaScript from making requests to a different domain. My React app is on port 5173 and the API is on port 5000, making them different origins. Without CORS configuration, the browser rejects every API call. I configure Express to explicitly allow requests from the frontend origin using the `cors` middleware."

**Q: How does dynamic pricing work technically?**  
A: "I calculate a decay ratio: elapsed time divided by total listing duration. I multiply this by the price range (base_price minus min_price) and subtract from the base price. At 0% elapsed, price is the full base price. At 100% elapsed, it hits the minimum floor. This runs in two places: on the server when returning listings, and in a 1-second setInterval inside the FoodCard React component for the live countdown display."

**Q: Why Context API over Redux?**  
A: "Redux is excellent for large apps with complex cross-component state interactions — global UI state, caches, optimistic updates. For ResQ-Bite, the only truly global state is authentication (who is logged in). All other data is fetched fresh from the API by each component. Using Redux here would be over-engineering with unnecessary boilerplate. Context API achieves the same result with a fraction of the code."

**Q: What are database indexes and why did you add them?**  
A: "A database index is a data structure (typically a B-tree) that lets MySQL find matching rows without scanning the entire table. Without an index on `surplus_listings.status`, every query finding 'active' listings would do a full table scan. With `INDEX idx_status (status)`, MySQL jumps directly to matching rows. I added indexes on columns used in WHERE clauses — email, status, category, owner_id, and user_id — which dramatically reduces query time as the dataset grows."

**Q: What are ACID properties?**  
A: "ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity means all operations in a transaction succeed or none do — I use `BEGIN TRANSACTION` with `COMMIT/ROLLBACK` when a student claims food (decrement inventory + create order + update stats + insert notification must all happen or none). Consistency means the database never enters an invalid state. Isolation, in our case enforced by `FOR UPDATE`, means concurrent transactions don't interfere. Durability means committed data survives system crashes."
