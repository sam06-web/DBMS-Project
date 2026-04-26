-- ============================================================
-- Insurance Policy Management System — Advanced SQL Queries
-- ============================================================
USE insurance_db;

-- ============================================================
-- A. BASIC CRUD OPERATIONS
-- ============================================================

-- A1. INSERT a new customer
INSERT INTO Customer (name, age, gender, phone, email, address)
VALUES ('Neha Desai', 29, 'Female', '9876543217', 'neha.desai@email.com', '10 FC Road, Pune');

-- A2. UPDATE customer phone number
UPDATE Customer SET phone = '9999999999' WHERE customer_id = 1;

-- A3. DELETE a claim
DELETE FROM Claim WHERE claim_id = 4;

-- A4. SELECT all active policies
SELECT * FROM Policy WHERE status = 'Active';

-- ============================================================
-- B. JOIN QUERIES
-- ============================================================

-- B1. Get full policy details (Customer + Plan + Agent)
SELECT
    p.policy_id,
    c.name AS customer_name,
    ip.plan_name,
    ip.plan_type,
    ip.coverage_amount,
    a.name AS agent_name,
    p.start_date,
    p.end_date,
    p.status
FROM Policy p
JOIN Customer c        ON p.customer_id = c.customer_id
JOIN Insurance_Plan ip ON p.plan_id     = ip.plan_id
JOIN Agent a           ON p.agent_id    = a.agent_id;

-- B2. Get all payments with customer and plan info
SELECT
    pay.payment_id,
    c.name AS customer_name,
    ip.plan_name,
    pay.amount,
    pay.payment_date,
    pay.payment_mode
FROM Payment pay
JOIN Policy p          ON pay.policy_id  = p.policy_id
JOIN Customer c        ON p.customer_id  = c.customer_id
JOIN Insurance_Plan ip ON p.plan_id      = ip.plan_id;

-- B3. Get all claims with customer and policy info
SELECT
    cl.claim_id,
    c.name AS customer_name,
    ip.plan_name,
    cl.claim_amount,
    cl.claim_date,
    cl.status AS claim_status
FROM Claim cl
JOIN Policy p          ON cl.policy_id  = p.policy_id
JOIN Customer c        ON p.customer_id = c.customer_id
JOIN Insurance_Plan ip ON p.plan_id     = ip.plan_id;

-- B4. Get nominee details with policy and customer info
SELECT
    n.nominee_id,
    n.name AS nominee_name,
    n.relation,
    c.name AS customer_name,
    ip.plan_name,
    p.policy_id
FROM Nominee n
JOIN Policy p          ON n.policy_id   = p.policy_id
JOIN Customer c        ON p.customer_id = c.customer_id
JOIN Insurance_Plan ip ON p.plan_id     = ip.plan_id;

-- ============================================================
-- C. AGGREGATE FUNCTIONS
-- ============================================================

-- C1. Total payment collected per policy
SELECT
    p.policy_id,
    c.name AS customer_name,
    ip.plan_name,
    COUNT(pay.payment_id) AS total_payments,
    SUM(pay.amount)       AS total_amount_paid
FROM Policy p
JOIN Customer c        ON p.customer_id  = c.customer_id
JOIN Insurance_Plan ip ON p.plan_id      = ip.plan_id
LEFT JOIN Payment pay  ON p.policy_id    = pay.policy_id
GROUP BY p.policy_id, c.name, ip.plan_name;

-- C2. Number of policies per agent
SELECT
    a.agent_id,
    a.name AS agent_name,
    COUNT(p.policy_id) AS total_policies
FROM Agent a
LEFT JOIN Policy p ON a.agent_id = p.agent_id
GROUP BY a.agent_id, a.name;

-- C3. Total claims amount by status
SELECT
    status,
    COUNT(*) AS num_claims,
    SUM(claim_amount) AS total_claim_amount
FROM Claim
GROUP BY status;

-- C4. Average premium per plan type
SELECT
    plan_type,
    COUNT(*)          AS num_plans,
    AVG(premium)      AS avg_premium,
    AVG(coverage_amount) AS avg_coverage
FROM Insurance_Plan
GROUP BY plan_type;

-- C5. Total commission earned by each agent
SELECT
    a.agent_id,
    a.name AS agent_name,
    a.commission AS commission_pct,
    COUNT(p.policy_id) AS policies_sold,
    SUM(ip.premium * a.commission / 100) AS total_commission_earned
FROM Agent a
JOIN Policy p          ON a.agent_id = p.agent_id
JOIN Insurance_Plan ip ON p.plan_id  = ip.plan_id
GROUP BY a.agent_id, a.name, a.commission;

-- ============================================================
-- D. SUBQUERIES AND NESTED QUERIES
-- ============================================================

-- D1. Customers who have at least one active policy
SELECT * FROM Customer
WHERE customer_id IN (
    SELECT DISTINCT customer_id FROM Policy WHERE status = 'Active'
);

-- D2. Policies with total payment exceeding the plan premium
SELECT p.policy_id, c.name AS customer_name, ip.plan_name, ip.premium,
    (SELECT SUM(amount) FROM Payment WHERE policy_id = p.policy_id) AS total_paid
FROM Policy p
JOIN Customer c        ON p.customer_id = c.customer_id
JOIN Insurance_Plan ip ON p.plan_id     = ip.plan_id
WHERE (SELECT SUM(amount) FROM Payment WHERE policy_id = p.policy_id) > ip.premium;

-- D3. Agents who have sold policies with coverage above average
SELECT DISTINCT a.agent_id, a.name
FROM Agent a
JOIN Policy p          ON a.agent_id = p.agent_id
JOIN Insurance_Plan ip ON p.plan_id  = ip.plan_id
WHERE ip.coverage_amount > (SELECT AVG(coverage_amount) FROM Insurance_Plan);

-- D4. Customers who have never filed a claim
SELECT * FROM Customer
WHERE customer_id NOT IN (
    SELECT DISTINCT p.customer_id
    FROM Policy p
    JOIN Claim cl ON p.policy_id = cl.policy_id
);

-- D5. Plan with the highest total claims
SELECT ip.plan_name, SUM(cl.claim_amount) AS total_claims
FROM Claim cl
JOIN Policy p          ON cl.policy_id = p.policy_id
JOIN Insurance_Plan ip ON p.plan_id    = ip.plan_id
GROUP BY ip.plan_name
ORDER BY total_claims DESC
LIMIT 1;

-- ============================================================
-- E. USING THE VIEW
-- ============================================================

-- E1. Select all records from the Policy Details View
SELECT * FROM Policy_Details_View;

-- E2. Filter view by policy status
SELECT * FROM Policy_Details_View WHERE policy_status = 'Active';

-- E3. Filter view by plan type
SELECT * FROM Policy_Details_View WHERE plan_type = 'Health';
