# ZeroWaste AI — AI Architecture

## 1. Philosophy

Instead of one giant AI model, we build **specialized models** — each responsible for a single prediction. This follows how Amazon, Uber, and Google build AI systems.

Each model is independently:
- Trained
- Deployed
- Monitored
- Retrained
- Versioned

## 2. Model Registry

| # | Model | Purpose | Type |
|---|-------|---------|------|
| 1 | Demand Forecast AI | Predict customer volume | Regression |
| 2 | Reservation Prediction AI | Predict no-shows & walk-ins | Regression |
| 3 | Menu Popularity AI | Predict dish-level demand | Multi-output Regression |
| 4 | Inventory Forecast AI | Predict ingredient needs | Regression |
| 5 | Cooking Recommendation AI | Recommend prep quantities | Optimization |
| 6 | Surplus Prediction AI | Predict leftover food | Regression |
| 7 | Donation Matching AI | Match surplus with NGOs | Ranking |
| 8 | Food Safety AI | Evaluate food safety for donation | Classification |
| 9 | Route Optimization AI | Optimize pickup/delivery routes | Optimization |
| 10 | Fraud Detection AI | Detect unusual behavior | Anomaly Detection |
| 11 | Sustainability AI | Calculate environmental impact | Deterministic + ML |
| 12 | Carbon Impact AI | Estimate CO₂ savings | Regression |

## 3. Model Specifications

### 3.1 Demand Forecast AI
**Purpose**: Predict number of customers for a given day/meal period.

**Inputs**:
- Day of week (one-hot encoded)
- Date features (month, day_of_month, is_weekend, is_holiday)
- Weather: temperature, rain probability, humidity
- Reservations count (confirmed + pending)
- Last N days actual customer count (N=7, 14, 30, 90)
- Same day previous year customer count
- Nearby events (concert, sports, festival — encoded as categories)
- School holiday flag
- Tourist season flag
- Special offers / promotions flag

**Output**: Expected customer count (integer)

**Model**: Gradient Boosted Trees (XGBoost / LightGBM)

**Training data**: Restaurant's historical data (minimum 60 days for baseline, improves over time)

**Retraining frequency**: Weekly (incremental)

**Confidence metric**: MAPE (Mean Absolute Percentage Error)

### 3.2 Reservation Prediction AI
**Purpose**: Predict how many reservations will actually show up vs no-show / cancel.

**Inputs**:
- Total reservations booked
- Historical no-show rate for similar days
- Weather forecast
- Lead time (how far in advance reservations made)
- Day of week
- Deposit / prepayment flag

**Outputs**: Predicted show-ups, predicted cancellations, predicted walk-ins

**Model**: Ensemble (Logistic Regression + XGBoost)

### 3.3 Menu Popularity AI
**Purpose**: Predict which dishes will sell and in what quantity.

**Inputs**:
- Historical sales per dish (last 4 weeks of same day)
- Day of week
- Season
- Weather
- Dish category (starter, main, etc.)
- Is signature dish flag
- Price
- Recent promotions

**Outputs**: Quantity sold per dish

**Model**: Multi-output Regression (separate model per dish type, or joint matrix factorization)

### 3.4 Inventory Forecast AI
**Purpose**: Predict ingredient requirements based on predicted demand.

**Inputs**:
- Predicted customer count (from Demand Forecast AI)
- Predicted dish-level sales (from Menu Popularity AI)
- Recipe-to-ingredient mapping
- Current inventory levels
- Supplier lead times
- Perishable / non-perishable flags

**Outputs**: Required quantity per ingredient

**Model**: Rule-based + Regression adjustment

### 3.5 Cooking Recommendation AI ⭐ (Core Feature)
**Purpose**: Recommend how much food to prepare before cooking begins.

**Inputs**:
- Predicted demand
- Predicted dish-level sales
- Current inventory
- Prep time constraints
- Minimum batch sizes
- Historical waste for over-preparation
- Cost per dish
- Revenue per dish

**Outputs**: Recommended preparation quantity per dish, estimated savings vs cooking to max capacity

**Model**: Constrained optimization (linear programming + ML adjustments)

**Key Business Value**: This is the most important model. It prevents waste before it happens by telling chefs "cook this many, not more."

### 3.6 Surplus Prediction AI
**Purpose**: Predict leftover food quantity before closing time.

**Inputs**:
- Quantity prepared per dish
- Quantity sold so far (real-time)
- Time remaining until closing
- Historical leftover patterns
- Current walk-in rate
- Ongoing promotions (e.g. "buy one get one" to clear stock)

**Outputs**: Predicted surplus weight (kg), predicted surplus by dish

**Model**: Time-series (LSTM or Prophet)

### 3.7 Donation Matching AI
**Purpose**: Match surplus food with suitable NGOs.

**Inputs**:
- Surplus location (branch lat/lng)
- Surplus quantity (kg)
- Food type (cooked, raw, perishable, dry)
- Safety status
- Available NGOs within radius
- NGO capacity (current storage available)
- NGO storage type (dry/cold/frozen)
- NGO operating hours
- Distance from restaurant
- Historical pickup success rate per NGO

