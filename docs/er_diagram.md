# ER Diagram — Insurance Policy Management System

## Entity-Relationship Diagram

```mermaid
erDiagram
    Customer ||--o{ Policy : "purchases"
    Insurance_Plan ||--o{ Policy : "defines"
    Agent ||--o{ Policy : "sells"
    Policy ||--o{ Nominee : "has"
    Policy ||--o{ Payment : "receives"
    Policy ||--o{ Claim : "has"

    Customer {
        INT customer_id PK
        VARCHAR name
        INT age
        ENUM gender
        VARCHAR phone
        VARCHAR email UK
        VARCHAR address
    }

    Insurance_Plan {
        INT plan_id PK
        VARCHAR plan_name
        ENUM plan_type
        DECIMAL coverage_amount
        DECIMAL premium
        INT duration
    }

    Agent {
        INT agent_id PK
        VARCHAR name
        VARCHAR phone
        DECIMAL commission
    }

    Policy {
        INT policy_id PK
        INT customer_id FK
        INT plan_id FK
        INT agent_id FK
        DATE start_date
        DATE end_date
        ENUM status
    }

    Nominee {
        INT nominee_id PK
        INT policy_id FK
        VARCHAR name
        VARCHAR relation
    }

    Payment {
        INT payment_id PK
        INT policy_id FK
        DECIMAL amount
        DATE payment_date
        ENUM payment_mode
    }

    Claim {
        INT claim_id PK
        INT policy_id FK
        DECIMAL claim_amount
        DATE claim_date
        ENUM status
    }
```

## Relationships

| Relationship | Type | Description |
|---|---|---|
| Customer → Policy | 1:N | A customer can purchase multiple policies |
| Insurance_Plan → Policy | 1:N | A plan can be used in multiple policies |
| Agent → Policy | 1:N | An agent can sell multiple policies |
| Policy → Nominee | 1:N | A policy can have multiple nominees |
| Policy → Payment | 1:N | A policy can have multiple payments |
| Policy → Claim | 1:N | A policy can have multiple claims |

## Key Constraints

- **Customer.email** is UNIQUE
- **Customer.age** must be ≥ 18 (CHECK constraint)
- **Policy** deletion is RESTRICTED if referenced by Customer, Plan, or Agent
- **Nominee, Payment, Claim** cascade on Policy deletion (ON DELETE CASCADE)
- **Triggers** auto-set `end_date` and auto-expire policies
- **Event scheduler** runs daily to expire old policies
