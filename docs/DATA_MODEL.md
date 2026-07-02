# ZeroWaste AI — Data Model

## 1. Core Entities & Relationships

```
Organization
     │
     ├── Restaurant
     │      ├── Branch
     │      │     ├── Staff
     │      │     ├── Menu
     │      │     │     └── Dish
     │      │     │           └── Ingredient
     │      │     ├── Inventory
     │      │     │     └── InventoryItem
     │      │     ├── Supplier
     │      │     ├── Kitchen
     │      │     │     └── FoodBatch
     │      │     ├── Reservation
     │      │     ├── Order
     │      │     │     └── OrderItem
     │      │     └── Sensor
     │      │
     │      └── Integration (POS, reservation system, etc.)
     │
     ├── NGO
     │     ├── Storage
     │     ├── PickupPreference
     │     └── Volunteer
     │
     └── User (belongs to organization with role)
```

## 2. Entity Definitions

### 2.1 Organization
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | Organization name |
| type | Enum | restaurant, ngo, hotel, catering, etc. |
| subscription_tier | Enum | free, basic, pro, enterprise |
| is_verified | Boolean | Verification status |
| created_at | Timestamp | |
| updated_at | Timestamp | |

### 2.2 User
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to Organization |
| email | String | Login email |
| password_hash | String | bcrypt |
| name | String | Full name |
| phone | String | |
| role | Enum | admin, manager, chef, volunteer, driver, ngo_staff |
| is_active | Boolean | |
| last_login | Timestamp | |

### 2.3 Branch
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| restaurant_id | UUID | FK to Organization |
| name | String | Branch name |
| address | Text | |
| lat | Decimal | GPS latitude |
| lng | Decimal | GPS longitude |
| cuisine_type | String | |
| avg_capacity | Integer | Seating capacity |
| open_time | Time | |
| close_time | Time | |
| timezone | String | IANA timezone |

### 2.4 Menu
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| branch_id | UUID | FK to Branch |
| name | String | Menu name (e.g. "Lunch Menu") |
| is_active | Boolean | |
| valid_from | Date | |
| valid_to | Date | nullable |

### 2.5 Dish
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| menu_id | UUID | FK to Menu |
| name | String | Dish name |
| category | Enum | starter, main, dessert, beverage |
| unit_weight | Decimal | Grams per serving |
| avg_price | Decimal | |
| prep_time | Integer | Minutes |
| is_signature | Boolean | Chef's special or signature dish |
| popularity_score | Float | 0-1 (computed by AI) |

### 2.6 Ingredient
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| dish_id | UUID | FK to Dish |
| name | String | |
| quantity_per_dish | Decimal | Amount used per dish |
| unit | Enum | g, kg, ml, l, piece, cup |
| is_perishable | Boolean | |
| shelf_life_hours | Integer | |

### 2.7 InventoryItem
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| branch_id | UUID | FK to Branch |
| ingredient_name | String | |
| quantity | Decimal | Current stock |
| unit | Enum | |
| threshold | Decimal | Reorder alert level |
| expiry_date | Date | nullable |
| supplier_id | UUID | FK to Supplier |
| cost_per_unit | Decimal | |
| last_restocked | Timestamp | |

### 2.8 FoodBatch
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| kitchen_id | UUID | FK to Kitchen |
| dish_id | UUID | FK to Dish |
| quantity_prepared | Integer | Number of servings |
| quantity_sold | Integer | |
| quantity_leftover | Integer | |
| quantity_donated | Integer | |
| quantity_wasted | Integer | |
| prepared_at | Timestamp | |
| served_until | Timestamp | |
| is_safe_for_donation | Boolean | Set by Food Safety AI |
| safety_checked_at | Timestamp | |

### 2.9 Reservation
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| branch_id | UUID | FK to Branch |
| customer_name | String | |
| customer_count | Integer | |
| reservation_time | Timestamp | |
| source | Enum | manual, pos, online |
| status | Enum | confirmed, cancelled, completed, no_show |
| special_occasion | String | nullable (birthday, anniversary, etc.) |

### 2.10 Order
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| branch_id | UUID | FK to Branch |
| order_time | Timestamp | |
| order_type | Enum | dine_in, takeaway, delivery, bulk |
| total_amount | Decimal | |
| status | Enum | placed, preparing, completed, cancelled |
| is_bulk_order | Boolean | |
| customer_count | Integer | Estimated customers for this order |

### 2.11 OrderItem
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | FK to Order |
| dish_id | UUID | FK to Dish |
| quantity | Integer | |
| unit_price | Decimal | |
| was_served | Boolean | |

