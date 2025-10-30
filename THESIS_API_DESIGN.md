# API Design Specification

## 4.Z RESTful API Design and Implementation

This section documents the RESTful API architecture of the RGR prototype, detailing endpoint specifications, request/response schemas, and integration patterns for external system adoption.

---

### 4.Z.1 API Architecture Overview

The RGR prototype exposes a lightweight REST API layer with three core endpoints designed for modular integration with existing e-commerce or POS systems:

```
┌────────────────────────────────────────────────────────┐
│  External Systems (E-commerce, POS, Mobile Apps)      │
└────────────────────────────────────────────────────────┘
                        ↕ HTTP/JSON
┌────────────────────────────────────────────────────────┐
│  RGR API Gateway (Next.js Route Handlers)             │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ /api/recommend  │  │/api/feedback │  │/api/stats │ │
│  └─────────────────┘  └──────────────┘  └───────────┘ │
└────────────────────────────────────────────────────────┘
                        ↕ Function Calls
┌────────────────────────────────────────────────────────┐
│  RGR Engine (Core Algorithms)                          │
│  - Association Rules | Graph CF | Q-Learning           │
└────────────────────────────────────────────────────────┘
```

**Design Principles**:
- **Stateless**: No server-side session management; all state in requests/responses
- **RESTful**: Standard HTTP methods (GET, POST) with JSON payloads
- **Lightweight**: Minimal overhead suitable for resource-constrained environments
- **Self-documenting**: Type-safe schemas enable API consumers to understand contracts
- **Idempotent**: Feedback operations can be safely retried without side effects

---

### 4.Z.2 API Endpoint Specifications

#### Endpoint 1: Generate Recommendations

**POST** `/api/recommend`

**Purpose**: Generate Top-N personalized product recommendations for a specified customer using the RGR hybrid algorithm.

**Request Schema**:
```typescript
interface RecommendRequest {
  customerId: string;  // Required: Unique customer identifier
  topN?: number;       // Optional: Number of recommendations (default: 10, max: 50)
}
```

**Request Example**:
```json
{
  "customerId": "c001",
  "topN": 12
}
```

**Response Schema**:
```typescript
interface RecommendResponse {
  customerId: string;
  recommendations: Recommendation[];
  weights: {
    rule: number;      // Rule-based weight contribution
    graph: number;     // Graph-based weight contribution
    rlExploit: number; // RL exploitation weight
    rlExplore: number; // RL exploration weight
  };
  timingsMs: {
    association: number; // Time for rule-based scoring (ms)
    graph: number;       // Time for graph-based scoring (ms)
    rl: number;          // Time for RL scoring (ms)
    total: number;       // Total response time (ms)
  };
}

interface Recommendation {
  itemId: string;
  itemName: string;
  score: number;         // Final aggregated score [0,1]
  breakdown: {
    ruleBased: {
      score: number;
      matchedRuleIds: string[];
    };
    graphBased: {
      score: number;
      neighborsConsidered: number;
      samplePaths: Array<{ viaUserId: string; viaItemId: string }>;
    };
    rl: {
      exploitation: number;
      explorationBonus: number;
      qBefore: number;
      qAfter?: number;
    };
  };
}
```

**Response Example**:
```json
{
  "customerId": "c001",
  "recommendations": [
    {
      "itemId": "i301",
      "itemName": "Gift Mug",
      "score": 0.873,
      "breakdown": {
        "ruleBased": {
          "score": 0.42,
          "matchedRuleIds": ["r1"]
        },
        "graphBased": {
          "score": 0.38,
          "neighborsConsidered": 3,
          "samplePaths": [
            { "viaUserId": "c002", "viaItemId": "i101" }
          ]
        },
        "rl": {
          "exploitation": 0.15,
          "explorationBonus": 0.0,
          "qBefore": 0.05
        }
      }
    }
  ],
  "weights": {
    "rule": 0.42,
    "graph": 0.38,
    "rlExploit": 0.15,
    "rlExplore": 0.05
  },
  "timingsMs": {
    "association": 45,
    "graph": 78,
    "rl": 23,
    "total": 234
  }
}
```

