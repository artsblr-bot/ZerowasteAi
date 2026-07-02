# ZeroWaste AI — Security Architecture

## 1. Authentication

### 1.1 Methods
| Method | Use Case |
|--------|----------|
| Email + Password | Restaurant & NGO staff |
| OAuth 2.0 / SSO | Enterprise users (Google, Microsoft) |
| Magic Link | Volunteers (low-friction onboarding) |
| SMS OTP | Driver app (no email needed) |
| API Keys | POS integration, external partners |

### 1.2 Password Policy
- Minimum 8 characters
- Must include uppercase, lowercase, number
- bcrypt hashing (cost factor 12+)
- Rate-limited login attempts (5 per minute)
- Account lockout after 10 failed attempts

### 1.3 Session Management
- JWT-based access + refresh tokens
- Access token TTL: 15 minutes
- Refresh token TTL: 7 days
- Token rotation on refresh
- Revocation on password change or role change

## 2. Authorization (RBAC)

### 2.1 Roles
| Role | Scope | Can |
|------|-------|-----|
| super_admin | Global | Full access across all organizations |
| org_admin | Own organization | Manage users, settings, billing |
| restaurant_manager | Own branch | Menu, inventory, predictions, donations |
| chef | Own branch | View predictions, log food batches |
| ngo_admin | Own NGO | Manage capacity, volunteers, pickups |
| ngo_staff | Own NGO | View donations, confirm pickups |
| volunteer | Self | View assigned pickups, navigate |
| driver | Self | View route, confirm deliveries |
| viewer | Organization | View reports and dashboards only |

### 2.2 Permission Model
```
User ──> Role ──> Permissions ──> Resource
   │                              │
   │                    ┌─────────┴─────────┐
   │                    │                   │
   └────────────────────>  Allow / Deny     │
                        └───────────────────┘
```

### 2.3 Resource-Level Permissions
- Data is scoped to organization
- Cross-organization access requires explicit sharing
- Branch managers cannot see other branches' data (unless configured)

## 3. Data Encryption

### 3.1 At Rest
| Layer | Method |
|-------|--------|
| Database | AES-256 (transparent data encryption) |
| Object storage | Server-side encryption (S3 SSE-S3 / MinIO) |
| Backups | AES-256 |
| Secrets | Vault / AWS Secrets Manager |

### 3.2 In Transit
| Layer | Method |
|-------|--------|
| External | TLS 1.3 (HTTPS, WSS) |
| Internal (K8s) | mTLS (service mesh) |
| IoT | MQTT over TLS |
| Database connections | TLS |

## 4. API Security

### 4.1 API Gateway Policies
- Rate limiting per API key / user
- IP allowlisting for enterprise integrations
- Request size limits (10MB max)
- CORS restricted to known domains

### 4.2 API Key Management
- Keys generated with cryptographic randomness
- Keys stored as bcrypt hash (irreversible)
- Key rotation supported with grace period
- Key revocation immediately effective
- Audit log for key creation and deletion

## 5. Data Privacy

### 5.1 Personal Data
- Customer names and contact details encrypted at rest
- Phone numbers masked in logs
- Email addresses pseudonymized in analytics
- GDPR right to erasure support
- Data export API (user requests their data)

### 5.2 Data Classification
| Level | Examples | Handling |
|-------|----------|----------|
| Public | NGO names, impact statistics | No restrictions |
| Internal | Menu items, restaurant names | RBAC required |
| Confidential | Donation quantities, customer counts | RBAC + encryption |
| Restricted | API keys, passwords, personal data | RBAC + encryption + audit |

## 6. Audit Trail

All mutating operations are logged:
```json
{
  "id": "audit_xxx",
  "timestamp": "2025-01-15T10:30:00Z",
  "user_id": "user_xxx",
  "action": "CREATE_DONATION",
  "resource_type": "donation",
  "resource_id": "don_xxx",
  "details": {
    "food_batch_id": "batch_xxx",
    "ngo_id": "ngo_xxx",
    "quantity_kg": 25.5
  },
  "ip_address": "203.0.113.1",
  "user_agent": "Mozilla/5.0..."
}
```

## 7. Compliance

| Regulation | Applicability | Requirements |
|-----------|--------------|--------------|
| GDPR | EU restaurants/users | Right to erasure, data portability, consent |
| CCPA | California | Opt-out of data sale, disclosure |
| India IT Act | Indian operations | Data localization, encryption |
| Local food safety laws | Per country | Donation tracking, temperature logs |
| Tax laws | Per country | Donation receipts, CSR reporting |

## 8. Security Testing

| Test | Frequency |
|------|-----------|
| Dependency scanning (npm audit, pip audit) | Every build |
| SAST (ESLint security plugin, Bandit) | Every PR |
| DAST (OWASP ZAP) | Weekly |
| Penetration testing | Quarterly |
| Secret scanning (GitHub secret scanner) | Every push |
| Container scanning (Trivy) | Every build |
| Dependency updates (Dependabot) | Daily |
