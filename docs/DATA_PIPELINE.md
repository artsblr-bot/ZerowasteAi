# ZeroWaste AI — Data Pipeline

## 1. Data Sources

### 1.1 Internal Sources
| Source | Description | Data Format | Frequency |
|--------|-------------|-------------|-----------|
| Restaurant Portal | Manual input (menu, reservations, hours) | JSON (API) | On demand |
| POS Integration | Live orders, cancellations, sales | JSON (webhook) | Real-time |
| Mobile Apps | Volunteer/driver GPS, status updates | JSON (API) | Real-time |
| QR Scans | Pickup/delivery verification | JSON (API) | Event-based |

### 1.2 External Sources
| Source | Description | API | Frequency |
|--------|-------------|-----|-----------|
| Weather Data | Temperature, precipitation, humidity | OpenWeatherMap / WeatherAPI | Hourly |
| Traffic Data | Road conditions, ETAs | Google Maps API / Mapbox | Real-time |
| Holiday Calendar | Public holidays, festivals | Custom calendar + manual | Yearly |
| Event Data | Concerts, sports, gatherings | Ticketmaster / local APIs | Daily |
| Government Data | Food safety regulations, donation laws | Various | As updated |

### 1.3 IoT Sources
| Source | Data | Protocol | Frequency |
|--------|------|----------|-----------|
| Smart Scales | Weight of food prepared/sold/wasted | MQTT | Real-time |
| Temperature Sensors | Food storage temperature | MQTT | Every 5 min |
| Humidity Sensors | Storage environment | MQTT | Every 15 min |
| Refrigeration Monitors | Cooler/freezer status | MQTT | Every 5 min |
| Cameras (Vision) | Buffet levels, waste bin fill | MQTT (images) | Every 15 min |
| GPS Trackers | Vehicle location | MQTT | Real-time |

## 2. Pipeline Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Data Sources │───>│  Ingestion   │───>│  Validation  │
│  (multiple)   │    │  (adapters)  │    │  & Cleaning  │
└──────────────┘    └──────────────┘    └──────────────┘
                                                │
                                       ┌────────┴────────┐
                                       │  Transformation  │
                                       │  & Enrichment    │
                                       └────────┬────────┘
                                                │
                    ┌───────────────────────────┼───────────────────┐
                    │                           │                   │
           ┌────────┴────────┐        ┌────────┴────────┐  ┌───────┴───────┐
           │  Data Warehouse  │        │  Feature Store  │  │  Real-time    │
           │  (PostgreSQL)    │        │  (Feast)        │  │  Cache (Redis)│
           └────────┬────────┘        └────────┬────────┘  └───────┬───────┘
                    │                           │                   │
           ┌────────┴────────┐        ┌────────┴────────┐         │
           │  Analytics      │        │  ML Training    │         │
           │  (BI / Reports) │        │  (Batch Jobs)   │         │
           └─────────────────┘        └─────────────────┘         │
                                                           ┌───────┴───────┐
                                                           │  Predictions   │
                                                           │  (Real-time)   │
                                                           └───────────────┘
```

## 3. Data Ingestion

### 3.1 REST API (Manual & Portal Data)
```
User Input ──> API Gateway ──> Validation ──> Message Queue ──> Database
```

### 3.2 Webhooks (POS & External Integrations)
```
POS System ──> Webhook Receiver ──> Signature Verification ──> Rate Limiter
    └──> Validation ──> Transform ──> Message Queue ──> Database
```

### 3.3 MQTT (IoT Devices)
```
IoT Device ──> MQTT Broker (EMQX) ──> Bridge Service ──> Validation
    └──> Time-series DB (InfluxDB) ──> Aggregation ──> Message Queue
```

### 3.4 Batch (External APIs)
```
Scheduler (Cron / Airflow) ──> API Call ──> Pagination Handler
    └──> Validation ──> Deduplication ──> Database Upsert
```

## 4. Data Validation Rules

| Field | Rule |
|-------|------|
| Order count | Must be > 0 |
| Temperature | Must be between -40°C and 100°C |
| Weight | Must be > 0 |
| Date | Must not be in the future (except predictions) |
| GPS coordinates | Must be valid lat/lng |
| Email | Must match email format |
| Phone | Must match phone format for country |
| Donation weight | Must not exceed NGO capacity |

## 5. Data Transformation

### 5.1 Feature Engineering for ML
| Feature | Source | Transformation |
|---------|--------|---------------|
| day_of_week | Date | One-hot encoding (7 categories) |
| is_holiday | Holiday calendar | Binary flag |
| weather_category | Weather data | Ordinal encoding (clear=0, cloudy=1, rain=2, storm=3) |
| rolling_avg_7d | Historical orders | 7-day moving average |
| rolling_avg_30d | Historical orders | 30-day moving average |
| season | Date | One-hot encoding (4 seasons) |
| customer_growth | Historical | (current - last_year)/last_year |
| event_proximity | Events | Distance in km to nearest event |
| hour_of_day | Time | Cyclical encoding (sin/cos) |

### 5.2 Aggregation Pipelines
- **Hourly**: Orders, cancellations, walk-ins
- **Daily**: Sales summary, waste summary, donation summary
- **Weekly**: Trends, model retraining data
- **Monthly**: Business reports, ESG calculations

## 6. Data Storage Strategy

| Data Type | Storage | Retention | Access Pattern |
|-----------|---------|-----------|----------------|
| Operational data (orders, inventory) | PostgreSQL | 7 years | Frequent reads/writes |
| Time-series (IoT sensors) | InfluxDB / TimescaleDB | 90 days raw, summaries permanent | High write, low read |
| Event stream | Kafka topics | 7 days | Real-time processing |
| Feature store | Feast (Redis + PostgreSQL) | As long as model uses it | Low-latency reads |
| Model artifacts | S3 / MinIO | Indefinite (versioned) | Infrequent |
| ML experiment logs | MLflow | Indefinite | Debugging & audit |
| Audit logs | PostgreSQL | 3 years | Append-only |
| Analytics aggregations | PostgreSQL / ClickHouse | 5 years | BI dashboards |

## 7. Data Quality Monitoring

| Metric | Target | Action |
|--------|--------|--------|
| Ingestion success rate | > 99.5% | Alert if below threshold |
| Data freshness | < 5 min for real-time | Alert on lag |
| Schema validation pass rate | > 99.9% | Quarantine invalid records |
| Duplicate rate | < 0.1% | Deduplication on write |
| Missing value rate | < 5% per field | Impute or alert |
| Pipeline latency (p99) | < 30s batch, < 2s real-time | Scale pipeline |

## 8. Data Pipeline Technologies

| Component | Technology |
|-----------|-----------|
| Message Queue | Apache Kafka (stream), RabbitMQ (tasks) |
| Stream Processing | Apache Flink / Kafka Streams |
| Batch Processing | Apache Airflow / Prefect |
| ETL | dbt (data build tool) |
| Real-time Cache | Redis |
| Time-series DB | InfluxDB / TimescaleDB |
| Data Warehouse | PostgreSQL / ClickHouse |
| Object Storage | AWS S3 / MinIO |
| Feature Store | Feast |
| Data Quality | Great Expectations |
| Schema Registry | Apache Avro / Protobuf |
