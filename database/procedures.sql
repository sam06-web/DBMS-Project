-- ============================================================
-- Insurance Policy Management System — Stored Procedures,
-- Transactions, and Cursor Demonstrations
-- ============================================================
USE insurance_db;

-- ============================================================
-- STORED PROCEDURE 1: RegisterNewPolicy
-- Creates a new policy and records the first premium payment
-- atomically using a TRANSACTION.
-- ============================================================
DELIMITER $$
CREATE PROCEDURE RegisterNewPolicy(
    IN p_customer_id INT,
    IN p_plan_id INT,
    IN p_agent_id INT,
    IN p_start_date DATE,
    IN p_payment_mode ENUM('Cash','Credit Card','Debit Card','UPI','Net Banking')
)
BEGIN
    DECLARE v_policy_id INT;
    DECLARE v_premium DECIMAL(10,2);
    DECLARE v_duration INT;
    DECLARE v_end_date DATE;

    -- Get plan details
    SELECT premium, duration INTO v_premium, v_duration
    FROM Insurance_Plan WHERE plan_id = p_plan_id;

    SET v_end_date = DATE_ADD(p_start_date, INTERVAL v_duration MONTH);

    -- BEGIN TRANSACTION
    START TRANSACTION;

    -- Step 1: Insert the policy
    INSERT INTO Policy (customer_id, plan_id, agent_id, start_date, end_date, status)
    VALUES (p_customer_id, p_plan_id, p_agent_id, p_start_date, v_end_date, 'Active');

    SET v_policy_id = LAST_INSERT_ID();

    -- Step 2: Record the first premium payment
    INSERT INTO Payment (policy_id, amount, payment_date, payment_mode)
    VALUES (v_policy_id, v_premium, p_start_date, p_payment_mode);

    -- COMMIT — both inserts succeed or neither does
    COMMIT;

    SELECT v_policy_id AS new_policy_id, v_premium AS first_payment, v_end_date AS end_date;
END$$
DELIMITER ;

-- ============================================================
-- STORED PROCEDURE 2: ProcessClaim
-- Approves or rejects a claim after validating the policy
-- is active and the claim amount does not exceed coverage.
-- ============================================================
DELIMITER $$
CREATE PROCEDURE ProcessClaim(
    IN p_claim_id INT,
    IN p_new_status ENUM('Approved','Rejected')
)
BEGIN
    DECLARE v_policy_status ENUM('Active','Expired','Cancelled');
    DECLARE v_claim_amount DECIMAL(12,2);
    DECLARE v_coverage DECIMAL(12,2);
    DECLARE v_policy_id INT;

    -- Get claim details
    SELECT cl.policy_id, cl.claim_amount, p.status, ip.coverage_amount
    INTO v_policy_id, v_claim_amount, v_policy_status, v_coverage
    FROM Claim cl
    JOIN Policy p ON cl.policy_id = p.policy_id
    JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
    WHERE cl.claim_id = p_claim_id;

    -- Validation
    IF v_policy_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Claim not found';
    END IF;

    IF v_policy_status != 'Active' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Policy is not active — cannot process claim';
    END IF;

    IF p_new_status = 'Approved' AND v_claim_amount > v_coverage THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Claim amount exceeds coverage — cannot approve';
    END IF;

    -- BEGIN TRANSACTION
    START TRANSACTION;

    UPDATE Claim SET status = p_new_status WHERE claim_id = p_claim_id;

    COMMIT;

    SELECT p_claim_id AS claim_id, p_new_status AS new_status, 'Processed successfully' AS result;
END$$
DELIMITER ;

-- ============================================================
-- STORED PROCEDURE 3: GetCustomerSummary
-- Returns a comprehensive summary for a given customer
-- using JOINs and aggregate functions.
-- ============================================================
DELIMITER $$
CREATE PROCEDURE GetCustomerSummary(
    IN p_customer_id INT
)
BEGIN
    -- Customer basic info
    SELECT c.customer_id, c.name, c.age, c.gender, c.phone, c.email, c.address,
           COUNT(DISTINCT p.policy_id) AS total_policies,
           SUM(CASE WHEN p.status = 'Active' THEN 1 ELSE 0 END) AS active_policies,
           COALESCE(SUM(pay.amount), 0) AS total_amount_paid,
           (SELECT COUNT(*) FROM Claim cl2
            JOIN Policy p2 ON cl2.policy_id = p2.policy_id
            WHERE p2.customer_id = p_customer_id) AS total_claims
    FROM Customer c
    LEFT JOIN Policy p ON c.customer_id = p.customer_id
    LEFT JOIN Payment pay ON p.policy_id = pay.policy_id
    WHERE c.customer_id = p_customer_id
    GROUP BY c.customer_id, c.name, c.age, c.gender, c.phone, c.email, c.address;
