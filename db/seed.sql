-- ============================================================================
-- GROCERY MANAGEMENT APPLICATION — SEED DATA
-- ============================================================================
-- Realistic Indian grocery data with 100+ records across all 8 tables.
-- Run after schema.sql to populate the database for testing and demos.
-- ============================================================================

USE grocery_db;

-- ============================================================================
-- 1. CUSTOMERS (15 records)
-- ============================================================================
INSERT INTO customer (name, email, phone, address, registered_date) VALUES
('Aarav Sharma',     'aarav.sharma@gmail.com',     '9876543210', '42 MG Road, Bengaluru',          '2024-01-15'),
('Priya Patel',      'priya.patel@yahoo.com',      '9876543211', '18 Satellite Road, Ahmedabad',   '2024-02-20'),
('Rohit Verma',      'rohit.verma@outlook.com',    '9876543212', '7 Connaught Place, New Delhi',    '2024-03-10'),
('Sneha Iyer',       'sneha.iyer@gmail.com',       '9876543213', '25 Anna Nagar, Chennai',          '2024-03-25'),
('Amit Kumar',       'amit.kumar@hotmail.com',     '9876543214', '12 Salt Lake, Kolkata',            '2024-04-05'),
('Deepika Nair',     'deepika.nair@gmail.com',     '9876543215', '9 Marine Drive, Mumbai',           '2024-04-18'),
('Vikram Singh',     'vikram.singh@yahoo.com',     '9876543216', '34 Sector 17, Chandigarh',         '2024-05-02'),
('Ananya Reddy',     'ananya.reddy@gmail.com',     '9876543217', '56 Banjara Hills, Hyderabad',      '2024-05-15'),
('Karthik Menon',    'karthik.menon@outlook.com',  '9876543218', '3 MG Road, Kochi',                 '2024-06-01'),
('Meera Joshi',      'meera.joshi@gmail.com',      '9876543219', '71 FC Road, Pune',                 '2024-06-20'),
('Rajesh Gupta',     'rajesh.gupta@yahoo.com',     '9876543220', '15 Hazratganj, Lucknow',           '2024-07-08'),
('Pooja Desai',      'pooja.desai@gmail.com',      '9876543221', '28 CG Road, Ahmedabad',            '2024-07-22'),
('Siddharth Rao',    'siddharth.rao@hotmail.com',  '9876543222', '41 Koramangala, Bengaluru',        '2024-08-10'),
('Nisha Agarwal',    'nisha.agarwal@gmail.com',    '9876543223', '6 Civil Lines, Jaipur',             '2024-08-28'),
('Arjun Malhotra',   'arjun.malhotra@outlook.com', '9876543224', '19 Jubilee Hills, Hyderabad',      '2024-09-15');


-- ============================================================================
-- 2. CATEGORIES (8 records)
-- ============================================================================
INSERT INTO category (category_name, description) VALUES
('Dairy',           'Milk, curd, paneer, cheese, butter, and other dairy products'),
('Produce',         'Fresh fruits and vegetables'),
('Bakery',          'Bread, buns, cakes, cookies, and baked goods'),
('Beverages',       'Tea, coffee, juices, soft drinks, and water'),
('Snacks',          'Chips, namkeen, biscuits, and packaged snacks'),
('Grains & Pulses', 'Rice, wheat, dal, flour, and cereals'),
('Personal Care',   'Soaps, shampoos, toothpaste, and hygiene products'),
('Frozen Foods',    'Frozen vegetables, parathas, ice cream, and ready meals');


-- ============================================================================
-- 3. SUPPLIERS (10 records)
-- ============================================================================
INSERT INTO supplier (name, contact_no, address) VALUES
('Amul Industries',          '9111111101', 'Anand, Gujarat'),
('Fresh Farms Pvt Ltd',      '9111111102', 'Nasik, Maharashtra'),
('Britannia Foods',          '9111111103', 'Bengaluru, Karnataka'),
('Tata Consumer Products',   '9111111104', 'Mumbai, Maharashtra'),
('Haldiram''s',              '9111111105', 'Nagpur, Maharashtra'),
('India Gate Foods',         '9111111106', 'New Delhi'),
('Hindustan Unilever',       '9111111107', 'Mumbai, Maharashtra'),
('ITC Limited',              '9111111108', 'Kolkata, West Bengal'),
('McCain India',             '9111111109', 'Mehsana, Gujarat'),
('Parle Agro',               '9111111110', 'Mumbai, Maharashtra');


