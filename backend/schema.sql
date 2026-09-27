CREATE DATABASE IF NOT EXISTS resq_bite;
USE resq_bite;

DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS user_stats;
DROP TABLE IF EXISTS surplus_listings;
DROP TABLE IF EXISTS restaurants;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'merchant', 'ngo') NOT NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE restaurants (
    id CHAR(36) PRIMARY KEY,
    owner_id CHAR(36) NOT NULL,
    business_name VARCHAR(150) NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(20) NULL,
    cuisine_type VARCHAR(100) DEFAULT 'Multi-Cuisine',
    description TEXT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    rating DECIMAL(3,2) DEFAULT 4.00,
    total_reviews INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE surplus_listings (
    id CHAR(36) PRIMARY KEY,
    restaurant_id CHAR(36) NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    description TEXT,
    category ENUM('veg', 'non-veg', 'vegan', 'dessert', 'beverage', 'snack') DEFAULT 'veg',
    quantity_available INT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    min_price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2) NULL,
    pickup_start_time DATETIME,
    pickup_end_time DATETIME NOT NULL,
    status ENUM('active', 'claimed', 'donated', 'cancelled', 'expired') DEFAULT 'active',
    image_url VARCHAR(500) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    INDEX idx_restaurant (restaurant_id),
    INDEX idx_status (status),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_stats (
    user_id CHAR(36) PRIMARY KEY,
    total_money_saved DECIMAL(10,2) DEFAULT 0,
    total_co2_saved_kg DECIMAL(10,2) DEFAULT 0,
    items_rescued INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    last_rescue_date DATE NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    listing_id CHAR(36) NOT NULL,
    quantity INT DEFAULT 1,
    total_price DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    pickup_code VARCHAR(6) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES surplus_listings(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    restaurant_id CHAR(36) NOT NULL,
    order_id CHAR(36) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    UNIQUE KEY unique_order_review (order_id),
    INDEX idx_restaurant (restaurant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('order', 'donation', 'achievement', 'system') DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- SEED DATA: Indian Restaurants & Dishes
-- ============================================

-- Seed Users
INSERT INTO users (id, full_name, email, password_hash, role, phone) VALUES 
('u1', 'Rajesh Sharma', 'merchant@example.com', '$2a$10$jIrrVT8qfrCnjLJcZQdypOeC5kzi7JDSX.6DQwE1q6KcD1hML.S/.', 'merchant', '+91 98765 43210'),
('u2', 'Priya Patel', 'student@example.com', '$2a$10$jIrrVT8qfrCnjLJcZQdypOeC5kzi7JDSX.6DQwE1q6KcD1hML.S/.', 'student', '+91 87654 32109'),
('u3', 'Anita Desai', 'ngo@example.com', '$2a$10$jIrrVT8qfrCnjLJcZQdypOeC5kzi7JDSX.6DQwE1q6KcD1hML.S/.', 'ngo', '+91 76543 21098'),
('u4', 'Vikram Singh', 'merchant2@example.com', '$2a$10$jIrrVT8qfrCnjLJcZQdypOeC5kzi7JDSX.6DQwE1q6KcD1hML.S/.', 'merchant', '+91 65432 10987'),
('u5', 'Meera Iyer', 'merchant3@example.com', '$2a$10$jIrrVT8qfrCnjLJcZQdypOeC5kzi7JDSX.6DQwE1q6KcD1hML.S/.', 'merchant', '+91 54321 09876');

-- Seed User Stats
INSERT INTO user_stats (user_id, total_money_saved, total_co2_saved_kg, items_rescued, streak_days) VALUES
('u2', 450.00, 25.00, 10, 3),
('u3', 0.00, 75.00, 30, 7);

-- Seed Restaurants (Delhi/NCR locations)
INSERT INTO restaurants (id, owner_id, business_name, address, phone, cuisine_type, description, latitude, longitude, rating, total_reviews) VALUES
('r1', 'u1', 'Sharma Ji Ka Dhaba', 'Sector 18, Noida, UP', '+91 98765 43210', 'North Indian', 'Authentic Punjabi food served with love since 1995. Known for our dal makhani and butter naan.', 28.5707, 77.3219, 4.30, 128),
('r2', 'u1', 'Dilli Darbar Biryani', 'Chandni Chowk, Old Delhi', '+91 98765 43211', 'Mughlai', 'Royal Mughlai cuisine from the lanes of Old Delhi. Our biryani is legendary.', 28.6506, 77.2309, 4.50, 256),
('r3', 'u1', 'South Express', 'Connaught Place, New Delhi', '+91 98765 43212', 'South Indian', 'Crispy dosas, fluffy idlis, and aromatic filter coffee. Taste of South India in the heart of Delhi.', 28.6315, 77.2167, 4.20, 89),
('r4', 'u4', 'Mumbai Tiffins', 'Saket, New Delhi', '+91 65432 10987', 'Street Food', 'Mumbai street food favorites — vada pav, pav bhaji, and cutting chai. Aamchi Mumbai in Delhi!', 28.5244, 77.2066, 4.40, 167),
('r5', 'u4', 'Green Leaf Cafe', 'Hauz Khas Village, New Delhi', '+91 65432 10988', 'Continental & Healthy', 'Organic salads, smoothie bowls, and healthy wraps. Perfect for the health-conscious foodie.', 28.5494, 77.2001, 4.10, 73),
('r6', 'u5', 'Chai & Chaat Corner', 'JNU Campus, New Delhi', '+91 54321 09876', 'Chaat & Snacks', 'Campus favorite for golgappe, aloo tikki, and masala chai. Affordable bites for students!', 28.5402, 77.1662, 4.60, 312);

-- Seed Surplus Listings (Indian dishes with ₹ prices & real image URLs)
INSERT INTO surplus_listings (id, restaurant_id, item_name, description, category, quantity_available, base_price, min_price, original_price, pickup_end_time, image_url) VALUES
('s1', 'r1', 'Dal Makhani Thali', 'Rich & creamy dal makhani with jeera rice, 2 butter naan, raita, and salad. Serves 1.', 'veg', 8, 120.00, 60.00, 250.00, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600'),
('s2', 'r1', 'Paneer Butter Masala Combo', 'Paneer butter masala with tandoori roti and pickle. Fresh and delicious.', 'veg', 5, 150.00, 80.00, 320.00, DATE_ADD(NOW(), INTERVAL 3 HOUR), 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?q=80&w=600'),
('s3', 'r2', 'Chicken Biryani (Full)', 'Aromatic Hyderabadi-style dum biryani with raita and salan. Full portion.', 'non-veg', 6, 180.00, 90.00, 350.00, DATE_ADD(NOW(), INTERVAL 5 HOUR), 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=600'),
('s4', 'r2', 'Mutton Seekh Kebab (6 pcs)', 'Juicy seekh kebabs made with fresh spices. Served with green chutney.', 'non-veg', 4, 200.00, 100.00, 400.00, DATE_ADD(NOW(), INTERVAL 2 HOUR), 'https://images.unsplash.com/photo-1599487405702-008933200ce7?q=80&w=600'),
('s5', 'r3', 'Masala Dosa + Filter Coffee', 'Crispy masala dosa with sambar, chutney, and a cup of authentic filter coffee.', 'veg', 10, 80.00, 40.00, 180.00, DATE_ADD(NOW(), INTERVAL 6 HOUR), 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=600'),
('s6', 'r3', 'Idli Sambar Plate (4 pcs)', 'Soft idlis served with piping hot sambar and coconut chutney.', 'veg', 12, 60.00, 30.00, 140.00, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=600'),
('s7', 'r4', 'Vada Pav Box (3 pcs)', 'Mumbai-style vada pav with spicy dry garlic chutney. Box of 3.', 'veg', 15, 50.00, 25.00, 120.00, DATE_ADD(NOW(), INTERVAL 3 HOUR), 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=600'),
('s8', 'r4', 'Pav Bhaji Family Pack', 'Buttery pav bhaji enough for 3-4 people. Extra butter, extra love!', 'veg', 3, 250.00, 130.00, 500.00, DATE_ADD(NOW(), INTERVAL 5 HOUR), 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=600'),
('s9', 'r5', 'Quinoa Buddha Bowl', 'Quinoa, roasted veggies, hummus, avocado, and tahini dressing. Super healthy!', 'vegan', 6, 200.00, 100.00, 450.00, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600'),
('s10', 'r5', 'Fresh Fruit Smoothie Bowl', 'Acai and mixed berry smoothie bowl topped with granola and chia seeds.', 'vegan', 8, 150.00, 75.00, 350.00, DATE_ADD(NOW(), INTERVAL 2 HOUR), 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?q=80&w=600'),
('s11', 'r6', 'Golgappe Plate (12 pcs)', 'Crispy puris with sweet and spicy pani, aloo filling. Campus favorite!', 'snack', 20, 30.00, 15.00, 80.00, DATE_ADD(NOW(), INTERVAL 6 HOUR), 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600'),
('s12', 'r6', 'Masala Chai + Samosa (2 pcs)', 'Hot masala chai with crispy aloo samosas. Perfect evening snack.', 'snack', 25, 40.00, 20.00, 100.00, DATE_ADD(NOW(), INTERVAL 5 HOUR), 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600'),
('s13', 'r1', 'Gulab Jamun (4 pcs)', 'Soft melt-in-mouth gulab jamuns soaked in warm sugar syrup.', 'dessert', 10, 60.00, 30.00, 150.00, DATE_ADD(NOW(), INTERVAL 3 HOUR), 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?q=80&w=600'),
('s14', 'r6', 'Cold Coffee (Large)', 'Creamy cold coffee with ice cream. Refreshing and filling!', 'beverage', 15, 50.00, 25.00, 120.00, DATE_ADD(NOW(), INTERVAL 4 HOUR), 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=600');