END$$
DELIMITER ;

-- ============================================================
-- DEMO CALLS FOR STORED PROCEDURES
-- ============================================================

-- Demo: Register a new policy for customer 1, plan 3, agent 2
-- CALL RegisterNewPolicy(1, 3, 2, '2025-01-01', 'UPI');

-- Demo: Process (approve) claim #2
-- CALL ProcessClaim(2, 'Approved');

-- Demo: Get summary for customer 1
-- CALL GetCustomerSummary(1);


-- ============================================================
-- TRANSACTION DEMONSTRATION
-- Shows BEGIN, SAVEPOINT, ROLLBACK TO SAVEPOINT, and COMMIT
-- ============================================================

-- Uncomment to run this demonstration:
/*
START TRANSACTION;

-- Insert a test customer
INSERT INTO Customer (name, age, gender, phone, email, address)
VALUES ('Test User', 25, 'Male', '0000000000', 'test@demo.com', 'Test Address');

-- Create a savepoint after customer insert
SAVEPOINT after_customer;

-- Insert a test agent
INSERT INTO Agent (name, phone, commission)
VALUES ('Test Agent', '0000000001', 10.00);

-- Oops, we don't want the agent — rollback to savepoint
ROLLBACK TO SAVEPOINT after_customer;
-- The agent insert is undone, but the customer insert is preserved

-- Commit the transaction — only the customer is saved
COMMIT;

-- Verify: customer exists, agent does not
SELECT * FROM Customer WHERE email = 'test@demo.com';
SELECT * FROM Agent WHERE phone = '0000000001';

-- Clean up
DELETE FROM Customer WHERE email = 'test@demo.com';
*/


-- ============================================================
-- CURSOR DEMONSTRATION
-- Loops through all policies and prints details of expired ones.
-- Demonstrates DECLARE CURSOR, OPEN, FETCH, CLOSE.
-- ============================================================
DELIMITER $$
CREATE PROCEDURE DemoExpiredPolicyCursor()
BEGIN
    DECLARE v_done INT DEFAULT 0;
    DECLARE v_policy_id INT;
    DECLARE v_customer_name VARCHAR(100);
    DECLARE v_plan_name VARCHAR(100);
    DECLARE v_end_date DATE;
    DECLARE v_status ENUM('Active','Expired','Cancelled');

    -- Declare cursor for all policies
    DECLARE policy_cursor CURSOR FOR
        SELECT p.policy_id, c.name, ip.plan_name, p.end_date, p.status
        FROM Policy p
        JOIN Customer c ON p.customer_id = c.customer_id
        JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id;

    -- Handler for end of cursor
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

    -- Temporary table to store results
    DROP TEMPORARY TABLE IF EXISTS expired_policy_report;
    CREATE TEMPORARY TABLE expired_policy_report (
        policy_id INT,
        customer_name VARCHAR(100),
        plan_name VARCHAR(100),
        end_date DATE,
        status VARCHAR(20),
        days_since_expiry INT
    );

    -- Open cursor
    OPEN policy_cursor;

    read_loop: LOOP
        FETCH policy_cursor INTO v_policy_id, v_customer_name, v_plan_name, v_end_date, v_status;
        IF v_done THEN
            LEAVE read_loop;
        END IF;

        -- Only record expired or past-end-date policies
        IF v_status = 'Expired' OR v_end_date < CURDATE() THEN
            INSERT INTO expired_policy_report VALUES (
                v_policy_id, v_customer_name, v_plan_name, v_end_date, v_status,
                DATEDIFF(CURDATE(), v_end_date)
            );
        END IF;
    END LOOP;

    -- Close cursor
    CLOSE policy_cursor;

    -- Return results
    SELECT * FROM expired_policy_report ORDER BY days_since_expiry DESC;

    DROP TEMPORARY TABLE IF EXISTS expired_policy_report;
END$$
DELIMITER ;

-- Demo: Run the cursor procedure
-- CALL DemoExpiredPolicyCursor();
