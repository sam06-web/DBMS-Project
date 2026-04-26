-- ============================================================
-- Insurance Policy Management System — Database Schema
-- ============================================================
-- Removed hardcoded database for cloud deployment
-- ============================================================
-- 1. CUSTOMER TABLE
-- ============================================================
CREATE TABLE Customer (
    customer_id   INT           AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    age           INT           NOT NULL CHECK (age >= 18),
    gender        ENUM('Male','Female','Other') NOT NULL,
    phone         VARCHAR(15)   NOT NULL,
    email         VARCHAR(100)  NOT NULL UNIQUE,
    address       VARCHAR(255)  NOT NULL
);

-- ============================================================
-- 2. INSURANCE PLAN TABLE
-- ============================================================
CREATE TABLE Insurance_Plan (
    plan_id         INT             AUTO_INCREMENT PRIMARY KEY,
    plan_name       VARCHAR(100)    NOT NULL,
    plan_type       ENUM('Life','Health','Vehicle','Property','Travel') NOT NULL,
    coverage_amount DECIMAL(12,2)   NOT NULL,
    premium         DECIMAL(10,2)   NOT NULL,
    duration        INT             NOT NULL COMMENT 'Duration in months'
);

-- ============================================================
-- 3. AGENT TABLE
-- ============================================================
CREATE TABLE Agent (
    agent_id    INT             AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    phone       VARCHAR(15)     NOT NULL,
    commission  DECIMAL(5,2)    NOT NULL DEFAULT 5.00 COMMENT 'Commission percentage'
);

-- ============================================================
-- 4. POLICY TABLE (MAIN TABLE)
-- ============================================================
CREATE TABLE Policy (
    policy_id    INT       AUTO_INCREMENT PRIMARY KEY,
    customer_id  INT       NOT NULL,
    plan_id      INT       NOT NULL,
    agent_id     INT       NOT NULL,
    start_date   DATE      NOT NULL,
    end_date     DATE      NOT NULL,
    status       ENUM('Active','Expired','Cancelled') NOT NULL DEFAULT 'Active',

    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)     ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (plan_id)     REFERENCES Insurance_Plan(plan_id)   ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (agent_id)    REFERENCES Agent(agent_id)           ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================
-- 5. NOMINEE TABLE
-- ============================================================
CREATE TABLE Nominee (
    nominee_id  INT           AUTO_INCREMENT PRIMARY KEY,
    policy_id   INT           NOT NULL,
    name        VARCHAR(100)  NOT NULL,
    relation    VARCHAR(50)   NOT NULL,

    FOREIGN KEY (policy_id) REFERENCES Policy(policy_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 6. PAYMENT TABLE
-- ============================================================
CREATE TABLE Payment (
    payment_id    INT           AUTO_INCREMENT PRIMARY KEY,
    policy_id     INT           NOT NULL,
    amount        DECIMAL(10,2) NOT NULL,
    payment_date  DATE          NOT NULL,
    payment_mode  ENUM('Cash','Credit Card','Debit Card','UPI','Net Banking') NOT NULL DEFAULT 'Cash',

    FOREIGN KEY (policy_id) REFERENCES Policy(policy_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- 7. CLAIM TABLE
-- ============================================================
CREATE TABLE Claim (
    claim_id      INT             AUTO_INCREMENT PRIMARY KEY,
    policy_id     INT             NOT NULL,
    claim_amount  DECIMAL(12,2)   NOT NULL,
    claim_date    DATE            NOT NULL,
    status        ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',

    FOREIGN KEY (policy_id) REFERENCES Policy(policy_id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- ============================================================
-- INDEXES FOR OPTIMIZATION
-- ============================================================
CREATE INDEX idx_policy_customer ON Policy(customer_id);
CREATE INDEX idx_policy_agent    ON Policy(agent_id);
CREATE INDEX idx_policy_plan     ON Policy(plan_id);
CREATE INDEX idx_payment_policy  ON Payment(policy_id);
CREATE INDEX idx_claim_policy    ON Claim(policy_id);
CREATE INDEX idx_policy_status   ON Policy(status);
CREATE INDEX idx_claim_status    ON Claim(status);

-- ============================================================
-- VIEW: Policy_Details_View
-- Combines Policy, Customer, Insurance_Plan, and Agent info
-- ============================================================
CREATE OR REPLACE VIEW Policy_Details_View AS
SELECT
    p.policy_id,
    c.customer_id,
    c.name          AS customer_name,
    c.email         AS customer_email,
    c.phone         AS customer_phone,
    ip.plan_id,
    ip.plan_name,
    ip.plan_type,
    ip.coverage_amount,
    ip.premium,
    a.agent_id,
    a.name          AS agent_name,
    a.commission    AS agent_commission,
    p.start_date,
    p.end_date,
    p.status        AS policy_status,
    n.nominee_id,
    n.name          AS nominee_name,
    n.relation      AS nominee_relation
FROM Policy p
JOIN Customer c        ON p.customer_id = c.customer_id
JOIN Insurance_Plan ip ON p.plan_id     = ip.plan_id
JOIN Agent a           ON p.agent_id    = a.agent_id
LEFT JOIN Nominee n    ON p.policy_id   = n.policy_id;

-- ============================================================
-- TRIGGER: Auto-set end_date based on plan duration on INSERT
-- ============================================================
DELIMITER $$
CREATE TRIGGER before_policy_insert
BEFORE INSERT ON Policy
FOR EACH ROW
BEGIN
    DECLARE plan_dur INT;
    SELECT duration INTO plan_dur FROM Insurance_Plan WHERE plan_id = NEW.plan_id;
    IF NEW.end_date IS NULL OR YEAR(NEW.end_date) = 0 THEN
        SET NEW.end_date = DATE_ADD(NEW.start_date, INTERVAL plan_dur MONTH);
    END IF;
    -- Auto-mark expired if end_date is in the past
    IF NEW.end_date < CURDATE() THEN
        SET NEW.status = 'Expired';
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- TRIGGER: Auto-expire policies on update
-- ============================================================
DELIMITER $$
CREATE TRIGGER before_policy_update
BEFORE UPDATE ON Policy
FOR EACH ROW
BEGIN
    IF NEW.end_date < CURDATE() AND NEW.status = 'Active' THEN
        SET NEW.status = 'Expired';
    END IF;
END$$
DELIMITER ;

-- ============================================================
-- EVENT: Auto-expire active policies daily (requires event_scheduler ON)
-- ============================================================
SET GLOBAL event_scheduler = ON;

DELIMITER $$
CREATE EVENT IF NOT EXISTS expire_policies_event
ON SCHEDULE EVERY 1 DAY
DO
BEGIN
    UPDATE Policy
    SET status = 'Expired'
    WHERE end_date < CURDATE() AND status = 'Active';
END$$
DELIMITER ;
