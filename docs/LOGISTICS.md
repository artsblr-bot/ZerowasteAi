# ZeroWaste AI — Logistics Engine

## 1. Overview

The logistics engine handles the physical movement of surplus food from restaurants/businesses to NGOs. It optimizes for:

- **Speed**: Food must reach recipients while still safe
- **Efficiency**: Minimize distance, fuel, time
- **Capacity**: Match food quantity to vehicle & NGO capacity
- **Safety**: Maintain cold chain for perishable items

## 2. Logistics Flow

```
Surplus Detected (Food Safety AI confirms safe)
         │
         v
Donation Opportunity Created
         │
         v
NGO Matching (Donation Matching AI)
         │
         v
Volunteer/Driver Assignment
         │
         v
Route Optimization (Route Optimization AI)
         │
         v
Pickup (QR verification at restaurant)
         │
         v
Transport (with temperature monitoring)
         │
         v
Delivery (QR verification at NGO)
         │
         v
Impact Recorded (Sustainability AI)
```

## 3. Donation Matching Algorithm

### 3.1 Criteria (Weighted Scoring)
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Distance | 0.30 | Distance from restaurant to NGO |
| Capacity | 0.25 | NGO has enough remaining capacity |
| Storage match | 0.20 | NGO can store this food type (cold/dry) |
| Timing | 0.15 | NGO is open and can receive now |
| History | 0.10 | Historical pickup success rate |

### 3.2 Matching Constraints
- NGO must be within service radius (default 15 km)
- NGO must have available capacity >= donation weight
- NGO must support required storage type
- Pickup must fit within NGO operating hours
- Food must reach NGO within safety time window

### 3.3 Fallback Strategy
| If | Then |
|----|------|
| No NGO within range | Extend radius to 25 km |
| Still no match | Notify nearby food banks |
| Food banking unavailable | Log as unavoidable waste |
| NGO capacity insufficient | Split donation across multiple NGOs |

## 4. Route Optimization

### 4.1 Optimization Goals
1. **Minimize total distance** (fuel cost, time)
2. **Minimize food transport time** (safety)
3. **Maximize deliveries per route** (efficiency)
4. **Prioritize perishable items** (cold chain time limit)

### 4.2 Constraints
- Vehicle capacity (kg)
- Time windows for pickup and delivery
- Food safety time limit (max 2 hours for cooked food)
- Driver shift limits
- Cold chain requirements

### 4.3 Algorithm
- Use OR-Tools (Google) Vehicle Routing Problem solver
- ML-based traffic prediction for ETA refinement
- Dynamic re-routing based on new donations
- Batch optimization for multiple pickups in same area

## 5. Vehicle Management

### 5.1 Vehicle Types
| Type | Capacity | Cold Storage | Best For |
|------|----------|-------------|----------|
| Bike | 20 kg | No | Small pickups, dense urban |
| Car | 100 kg | Optional | Medium pickups |
| Van | 500 kg | Optional | Large pickups |
| Refrigerated truck | 2000 kg | Yes | Bulk perishable transport |

### 5.2 Cold Chain Monitoring
- Temperature sensor in each cold storage compartment
- Readings every 5 minutes during transport
- Alert if temperature exceeds safe zone (> 8°C for chilled, > -18°C for frozen)
- Food safety AI re-evaluates if temperature breach detected

## 6. Volunteer & Driver Management

### 6.1 Volunteer Flow
```
Register ──> Verify ──> Available ──> Assigned ──> Pickup ──> Deliver ──> Complete
```

### 6.2 Driver App Features
- Navigation with optimized route
- QR scanning for pickup/delivery confirmation
- Temperature monitoring dashboard
- Photo evidence capture
- Incident reporting
- ETA sharing with NGO

## 7. Pickup & Delivery Verification

### 7.1 QR Code Workflow
1. Donation created → QR code generated (unique per donation)
2. Restaurant staff scans QR at pickup → confirms release
3. Volunteer/driver scans QR at pickup → confirms collection
4. NGO staff scans QR at delivery → confirms receipt
5. All scans timestamped and GPS-tagged

### 7.2 Verification Data
```json
{
  "donation_id": "don_xxx",
  "pickup_scan": {
    "scanned_by": "user_restaurant",
    "at": "2025-01-15T21:30:00Z",
    "gps": { "lat": 12.9716, "lng": 77.5946 },
    "photo_url": "s3://.../pickup_verify.jpg"
  },
  "collection_scan": {
    "scanned_by": "user_volunteer",
    "at": "2025-01-15T21:35:00Z"
  },
  "delivery_scan": {
    "scanned_by": "user_ngo",
    "at": "2025-01-15T22:10:00Z",
    "gps": { "lat": 12.9352, "lng": 77.6245 },
    "weight_verified_kg": 24.8
  }
}
```

## 8. ETA Prediction

The system predicts ETAs using:
- Distance-based baseline
- Traffic data (Google Maps API)
- Historical route times for same area/day/time
- Time of day congestion factors
- Special event traffic impacts

## 9. Emergency Handling

| Scenario | Response |
|----------|----------|
| Volunteer cancels | Reassign nearest available volunteer |
| Vehicle breakdown | Dispatch backup vehicle, notify NGO |
| Food safety breach | Cancel donation, notify restaurant |
| NGO rejects delivery | Find alternative NGO within safe time window |
| Traffic delay > 30 min | Notify NGO of new ETA, monitor food safety |
