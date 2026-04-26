-- ============================================================
-- Insurance Policy Management System — Sample Data
-- ============================================================
USE insurance_db;

-- ============================================================
-- CUSTOMERS
-- ============================================================
INSERT INTO Customer (name, age, gender, phone, email, address) VALUES
('Rahul Sharma',    30, 'Male',   '9876543210', 'rahul.sharma@email.com',    '12 MG Road, Mumbai'),
('Priya Patel',     28, 'Female', '9876543211', 'priya.patel@email.com',     '45 Park Street, Delhi'),
('Amit Kumar',      35, 'Male',   '9876543212', 'amit.kumar@email.com',      '78 Lake View, Bangalore'),
('Sneha Reddy',     26, 'Female', '9876543213', 'sneha.reddy@email.com',     '23 Jubilee Hills, Hyderabad'),
('Vikram Singh',    40, 'Male',   '9876543214', 'vikram.singh@email.com',    '56 Civil Lines, Jaipur'),
('Ananya Gupta',    32, 'Female', '9876543215', 'ananya.gupta@email.com',    '89 Sector 15, Noida'),
('Rajesh Nair',     45, 'Male',   '9876543216', 'rajesh.nair@email.com',     '34 Marine Drive, Kochi');

-- ============================================================
-- INSURANCE PLANS
-- ============================================================
INSERT INTO Insurance_Plan (plan_name, plan_type, coverage_amount, premium, duration) VALUES
('LifeSecure Basic',     'Life',     500000.00,  5000.00,  120),
('LifeSecure Premium',   'Life',     2000000.00, 15000.00, 240),
('HealthGuard Silver',   'Health',   300000.00,  3000.00,  12),
('HealthGuard Gold',     'Health',   1000000.00, 8000.00,  12),
('AutoShield Standard',  'Vehicle',  200000.00,  2500.00,  12),
('PropertySafe Plus',    'Property', 5000000.00, 20000.00, 60),
('TravelEasy Annual',    'Travel',   100000.00,  1500.00,  12);

-- ============================================================
-- AGENTS
-- ============================================================
INSERT INTO Agent (name, phone, commission) VALUES
('Deepak Verma',   '9988776601', 5.00),
('Sunita Joshi',   '9988776602', 7.50),
('Manoj Tiwari',   '9988776603', 6.00),
('Kavitha Menon',  '9988776604', 8.00),
('Arjun Rao',      '9988776605', 5.50);

-- ============================================================
-- POLICIES
-- ============================================================
INSERT INTO Policy (customer_id, plan_id, agent_id, start_date, end_date, status) VALUES
(1, 1, 1, '2024-01-15', '2034-01-15', 'Active'),
(2, 3, 2, '2024-03-01', '2025-03-01', 'Active'),
(3, 2, 1, '2023-06-10', '2043-06-10', 'Active'),
(4, 5, 3, '2024-02-20', '2025-02-20', 'Active'),
(5, 6, 4, '2023-01-01', '2028-01-01', 'Active'),
(1, 4, 2, '2024-05-10', '2025-05-10', 'Active'),
(6, 7, 5, '2024-04-01', '2025-04-01', 'Active'),
(7, 1, 3, '2022-01-01', '2032-01-01', 'Active'),
(2, 5, 4, '2023-07-15', '2024-07-15', 'Expired');

-- ============================================================
-- NOMINEES
-- ============================================================
INSERT INTO Nominee (policy_id, name, relation) VALUES
(1, 'Meena Sharma',   'Wife'),
(2, 'Raj Patel',      'Father'),
(3, 'Sunita Kumar',   'Wife'),
(4, 'Ramesh Reddy',   'Father'),
(5, 'Geeta Singh',    'Wife'),
(6, 'Rahul Sharma',   'Self'),
(7, 'Ravi Gupta',     'Husband'),
(8, 'Lakshmi Nair',   'Wife');

-- ============================================================
-- PAYMENTS
-- ============================================================
INSERT INTO Payment (policy_id, amount, payment_date, payment_mode) VALUES
(1, 5000.00,  '2024-01-15', 'UPI'),
(1, 5000.00,  '2024-07-15', 'Net Banking'),
(2, 3000.00,  '2024-03-01', 'Credit Card'),
(3, 15000.00, '2023-06-10', 'Debit Card'),
(4, 2500.00,  '2024-02-20', 'Cash'),
(5, 20000.00, '2023-01-01', 'Net Banking'),
(6, 8000.00,  '2024-05-10', 'UPI'),
(7, 1500.00,  '2024-04-01', 'Credit Card'),
(8, 5000.00,  '2022-01-01', 'Cash'),
(9, 2500.00,  '2023-07-15', 'UPI');

-- ============================================================
-- CLAIMS
-- ============================================================
INSERT INTO Claim (policy_id, claim_amount, claim_date, status) VALUES
(2, 50000.00,  '2024-08-15', 'Approved'),
(4, 30000.00,  '2024-09-01', 'Pending'),
(5, 100000.00, '2024-06-20', 'Approved'),
(9, 15000.00,  '2024-05-10', 'Rejected'),
(3, 200000.00, '2024-10-05', 'Pending');
