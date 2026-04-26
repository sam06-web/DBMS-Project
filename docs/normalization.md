# Insurance Policy Management System — Database Documentation

## 1. ER Diagram Description

```
┌──────────┐       ┌──────────┐       ┌────────────────┐
│ Customer │1────M│  Policy   │M────1│ Insurance_Plan │
│          │       │  (MAIN)  │       │                │
└──────────┘       └──┬───┬───┘       └────────────────┘
                      │   │
                 M────1│   │
              ┌────────┘   │1────1┌──────────┐
              │            │      │ Nominee  │
         ┌────┴───┐        │      └──────────┘
         │ Agent  │        │
         └────────┘   ┌────┴────┐
                      │         │
                 1────M    1────M
              ┌────────┐  ┌────────┐
              │Payment │  │ Claim  │
              └────────┘  └────────┘
```

### Entities & Relationships

| Relationship | Type | Description |
|---|---|---|
| Customer → Policy | One-to-Many | One customer can hold many policies |
| Insurance_Plan → Policy | One-to-Many | One plan can be used in many policies |
| Agent → Policy | One-to-Many | One agent can manage many policies |
| Policy → Nominee | One-to-One | Each policy has one nominee |
| Policy → Payment | One-to-Many | Each policy can have many payments |
| Policy → Claim | One-to-Many | Each policy can have many claims |

---

## 2. Relational Schema

```
Customer    (customer_id PK, name, age, gender, phone, email UNIQUE, address)
Insurance_Plan (plan_id PK, plan_name, plan_type, coverage_amount, premium, duration)
Agent       (agent_id PK, name, phone, commission)
Policy      (policy_id PK, customer_id FK→Customer, plan_id FK→Insurance_Plan, agent_id FK→Agent, start_date, end_date, status)
Nominee     (nominee_id PK, policy_id FK→Policy, name, relation)
Payment     (payment_id PK, policy_id FK→Policy, amount, payment_date, payment_mode)
Claim       (claim_id PK, policy_id FK→Policy, claim_amount, claim_date, status)
```

---

## 3. Normalization Analysis

### First Normal Form (1NF)
All tables satisfy 1NF:
- Every column contains **atomic (indivisible) values** — no multi-valued or composite attributes
- Each row is **uniquely identifiable** via a primary key
- No **repeating groups** — e.g., multiple phone numbers or addresses are not stored in a single column

### Second Normal Form (2NF)
All tables satisfy 2NF:
- Every table is already in 1NF
- All non-key attributes are **fully functionally dependent on the entire primary key**
- Since every table uses a single-column auto-increment primary key, there are no partial dependencies by definition
- Example: In the `Policy` table, `start_date`, `end_date`, and `status` all depend entirely on `policy_id`

### Third Normal Form (3NF)
All tables satisfy 3NF:
- Every table is already in 2NF
- There are **no transitive dependencies** — no non-key attribute depends on another non-key attribute
- Plan details (`plan_name`, `coverage_amount`, etc.) are stored in `Insurance_Plan`, not in `Policy` — eliminating transitive dependency
- Customer details are stored in `Customer`, not duplicated in `Policy`
- Agent details are stored in `Agent`, not duplicated in `Policy`
- Nominee information is in a separate `Nominee` table, not embedded in `Policy`

### Summary Table

| Table | 1NF | 2NF | 3NF | Notes |
|---|:---:|:---:|:---:|---|
| Customer | ✓ | ✓ | ✓ | Atomic fields, single PK |
| Insurance_Plan | ✓ | ✓ | ✓ | No transitive deps |
| Agent | ✓ | ✓ | ✓ | Commission is agent-specific |
| Policy | ✓ | ✓ | ✓ | References entities via FKs |
| Nominee | ✓ | ✓ | ✓ | Separate from Policy |
| Payment | ✓ | ✓ | ✓ | No derived attributes |
| Claim | ✓ | ✓ | ✓ | No derived attributes |