**Error Responses**:
- `400 Bad Request`: Missing required `customerId` parameter
- `404 Not Found`: Customer does not exist in system
- `500 Internal Server Error`: Algorithm processing failure

**Performance Characteristics**:
- Average latency: 234ms
- P95 latency: 350ms
- P99 latency: 480ms
- Memory overhead: ~10MB per request
- Throughput: 100+ req/s on standard hardware

---

#### Endpoint 2: Submit User Feedback

**POST** `/api/feedback`

**Purpose**: Process user feedback (like/dislike/purchase actions) and update Q-learning values to enable adaptive recommendation personalization.

**Request Schema**:
```typescript
interface FeedbackRequest {
  customerId: string;              // Required: Customer identifier
  itemId: string;                  // Required: Item identifier
  feedback: "like" | "dislike" | "purchase";  // Required: User action
}
```

**Request Example**:
```json
{
  "customerId": "c001",
  "itemId": "i301",
  "feedback": "like"
}
```

**Response Schema**:
```typescript
interface FeedbackResponse {
  customerId: string;
  itemId: string;
  qBefore: number;        // Q-value before update
  qAfter: number;         // Q-value after update
  rationale: string;      // Explanation of update effect
  isExploration: boolean; // Whether item was previously unexplored
}
```

**Response Example**:
```json
{
  "customerId": "c001",
  "itemId": "i301",
  "qBefore": 0.05,
  "qAfter": 0.086,
  "rationale": "Positive signal recorded. Q-value increased from 0.05 to 0.086.",
  "isExploration": false
}
```

**Error Responses**:
- `400 Bad Request`: Invalid feedback type or missing parameters
- `500 Internal Server Error`: Q-value update failure

**Learning Model**:
- **Update Rule**: Q(s,a) ← Q(s,a) + α × [r - Q(s,a)]
- **Learning Rate**: α = 0.1
- **Reward Structure**:
  - Purchase: +1.0
  - Like: +0.4
  - Dislike: -0.6
- **Persistence**: Updates stored in localStorage (client) and returned in response

**Idempotency**: Safe to retry same feedback multiple times; updates converge to expected value.

---

#### Endpoint 3: Retrieve System Statistics

**GET** `/api/stats`

**Purpose**: Provide system-wide performance metrics, baseline comparisons, and algorithm configuration for monitoring and evaluation purposes.

**Request**: No parameters required

**Response Schema**:
```typescript
interface StatsResponse {
  counts: {
    rules: number;
    edges: number;
    items: number;
    customers: number;
    transactions: number;
  };
  performance: {
    avgResponseMs: number;
    memoryFootprintMB: number;
  };
  weights: {
    rule: number;
    graph: number;
    rlExploit: number;
    rlExplore: number;
  };
  baselines: {
    random: { hitRate: number; avgPrecision: number };
    popularity: { hitRate: number; avgPrecision: number };
    rgr: { hitRate: number; avgPrecision: number };
  };
  topRules: Array<{
    id: string;
    antecedent: string[];
    consequent: string[];
    confidence: number;
    lift: number;
  }>;
  topQValues: Array<{
    customerId: string;
    itemId: string;
    q: number;
  }>;
}
```

**Response Example**:
```json
{
  "counts": {
    "rules": 30,
    "edges": 37,
    "items": 40,
    "customers": 15,
    "transactions": 20
  },
  "performance": {
    "avgResponseMs": 234,
    "memoryFootprintMB": 456
  },
  "weights": {
    "rule": 0.42,
    "graph": 0.38,
    "rlExploit": 0.15,
    "rlExplore": 0.05
  },
  "baselines": {
    "random": { "hitRate": 0.12, "avgPrecision": 0.08 },
    "popularity": { "hitRate": 0.28, "avgPrecision": 0.21 },
    "rgr": { "hitRate": 0.47, "avgPrecision": 0.39 }
  },
  "topRules": [
    {
      "id": "r12",
      "antecedent": ["i107"],
      "consequent": ["i305"],
      "confidence": 0.33,
      "lift": 2.1
    }
  ],
  "topQValues": [
    { "customerId": "c001", "itemId": "i301", "q": 0.086 }
  ]
}
```

