🍃 ResQ-Bite | Full-Stack Food Rescue Marketplace

🚀 The Mission

Zero Commercial Food Waste.
Every day, perfectly good food is thrown away at the end of the day by restaurants and campus dining halls. Meanwhile, students struggle with tight budgets, and local charities lack consistent food sources.

ResQ-Bite is a 3-sided, real-time marketplace built to solve this. It connects local merchants with students for heavily discounted surplus meals, and features a time-triggered engine that automatically funnels expired drops directly to NGOs for bulk rescue.

✨ Core Features & Architecture

This application was engineered with a strict role-based architecture to serve three distinct user types:

1. The Student Portal (Gamified B2C)

Live Radar: Interactive, geospatial map (Leaflet) rendering real-time, nearby surplus drops.

Dynamic Claiming: High-concurrency claiming pipeline ensuring inventory integrity.

Eco-Impact Engine: Real-time gamification tracking personal CO₂ emissions prevented and financial savings, automatically leveling up the user's "Eco-Warrior" status.

2. The Merchant Dashboard (B2B SaaS)

Rapid Drop Pipeline: A streamlined form for merchants to publish end-of-day surplus inventory to the live radar in seconds.

Live Inventory Management: Real-time tracking of active claims, allowing merchants to cancel or adjust active drops on the fly.

3. The NGO / Charity Engine (Time-Triggered Bulk Dispatch)

Automated Expiration Logic: Food drops that pass their pickup deadline are instantly removed from the student radar.

100% Discount Override: Expired items are automatically re-priced to $0.00 and pushed to a dedicated "Donation Radar."

Bulk Claiming: NGOs can dispatch trucks to claim the entirety of remaining batches, preventing landfill waste and generating massive CO₂ savings metrics.

🛠 Tech Stack

Frontend:

React.js (Vite)

Tailwind CSS (Premium utility-first styling, glassmorphism UI)

React-Leaflet / OpenStreetMap (Interactive geospatial rendering)

Lucide React (Iconography)

Backend:

Node.js & Express.js (REST API architecture)

MySQL (Relational database with complex constraints and indexing)

mysql2 connection pooling (Optimized for high-concurrency read/writes)

Bcrypt (Secure password hashing)

⚙️ Technical Highlights

Time-Travel Developer API: Built a custom /api/demo/fast-forward endpoint that manipulates the MySQL database clock. This allows recruiters/testers to instantly fast-forward active food drops into an "expired" state, seamlessly demonstrating the NGO hand-off logic without waiting for real-world timers.

Database Constraints & Transactions: Implemented robust SQL FOR UPDATE transaction locks during the claiming process to prevent race conditions (e.g., two students trying to buy the last slice of pizza simultaneously).

Auto-Provisioning Profiles: Developed a backend fallback that automatically generates physical restaurant profiles (is_verified = TRUE) when a new merchant creates an account, ensuring the drop-creation pipeline never breaks during demos.

💻 Local Setup & Installation

Want to run ResQ-Bite locally? Follow these steps:

Prerequisites

Node.js (v16+)

MySQL Server running locally

1. Clone the Repository

git clone https://github.com/PiyushF21/RESQ_Bite.git
cd RESQ_Bite


2. Database Setup

Open your MySQL client.

Create a new database: CREATE DATABASE resq_bite;

Execute the SQL scripts located in the backend/ folder in this order:

schema_part_1.sql (Users & Restaurants)

mysql_schema_step1.sql / step2 / step3 / step4 / step5

setup_gamification.sql

seed_data.sql (To populate dummy restaurants and active food drops)

3. Backend Setup

cd backend
npm install express cors mysql2 bcryptjs dotenv


Create a .env file in the backend/ directory:

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=resq_bite


Start the server:

node server.js


4. Frontend Setup

Open a new terminal window:

# Return to the root folder
cd ..
npm install
npm run dev


The app will now be running on http://localhost:5173!

Designed & Built by Piyush.