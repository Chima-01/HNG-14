To develop locally:

```
npm install
vc dev
```

```
open http://localhost:3000
```

To build locally:

```
npm install
vc build
```

To deploy:

```
npm install
vc deploy
```

## API Endpoints

### GET /api/profiles

Fetch all profiles with support for filtering, sorting, and pagination.

#### Query Parameters

| Parameter | Type | Required | Description | Default |
|-----------|------|----------|-------------|---------|
| `gender` | string | No | Filter by gender: `male` or `female` | - |
| `age_group` | string | No | Filter by age group: `child`, `teenager`, `adult`, or `senior` | - |
| `country_id` | string | No | Filter by country (2-letter ISO country code) | - |
| `min_age` | number | No | Minimum age filter | - |
| `max_age` | number | No | Maximum age filter | - |
| `min_gender_probability` | number | No | Minimum gender prediction probability (0-1) | - |
| `min_country_probability` | number | No | Minimum country prediction probability (0-1) | - |
| `sort_by` | string | No | Sort results by: `age`, `created_at`, or `gender_probability` | - |
| `order` | string | No | Sort order: `asc` or `desc` | - |
| `page` | number | No | Page number for pagination | 1 |
| `limit` | number | No | Number of results per page (max 50) | 10 |

#### Request Example

```bash
GET http://localhost:3000/api/profiles?gender=male&age_group=adult&page=1&limit=10
```

#### Success Response (200)

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 42,
  "data": [
    {
      "id": "unique-uuid-v7",
      "name": "john",
      "gender": "male",
      "gender_probability": 0.95,
      "age": 28,
      "age_group": "adult",
      "country_id": "US",
      "country_name": "United States",
      "country_probability": 0.87,
      "created_at": "2024-04-27T10:30:00.000Z"
    }
  ]
}
```

#### Error Responses

**400 - Bad Request**
```json
{
  "status": "error",
  "message": "Invalid parameter type"
}
```

**404 - Not Found**
```json
{
  "status": "error",
  "message": "No profile found"
}
```

**500 - Server Error**
```json
{
  "status": "error",
  "message": "Server failure"
}
```

---

### GET /api/profiles/search

Search for profiles using natural language queries. The endpoint intelligently parses human-readable queries and converts them into filters.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Natural language search query |

#### Supported Query Patterns

The search endpoint understands various natural language patterns:

- **Gender**: "male", "males", "female", "females"
- **Age Groups**: "child", "teenager", "adult", "senior"
- **Age Range**: "above 18", "at least 25", "below 30", "at most 50", "young"
- **Country**: "from Nigeria", "from United States", "from Canada"
- **Combined**: "males from Nigeria above 25"

#### Request Examples

```bash
# Simple gender filter
GET http://localhost:3000/api/profiles/search?q=female

# Age range search
GET http://localhost:3000/api/profiles/search?q=above%2025

# Combined search
GET http://localhost:3000/api/profiles/search?q=males%20from%20Nigeria%20above%2018

# Age group
GET http://localhost:3000/api/profiles/search?q=young%20adults
```

#### Success Response (200)

```json
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 18,
  "data": [
    {
      "id": "unique-uuid-v7",
      "name": "ada",
      "gender": "female",
      "gender_probability": 0.92,
      "age": 32,
      "age_group": "adult",
      "country_id": "NG",
      "country_name": "Nigeria",
      "country_probability": 0.89,
      "created_at": "2024-04-27T11:15:00.000Z"
    }
  ]
}
```

#### Error Responses

**400 - Bad Request** (Missing or empty query)
```json
{
  "status": "error",
  "message": "Missing or empty parameter"
}
```

**422 - Unprocessable Entity** (Unable to interpret query)
```json
{
  "status": "error",
  "message": "Unable to Interpret query"
}
```

**404 - Not Found** (No matching profiles)
```json
{
  "status": "error",
  "message": "No profile found"
}
```

**500 - Server Error**
```json
{
  "status": "error",
  "message": "Server failure"
}
```