**Outputs**: Ranked list of NGOs sorted by suitability score

**Model**: Learning to Rank (LambdaRank / RankNet)

### 3.8 Food Safety AI
**Purpose**: Determine if leftover food is safe for donation.

**Inputs**:
- Time since preparation
- Food type (cooked, raw, dairy, etc.)
- Temperature history (from IoT sensors)
- Storage conditions
- Visual assessment (if camera available)
- Historical spoilage rates for similar food

**Outputs**: safe / unsafe / needs_inspection (with confidence)

**Model**: Random Forest classification

### 3.9 Route Optimization AI
**Purpose**: Optimize pickup and delivery routes for volunteers/drivers.

**Inputs**:
- Pickup locations (lat/lng)
- Delivery locations (lat/lng)
- Vehicle capacity
- Time windows for pickup
- Time windows for delivery
- Traffic predictions
- Cold chain time limits

**Outputs**: Optimized stop order, estimated duration, estimated distance

**Model**: OR-Tools (Google) + ML-based traffic prediction

### 3.10 Fraud Detection AI
**Purpose**: Detect unusual donation patterns that may indicate fraud.

**Inputs**:
- Historical donation patterns per restaurant
- Donation quantity vs predicted surplus
- Frequency of donations
- NGO pickup patterns
- User behavior anomalies
- GPS mismatch detection

**Outputs**: Fraud score (0-1), flagged anomalies

**Model**: Isolation Forest + Autoencoder

### 3.11 Sustainability AI
**Purpose**: Calculate environmental impact of donations and waste reduction.

**Inputs**:
- Weight of food saved from waste
- Food type (meat, vegetable, grain — different CO₂ per kg)
- Distance transported
- Vehicle type
- Methane avoidance calculation
- Water footprint

**Outputs**:
- Meals saved
- CO₂ emissions avoided (kg)
- Methane avoided (kg)
- Water saved (liters)
- Landfill reduction (kg)

**Model**: Deterministic calculation using environmental science formulas

### 3.12 Carbon Impact AI
**Purpose**: Predict CO₂ savings from recommended waste reduction.

**Inputs**:
- Reduced preparation (from Cooking Recommendation AI)
- Actual waste vs predicted waste
- Food type composition
- Transport impact

**Outputs**: CO₂ savings forecast

## 4. Training Strategy

```
                    ┌─────────────────────┐
                    │   Historical Data    │
                    │  (restaurant's own)  │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │    Feature Store     │
                    │  ( Feast / Tecton )  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
     │  Training     │ │  Validation │ │  Testing    │
     │  80%          │ │  10%        │ │  10%        │
     └────────┬──────┘ └─────────────┘ └─────────────┘
              │
     ┌────────┴──────┐
     │  Model        │
     │  Registry     │
     │  (MLflow)     │
     └────────┬──────┘
              │
     ┌────────┴──────┐
     │  Deployment   │
     │  (FastAPI)    │
     └────────┬──────┘
              │
     ┌────────┴──────┐
     │  Monitoring   │
     │  (Prediction  │
     │   vs Actual)  │
     └────────┬──────┘
              │
              │  Error > Threshold?
              │  ─────────────────> Retrain
              │
              v
        Serve Predictions
```

## 5. Model Retraining Triggers

| Trigger | Action |
|---------|--------|
| Weekly schedule | Incremental training with new data |
| Error > 15% MAPE | Immediate retraining |
| Data drift detected | Full retraining with updated features |
| Monthly | Full retraining on complete dataset |
| New restaurant onboarded | Cold start (use segment averages, converge over 60 days) |

## 6. Cold Start Strategy

For new restaurants with no history:
1. Use **segment averages** (similar cuisine, city, size)
2. Use **national/regional food waste statistics** as baselines
3. Apply **calibration factor** that converges to 1.0 over 60 days
4. Increase uncertainty bounds (wider confidence intervals)
5. Transition to restaurant-specific model after 60 data points

## 7. Confidence Scoring

Every prediction includes:
```json
{
  "predicted_value": 312,
  "confidence_score": 0.87,
  "confidence_interval": [295, 329],
  "model_version": "demand_v2.3.1",
  "model_name": "demand_forecast",
  "features_used": ["day_of_week", "weather", "reservations", "season"],
  "is_cold_start": false
}
```

## 8. Feedback Loop

```
Prediction made ──> Actual recorded ──> Error calculated
                                           │
                                    Error stored in DB
                                           │
                                    Used in next training
                                           │
                                    Model improves over time
```

## 9. MLOps

| Component | Technology |
|-----------|-----------|
| Feature Store | Feast |
| Model Registry | MLflow |
| Training Pipeline | Apache Airflow / Prefect |
| Model Serving | FastAPI + ONNX / BentoML |
| Monitoring | Prometheus + custom metrics |
| Drift Detection | Evidently AI / Alibi Detect |
| Experiment Tracking | MLflow / Weights & Biases |
| A/B Testing | Custom framework (model A vs model B) |