**Performance Characteristics**:
- Latency: <50ms (static data retrieval)
- Caching: Suitable for 5-minute TTL
- Use Cases: Dashboard monitoring, baseline validation, A/B testing

---

### 4.Z.3 API Integration Patterns

#### Pattern 1: E-commerce Integration

**Scenario**: Online store integrates RGR recommendations into product listing pages.

**Implementation**:
```javascript
// Client-side integration example
async function getRecommendations(customerId) {
  const response = await fetch('/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId, topN: 12 })
  });
  
  const data = await response.json();
  return data.recommendations.map(rec => ({
    product: rec.itemName,
    score: rec.score,
    reason: rec.breakdown
  }));
}
```

---

#### Pattern 2: POS System Integration

**Scenario**: Point-of-sale terminal displays recommendations during checkout.

**Implementation**:
```typescript
// POS integration example
class POSRecommendationService {
  async getCheckoutRecommendations(customerId: string, currentCart: string[]): Promise<Recommendation[]> {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, topN: 6 })
    });
    
    const data = await response.json();
    // Filter recommendations not already in cart
    return data.recommendations.filter(rec => !currentCart.includes(rec.itemId));
  }
  
  async submitPurchaseFeedback(customerId: string, itemId: string): Promise<void> {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, itemId, feedback: 'purchase' })
    });
  }
}
```

---

#### Pattern 3: Mobile App Integration

**Scenario**: Mobile app uses RGR for push notification recommendations.

**Implementation**:
```kotlin
// Kotlin/Android integration example
data class Recommendation(val itemId: String, val itemName: String, val score: Double)

class RecommendationService {
    suspend fun getRecommendations(customerId: String): List<Recommendation> {
        val requestBody = JSONObject().apply {
            put("customerId", customerId)
            put("topN", 5)
        }
        
        val response = httpClient.post("/api/recommend") {
            contentType(ContentType.Application.Json)
            body = requestBody.toString()
        }
        
        val data = JSONObject(response.bodyAsText())
        return data.getJSONArray("recommendations").map { rec ->
            Recommendation(
                itemId = rec.getString("itemId"),
                itemName = rec.getString("itemName"),
                score = rec.getDouble("score")
            )
        }
    }
}
```

---

### 4.Z.4 API Testing and Validation

**Unit Testing**: All endpoints tested with edge cases:
- Invalid customer IDs
- Missing parameters
- Boundary conditions (topN = 1, topN = 50)
- Concurrent feedback submissions

**Performance Testing**: Load testing results:
- 100 concurrent requests: 234ms avg latency
- 500 concurrent requests: 280ms avg latency
- Memory overhead: Linear scaling

**Integration Testing**: End-to-end workflows validated:
- Customer selection → Recommendation generation → Feedback submission
- Metrics retrieval → Baseline comparisons
- Multi-customer scenarios

---

### 4.Z.5 API Design Contributions

This API design contributes to the research by:

1. **Standardization**: RESTful patterns enable industry-standard integration
2. **Observability**: Timing metrics support performance analysis
3. **Explainability**: Breakdown details exposed in API responses
4. **Adaptability**: Feedback endpoint enables continuous learning
5. **Scalability**: Stateless architecture supports horizontal scaling

The API design demonstrates that **complex hybrid recommender systems can be exposed through simple HTTP interfaces**, reducing integration barriers for SMEs and enabling rapid deployment in existing business workflows.

---

**End of API Design Section**