### 2.12 Donation
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| food_batch_id | UUID | FK to FoodBatch |
| ngo_id | UUID | FK to NGO |
| volunteer_id | UUID | FK to User (nullable) |
| driver_id | UUID | FK to User (nullable) |
| weight_kg | Decimal | |
| meal_equivalent | Integer | |
| status | Enum | pending, matched, picked_up, delivered, verified, failed |
| pickup_time | Timestamp | |
| delivery_time | Timestamp | |
| food_safe | Boolean | |
| safety_notes | Text | |
| qr_code | String | Verification QR |
| temperature_logs | JSON | Cold chain data |

### 2.13 NGO
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| name | String | |
| registration_number | String | Government registration |
| address | Text | |
| lat | Decimal | |
| lng | Decimal | |
| contact_person | String | |
| phone | String | |
| email | String | |
| max_capacity_kg | Integer | Daily receiving capacity |
| current_storage_kg | Integer | Current storage used |
| storage_type | Enum | dry, cold, frozen, mixed |
| operating_hours | JSON | |
| is_verified | Boolean | |
| service_area_radius_km | Integer | |

### 2.14 Vehicle
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to Organization (NGO or logistics) |
| type | Enum | bike, car, van, truck, refrigerated_truck |
| capacity_kg | Integer | |
| has_cold_storage | Boolean | |
| plate_number | String | |
| is_active | Boolean | |

### 2.15 Route
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| date | Date | |
| driver_id | UUID | FK to User |
| vehicle_id | UUID | FK to Vehicle |
| stops | JSON | Ordered list of pickup/delivery stops |
| total_distance_km | Decimal | |
| estimated_duration_min | Integer | |
| actual_duration_min | Integer | nullable |
| status | Enum | planned, in_progress, completed |
| temperature_logs | JSON | Cold chain readings per stop |

### 2.16 Prediction
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| branch_id | UUID | FK to Branch |
| type | Enum | demand, inventory, surplus, cooking, donation_match |
| input_snapshot | JSON | Features used for prediction |
| predicted_value | Float | |
| actual_value | Float | nullable (for feedback loop) |
| confidence_score | Float | 0-1 |
| model_version | String | |
| made_at | Timestamp | |
| error | Float | nullable (│predicted - actual│) |

### 2.17 Sensor
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| branch_id | UUID | FK to Branch |
| type | Enum | scale, temperature, humidity, camera, refrig_monitor |
| device_id | String | Hardware ID |
| location | String | (e.g. "buffet_area", "cold_storage") |
| is_active | Boolean | |
| last_reading | JSON | Latest sensor reading |
| last_seen | Timestamp | |
| battery_level | Float | nullable |

### 2.18 AuditLog
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to User |
| action | String | |
| resource_type | String | |
| resource_id | UUID | |
| details | JSON | |
| ip_address | String | |
| user_agent | String | |
| created_at | Timestamp | |

### 2.19 Report
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| organization_id | UUID | FK to Organization |
| type | Enum | daily, weekly, monthly, esg, csr, custom |
| period_start | Date | |
| period_end | Date | |
| data | JSON | Report content |
| generated_at | Timestamp | |
| format | Enum | pdf, csv, json, html |

## 3. Key Relationships

```
Branch ──1:N──> Menu ──1:N──> Dish ──1:N──> Ingredient
Branch ──1:N──> InventoryItem
Branch ──1:N──> Reservation
Branch ──1:N──> Order ──1:N──> OrderItem
Branch ──1:N──> FoodBatch ──1:1──> Donation ──N:1──> NGO
Branch ──1:N──> Sensor
Branch ──1:N──> Prediction
NGO ──1:N──> Volunteer
NGO ──1:N──> Vehicle ──1:N──> Route
```

## 4. Indexing Strategy

| Table | Indexes |
|-------|---------|
| FoodBatch | (branch_id, prepared_at), (branch_id, status) |
| Order | (branch_id, order_time), (status) |
| Reservation | (branch_id, reservation_time), (status) |
| Prediction | (branch_id, type, made_at) |
| Donation | (status, pickup_time), (ngo_id, status) |
| InventoryItem | (branch_id, expiry_date) |
| AuditLog | (user_id, created_at), (resource_type, resource_id) |

## 5. Data Retention

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Orders | 7 years | Regulatory compliance |
| Donations | 7 years | Tax & CSR reporting |
| Sensor readings | 90 days | Aggregated summaries retained permanently |
| Predictions | 2 years | Used for model training |
| Audit logs | 3 years | Security & compliance |
| User sessions | 30 days | |
| Notifications | 90 days | |