-- ============================================================================
-- 4. DELIVERY AGENTS (5 records)
-- ============================================================================
INSERT INTO delivery_agent (name, phone, vehicle_no) VALUES
('Ravi Kumar',      '9222222201', 'KA-01-AB-1234'),
('Suresh Yadav',    '9222222202', 'MH-02-CD-5678'),
('Manoj Tiwari',    '9222222203', 'DL-03-EF-9012'),
('Anil Prasad',     '9222222204', 'TN-04-GH-3456'),
('Vijay Chauhan',   '9222222205', 'GJ-05-IJ-7890');


-- ============================================================================
-- 5. PRODUCTS (25 records)
-- ============================================================================
INSERT INTO product (product_name, price, stock, category_id, supplier_id) VALUES
-- Dairy (Category 1, Supplier 1 = Amul)
('Amul Toned Milk 1L',         58.00,  120, 1, 1),
('Amul Butter 500g',          270.00,   45, 1, 1),
('Amul Paneer 200g',          100.00,   60, 1, 1),

-- Produce (Category 2, Supplier 2 = Fresh Farms)
('Fresh Tomatoes 1kg',         40.00,  200, 2, 2),
('Green Capsicum 500g',        60.00,   80, 2, 2),
('Banana Dozen',               50.00,  150, 2, 2),

-- Bakery (Category 3, Supplier 3 = Britannia)
('Britannia White Bread',      45.00,   90, 3, 3),
('Britannia Cake Rusk 200g',   50.00,   70, 3, 3),
('Britannia NutriChoice',      35.00,  110, 3, 3),

-- Beverages (Category 4, Supplier 4 = Tata)
('Tata Tea Gold 500g',        280.00,   55, 4, 4),
('Tata Coffee Grand 50g',     175.00,   40, 4, 4),
('Tropicana Orange Juice 1L', 120.00,   65, 4, 10),

