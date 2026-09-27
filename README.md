# 🍛 ResQ-Bite: Zero Food Waste Ecosystem

ResQ-Bite is an end-to-end, gamified food rescue platform that connects restaurants with surplus food to budget-conscious students and NGOs. It is an intelligent marketplace driven by dynamic pricing, smart logistics routing, and a powerful gamified ecosystem.

---

## 🌟 Core Innovations & USPs (Unique Selling Propositions)

### 1. 📉 Dynamic Decay Pricing Engine & Rescue Countdown
Prices for surplus food don't just stay static. ResQ-Bite's algorithm dynamically decays the price of the food as it approaches its expiration time. Students see a live **"🔥 PRICE DROPPING"** countdown (e.g., ₹120 → ₹99 → ₹79), creating urgency while maximizing revenue recovery for restaurants.

### 2. 🧠 Smart Surplus Prediction (AI-Ready)
ResQ-Bite doesn't just rescue food after it becomes surplus; it helps restaurants anticipate surplus. The dashboard provides a "Tomorrow's Predicted Surplus" breakdown (e.g., 18 Pizzas, 6 Salads) based on historical data, day of the week, and local events.

### 3. 🚚 Smart NGO Routing & Pickup Batching
The platform intelligently filters listings. Small surpluses (e.g., < 10 meals) go to the **Student Radar**. Bulk drops (e.g., >= 10 meals) bypass students and are routed exclusively to the **NGO Dashboard**. The system even batches pickups into optimal routes (e.g., *Restaurant A → Restaurant B → NGO Center*) to minimize logistics overhead.

### 4. 🔄 Traceable "Rescue Chain" Lifecycle
Every meal follows a visible, traceable lifecycle:
`Surplus Created → Dynamic Pricing → Student Rescue → Food Saved` OR 
`Bulk Surplus → NGO Matching → Fleet Dispatch → Community Distribution → Impact Recorded`
This makes ResQ-Bite a fully traceable food-rescue ecosystem, not just a marketplace.

### 5. 🏆 Gamification: Missions, Streaks & Loyalty
- **Rescue Missions:** Users get daily/weekly challenges (e.g., *Rescue 3 meals before 8:30 PM* for +150 Rescue XP).
- **Streak Protection:** Maintain a "Rescue Streak" (e.g., 6 days). Miss a day? Use a earned "Streak Freeze".
- **ResQ Pass:** A loyalty system where 10 rescues unlock sponsored rewards (like a free beverage from a partner).

### 6. 🏪 Restaurant "Waste Score" & Challenges
Restaurants are assigned a **ResQ Score (e.g., 87/100)** based on meals rescued and food diverted. They earn badges like *Waste Warrior* or *Circular Champion*. The platform also hosts **Restaurant-vs-Restaurant Challenges** (e.g., *Mumbai Rescue Week*) where merchants compete on highest recovery rate, not sales.

### 7. 🌍 Live Impact Map & Personal Dashboards
- **Live Impact Map:** A real-time map showing activity markers (🟢 Student Rescue, 🟠 Surplus, 🔵 NGO Donation).
- **Personal Dashboard:** A detailed breakdown of Meals Rescued, Money Saved, kg of Food Diverted, and CO₂ avoided.
- **Digital Certificates:** Restaurants and NGOs can generate downloadable, B2B-facing monthly "ResQ-Bite Impact Certificates" for their ESG reporting.

### 8. ⚡ Rescue Flash Drops
Restaurants can intentionally create "Flash Drops" (e.g., *15 meals available at 70% off for the next 18 minutes*) triggering push notifications to nearby students, creating a Zomato-style flash-sale feeling focused entirely on surplus.

---

## 🚀 Existing Features Implemented

### For Students (Buyers)
- **Live Drop Radar:** Search, filter (Veg/Vegan/etc), and sort active surplus food in their area.
- **Activity History:** Keep track of past orders and secure pickup codes.
- **Leaderboards & Badges:** Gamified stats showing money saved and CO₂ prevented.

### For Restaurants (Merchants)
- **Store Dashboard:** Monitor active and claimed listings, track revenue recovered, and see exact kilograms of food waste prevented.
- **One-Click Publishing:** Publish a "Surplus Drop" by defining base price, minimum price (for dynamic decay), and expiration time.
- **Automated NGO Donations:** Unsold food automatically converts into free NGO donations at expiration.

### For NGOs (Distributors)
- **Donation Radar:** View map and list of all bulk donations and expired items available for free pickup.
- **Fleet Dispatching:** "Dispatch Truck" functionality to claim bulk orders.

---

## 🔐 How to Login (Pre-seeded Accounts)

**Merchant / Hotel Login:**
- **Email:** `merchant@example.com`
- **Password:** `password123`  
*(Or simply click "Sign Up" and register as a "Restaurant Partner")*

**Student Login:**
- **Email:** `student@example.com`
- **Password:** `password123`

**NGO Login:**
- **Email:** `ngo@example.com`
- **Password:** `password123`

---

## 🛠 Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Maps:** Google Maps API
- **State Management:** React Context API

## 🔑 API Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | ❌ | — | Create account |
| POST | `/api/auth/login` | ❌ | — | Login & get JWT |
| GET | `/api/listings/active` | ✅ | Student | Active surplus drops (qty < 10) |
| GET | `/api/listings/donations` | ✅ | NGO | Expired OR Bulk items (qty >= 10) |
| POST | `/api/listings` | ✅ | Merchant | Create a surplus drop |
| DELETE | `/api/listings/:id` | ✅ | Merchant | Cancel a drop |
| GET | `/api/listings/merchant` | ✅ | Merchant | Store's own listings |
| GET | `/api/orders/claim` | ✅ | Student | Claim 1 item (generates pickup code)|
| POST | `/api/donations/claim` | ✅ | NGO | Bulk claim donation |
| GET | `/api/orders/history` | ✅ | Any | User's activity history |
| GET | `/api/stats/leaderboard` | ✅ | Any | Ranked leaderboard |
| GET | `/api/stats/global` | ❌ | Any | Landing page impact counters |
| POST | `/api/demo/fast-forward` | — | Dev only | Time travel (dev) |