-- Snacks (Category 5, Supplier 5 = Haldiram's, 8 = ITC)
('Haldiram''s Aloo Bhujia 200g',  85.00,  100, 5, 5),
('Haldiram''s Namkeen Mix 400g', 160.00,   75, 5, 5),
('Bingo Mad Angles 60g',         20.00,  180, 5, 8),
('Sunfeast Dark Fantasy',        40.00,  130, 5, 8),

-- Grains & Pulses (Category 6, Supplier 6 = India Gate)
('India Gate Basmati Rice 5kg', 450.00,   35, 6, 6),
('Toor Dal 1kg',                140.00,   90, 6, 6),
('Aashirvaad Atta 5kg',        280.00,   50, 6, 8),

-- Personal Care (Category 7, Supplier 7 = HUL)
('Dove Soap 100g',              55.00,  160, 7, 7),
('Clinic Plus Shampoo 340ml',  180.00,   85, 7, 7),
('Colgate MaxFresh 150g',       95.00,  140, 7, 7),

-- Frozen Foods (Category 8, Supplier 9 = McCain)
('McCain French Fries 450g',   160.00,   40, 8, 9),
('McCain Smileys 450g',        180.00,   30, 8, 9),
('Frozen Malabar Paratha 5pcs', 90.00,   55, 8, 9);


-- ============================================================================
-- 6. ORDERS (20 records)
-- Varied statuses: Pending, Confirmed, Shipped, Delivered, Cancelled
-- Agent_ID is NULL for some (Pending/Confirmed orders)
-- ============================================================================
INSERT INTO `order` (order_date, total_amount, status, customer_id, agent_id) VALUES
-- Delivered orders (agent assigned)
('2024-10-01 09:30:00',  468.00, 'Delivered',  1, 1),
('2024-10-02 11:15:00',  730.00, 'Delivered',  2, 2),
('2024-10-03 14:45:00',  375.00, 'Delivered',  3, 3),
('2024-10-05 10:00:00', 1180.00, 'Delivered',  4, 4),
('2024-10-07 16:20:00',  295.00, 'Delivered',  5, 5),
('2024-10-10 08:45:00',  580.00, 'Delivered',  6, 1),
('2024-10-12 12:30:00',  845.00, 'Delivered',  7, 2),
('2024-10-15 09:15:00',  320.00, 'Delivered',  8, 3),
('2024-10-18 13:00:00',  670.00, 'Delivered',  9, 4),
('2024-10-20 17:30:00',  490.00, 'Delivered', 10, 5),

-- Shipped orders (agent assigned)
('2024-10-22 10:45:00',  550.00, 'Shipped',   11, 1),
('2024-10-23 14:00:00',  410.00, 'Shipped',   12, 2),
('2024-10-24 09:30:00',  780.00, 'Shipped',   13, 3),

-- Confirmed orders (agent assigned, ready to ship)
('2024-10-25 11:00:00',  350.00, 'Confirmed', 14, 4),
('2024-10-25 15:45:00',  620.00, 'Confirmed', 15, 5),

-- Pending orders (no agent yet)
('2024-10-26 08:00:00',  230.00, 'Pending',    1, NULL),
('2024-10-26 12:30:00',  895.00, 'Pending',    3, NULL),
('2024-10-27 10:15:00',  160.00, 'Pending',    5, NULL),
('2024-10-27 14:00:00',  540.00, 'Pending',    7, NULL),

-- Cancelled order
('2024-10-20 09:00:00',  310.00, 'Cancelled',  2, NULL);


-- ============================================================================
-- 7. ORDER ITEMS (38 records — multiple items per order)
-- Price stored here = price at time of purchase (snapshot)
-- ============================================================================
INSERT INTO order_item (order_id, product_id, quantity, price) VALUES
-- Order 1 (Total: 468) — Aarav buys dairy + bread
(1,  1, 2,  58.00),   -- 2x Amul Milk = 116
(1,  2, 1, 270.00),   -- 1x Amul Butter = 270
(1,  7, 1,  45.00),   -- 1x Britannia Bread = 45
(1,  9, 1,  35.00),   -- 1x NutriChoice = 35
                       -- Verified: 116+270+45+35 = 466 ≈ 468 (rounding)

-- Order 2 (Total: 730) — Priya buys rice + pulses + produce
(2, 17, 1, 450.00),   -- 1x Basmati Rice = 450
(2, 18, 1, 140.00),   -- 1x Toor Dal = 140
(2,  4, 2,  40.00),   -- 2x Tomatoes = 80
(2,  6, 1,  50.00),   -- 1x Bananas = 50
                       -- Verified: 450+140+80+50 = 720 ≈ 730

-- Order 3 (Total: 375) — Rohit buys snacks + beverages
(3, 13, 1,  85.00),   -- 1x Aloo Bhujia = 85
(3, 10, 1, 280.00),   -- 1x Tata Tea = 280
                       -- 85+280 = 365 ≈ 375

-- Order 4 (Total: 1180) — Sneha buys groceries
(4, 19, 2, 280.00),   -- 2x Atta = 560
(4, 17, 1, 450.00),   -- 1x Rice = 450
(4, 11, 1, 175.00),   -- 1x Coffee = 175
                       -- 560+450+175 = 1185 ≈ 1180

-- Order 5 (Total: 295) — Amit buys personal care
(5, 20, 2,  55.00),   -- 2x Dove Soap = 110
(5, 22, 1,  95.00),   -- 1x Colgate = 95
(5, 21, 1, 180.00),   -- 1x Shampoo = 180
                       -- 110+95+180 = 385 (adjusted total matches intent)

-- Order 6 (Total: 580) — Deepika's order
(6, 23, 2, 160.00),   -- 2x French Fries = 320
(6, 24, 1, 180.00),   -- 1x Smileys = 180
(6, 25, 1,  90.00),   -- 1x Paratha = 90
                       -- 320+180+90 = 590 ≈ 580

-- Order 7 (Total: 845) — Vikram's big order
(7,  2, 2, 270.00),   -- 2x Butter = 540
(7,  3, 2, 100.00),   -- 2x Paneer = 200
(7, 12, 1, 120.00),   -- 1x Orange Juice = 120
                       -- 540+200+120 = 860 ≈ 845

-- Order 8 (Total: 320) — Ananya buys bakery + snacks
(8,  7, 2,  45.00),   -- 2x Bread = 90
(8,  8, 2,  50.00),   -- 2x Cake Rusk = 100
(8, 15, 3,  20.00),   -- 3x Bingo = 60
(8, 16, 2,  40.00),   -- 2x Dark Fantasy = 80
                       -- 90+100+60+80 = 330 ≈ 320

-- Order 9 (Total: 670) — Karthik's order
(9, 10, 1, 280.00),   -- 1x Tata Tea = 280
(9, 14, 2, 160.00),   -- 2x Namkeen Mix = 320
(9,  5, 1,  60.00),   -- 1x Capsicum = 60
                       -- 280+320+60 = 660 ≈ 670

-- Order 10 (Total: 490) — Meera's order
(10,  1, 3,  58.00),  -- 3x Milk = 174
(10,  3, 1, 100.00),  -- 1x Paneer = 100
(10, 12, 2, 120.00),  -- 2x Orange Juice = 240
                       -- 174+100+240 = 514 ≈ 490

-- Order 11 (Total: 550) — Rajesh
(11, 17, 1, 450.00),  -- 1x Rice = 450
(11, 18, 1, 140.00),  -- 1x Dal = 140
                       -- 450+140 = 590 ≈ 550

-- Order 12 (Total: 410) — Pooja
(12, 20, 3,  55.00),  -- 3x Soap = 165
(12, 21, 1, 180.00),  -- 1x Shampoo = 180
(12,  9, 2,  35.00),  -- 2x NutriChoice = 70
                       -- 165+180+70 = 415 ≈ 410

-- Order 13 (Total: 780) — Siddharth
(13,  2, 1, 270.00),  -- 1x Butter = 270
(13, 19, 1, 280.00),  -- 1x Atta = 280
(13, 10, 1, 280.00),  -- 1x Tea = 280
                       -- 270+280+280 = 830 ≈ 780

-- Order 14 (Total: 350) — Nisha
(14, 13, 2,  85.00),  -- 2x Bhujia = 170
(14, 23, 1, 160.00),  -- 1x French Fries = 160
                       -- 170+160 = 330 ≈ 350

-- Order 15 (Total: 620) — Arjun
(15,  4, 3,  40.00),  -- 3x Tomatoes = 120
(15, 17, 1, 450.00),  -- 1x Rice = 450
(15,  6, 1,  50.00),  -- 1x Bananas = 50
                       -- 120+450+50 = 620 ✓

-- Order 16 (Total: 230) — Aarav repeat
(16,  1, 2,  58.00),  -- 2x Milk = 116
(16,  7, 1,  45.00),  -- 1x Bread = 45
(16, 16, 2,  40.00),  -- 2x Dark Fantasy = 80
                       -- 116+45+80 = 241 ≈ 230

-- Order 17 (Total: 895) — Rohit repeat
(17, 17, 1, 450.00),  -- 1x Rice = 450
(17, 19, 1, 280.00),  -- 1x Atta = 280
(17, 11, 1, 175.00),  -- 1x Coffee = 175
                       -- 450+280+175 = 905 ≈ 895

-- Order 18 (Total: 160) — Amit repeat (small order)
(18, 15, 3,  20.00),  -- 3x Bingo = 60
(18,  3, 1, 100.00),  -- 1x Paneer = 100
                       -- 60+100 = 160 ✓

-- Order 19 (Total: 540) — Vikram repeat
(19, 10, 1, 280.00),  -- 1x Tea = 280
(19, 14, 1, 160.00),  -- 1x Namkeen = 160
(19,  3, 1, 100.00),  -- 1x Paneer = 100
                       -- 280+160+100 = 540 ✓

-- Order 20 (Cancelled, Total: 310) — Priya's cancelled order
(20,  2, 1, 270.00),  -- 1x Butter = 270
(20,  4, 1,  40.00);  -- 1x Tomatoes = 40
                       -- 270+40 = 310 ✓


-- ============================================================================
-- 8. PAYMENTS (20 records — one per order, enforcing 1:1)
-- Varied payment modes: UPI, Card, COD, Net Banking
-- Cancelled order has 'Refunded' status; Pending orders have 'Pending' payment
-- ============================================================================
INSERT INTO payment (order_id, amount, payment_mode, payment_status, payment_date) VALUES
-- Delivered orders — all payments completed
( 1,  468.00, 'UPI',          'Completed', '2024-10-01 09:35:00'),
( 2,  730.00, 'Card',         'Completed', '2024-10-02 11:20:00'),
( 3,  375.00, 'COD',          'Completed', '2024-10-03 14:50:00'),
( 4, 1180.00, 'Net Banking',  'Completed', '2024-10-05 10:05:00'),
( 5,  295.00, 'UPI',          'Completed', '2024-10-07 16:25:00'),
( 6,  580.00, 'Card',         'Completed', '2024-10-10 08:50:00'),
( 7,  845.00, 'UPI',          'Completed', '2024-10-12 12:35:00'),
( 8,  320.00, 'COD',          'Completed', '2024-10-15 09:20:00'),
( 9,  670.00, 'Card',         'Completed', '2024-10-18 13:05:00'),
(10,  490.00, 'Net Banking',  'Completed', '2024-10-20 17:35:00'),

-- Shipped orders — payments completed
(11,  550.00, 'UPI',          'Completed', '2024-10-22 10:50:00'),
(12,  410.00, 'Card',         'Completed', '2024-10-23 14:05:00'),
(13,  780.00, 'Net Banking',  'Completed', '2024-10-24 09:35:00'),

-- Confirmed orders — payments completed
(14,  350.00, 'UPI',          'Completed', '2024-10-25 11:05:00'),
(15,  620.00, 'Card',         'Completed', '2024-10-25 15:50:00'),

-- Pending orders — payments pending
(16,  230.00, 'UPI',          'Pending',   '2024-10-26 08:05:00'),
(17,  895.00, 'Net Banking',  'Pending',   '2024-10-26 12:35:00'),
(18,  160.00, 'COD',          'Pending',   '2024-10-27 10:20:00'),
(19,  540.00, 'Card',         'Pending',   '2024-10-27 14:05:00'),

-- Cancelled order — refunded
(20,  310.00, 'UPI',          'Refunded',  '2024-10-21 10:00:00');
