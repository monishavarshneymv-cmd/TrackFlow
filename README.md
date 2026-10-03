# TrackFlow — Fleet & Delivery Management System

TrackFlow is a lightweight, beginner-readable Spring Boot REST API for managing fleet operations, drivers, trips, deliveries, and system users with role-based access control.

---

## 1. Overview & Features

- **Fleet Management:** Complete lifecycle tracking of vehicles with search and filtering by status and vehicle type.
- **Driver Management:** Driver records, contact details, licensing, and search functionality.
- **Trip Scheduling:** Multi-stop and point-to-point trip coordination linking verified vehicles and drivers.
- **Delivery Tracking:** Order assignment to trips with unique tracking numbers and status tracking.
- **Security & Authorization:** Role-based access control (`ADMIN`, `MANAGER`, `OPERATOR`) using HTTP Basic Authentication and BCrypt hashed passwords.
- **Data Validation & Error Handling:** Jakarta Bean Validation coupled with centralized exception handling returning uniform JSON error responses.

---

## 2. Tech Stack

- **Language:** Java 21 / 17 (OpenJDK)
- **Framework:** Spring Boot 3.3.4
  - Spring Web (REST API)
  - Spring Data JPA (Data persistence)
  - Spring Security (Authentication & authorization)
  - Jakarta Bean Validation (Hibernate Validator)
- **Database:** PostgreSQL 16
- **Build Tool:** Apache Maven 3.10.0
- **Testing:** JUnit 5, Spring Boot Test, Spring Security Test, MockMvc, H2 (test-scope)

---

## 3. Architecture

TrackFlow adheres to a standard 3-tier layered architecture with constructor dependency injection:

```
Client (HTTP / cURL / Postman)
  │
  ▼
Controller Layer (com.trackflow.controller)
  │  - Exposes REST endpoints, validates DTO inputs (@Valid)
  ▼
Service Layer (com.trackflow.service)
  │  - Enforces business logic, relational integrity, exception throwing
  ▼
Repository Layer (com.trackflow.repository)
  │  - Spring Data JPA interfaces, JPQL search/filtering queries
  ▼
Database (PostgreSQL)
```

---

## 4. Project Structure

```
src/main/java/com/trackflow/
├── TrackflowApplication.java         # Main Spring Boot entry point
├── config/
│   ├── DataInitializer.java         # Seeds initial development data on startup
│   └── SecurityConfig.java          # SecurityFilterChain and endpoint authorizations
├── controller/
│   ├── DeliveryController.java      # /api/deliveries REST controller
│   ├── DriverController.java        # /api/drivers REST controller
│   ├── TripController.java          # /api/trips REST controller
│   └── VehicleController.java       # /api/vehicles REST controller
├── dto/
│   ├── DeliveryRequest.java / DeliveryResponse.java
│   ├── DriverRequest.java / DriverResponse.java
│   ├── TripRequest.java / TripResponse.java
│   └── VehicleRequest.java / VehicleResponse.java
├── entity/
│   ├── Delivery.java (DeliveryStatus)
│   ├── Driver.java (DriverStatus)
│   ├── Trip.java (TripStatus)
│   ├── User.java (UserRole)
│   └── Vehicle.java (VehicleStatus)
├── exception/
│   ├── GlobalExceptionHandler.java  # @RestControllerAdvice centralized error handling
│   ├── ErrorResponse.java           # Standard error response JSON payload
│   └── *NotFoundException, DuplicateResourceException, BadRequestException
├── repository/
│   ├── DeliveryRepository.java
│   ├── DriverRepository.java
│   ├── TripRepository.java
│   ├── UserRepository.java
│   └── VehicleRepository.java
├── security/
│   ├── CustomAccessDeniedHandler.java
│   ├── CustomAuthenticationEntryPoint.java
│   └── CustomUserDetailsService.java
└── service/
    ├── DeliveryService.java
    ├── DriverService.java
    ├── TripService.java
    └── VehicleService.java
```

---

## 5. Database

### Database Environment Details
- **Engine:** PostgreSQL 16
- **Database Name:** `trackflow_db`
- **Default Host / Port:** `localhost:5432`

### Entity Relationship Model

```
User
|
+-- authentication/role

Vehicle ----< Trip >---- Driver
                |
                v
            Delivery
```

### Tables, Keys, and Constraints

1. **`users`**
   - `id`: `BIGINT` (Primary Key, auto-increment)
   - `username`: `VARCHAR(255)` (NOT NULL, **UNIQUE**)
   - `password`: `VARCHAR(255)` (NOT NULL, BCrypt hashed)
   - `role`: `VARCHAR(50)` (NOT NULL: `ADMIN`, `MANAGER`, `OPERATOR`)

2. **`vehicles`**
   - `id`: `BIGINT` (Primary Key, auto-increment)
   - `vehicle_number`: `VARCHAR(255)` (NOT NULL, **UNIQUE**)
   - `vehicle_type`: `VARCHAR(255)` (NOT NULL, e.g. `TRUCK`, `VAN`)
   - `model`: `VARCHAR(255)` (NOT NULL)
   - `capacity`: `DOUBLE PRECISION` (NOT NULL, must be positive)
   - `status`: `VARCHAR(50)` (NOT NULL, default `AVAILABLE`)
   - `created_at`: `TIMESTAMP` (NOT NULL, non-updatable)
   - `updated_at`: `TIMESTAMP`

3. **`drivers`**
   - `id`: `BIGINT` (Primary Key, auto-increment)
   - `name`: `VARCHAR(255)` (NOT NULL)
   - `phone`: `VARCHAR(255)` (NOT NULL)
   - `license_number`: `VARCHAR(255)` (NOT NULL, **UNIQUE**)
   - `status`: `VARCHAR(50)` (NOT NULL, default `AVAILABLE`)
   - `created_at`: `TIMESTAMP` (NOT NULL, non-updatable)
   - `updated_at`: `TIMESTAMP`

4. **`trips`**
   - `id`: `BIGINT` (Primary Key, auto-increment)
   - `vehicle_id`: `BIGINT` (**Foreign Key** referencing `vehicles(id)`, NOT NULL)
   - `driver_id`: `BIGINT` (**Foreign Key** referencing `drivers(id)`, NOT NULL)
   - `source`: `VARCHAR(255)` (NOT NULL)
   - `destination`: `VARCHAR(255)` (NOT NULL)
   - `start_date`: `TIMESTAMP` (NOT NULL)
   - `expected_end_date`: `TIMESTAMP`
   - `status`: `VARCHAR(50)` (NOT NULL, default `PLANNED`)
   - *Relationships:* Many Trips → One Vehicle; Many Trips → One Driver.

5. **`deliveries`**
   - `id`: `BIGINT` (Primary Key, auto-increment)
   - `tracking_number`: `VARCHAR(255)` (NOT NULL, **UNIQUE**)
   - `trip_id`: `BIGINT` (**Foreign Key** referencing `trips(id)`, NOT NULL)
   - `customer_name`: `VARCHAR(255)` (NOT NULL)
   - `delivery_address`: `VARCHAR(255)` (NOT NULL)
   - `scheduled_date`: `TIMESTAMP` (NOT NULL)
   - `status`: `VARCHAR(50)` (NOT NULL, default `PENDING`)
   - *Relationships:* Many Deliveries → One Trip.

### Status Enums
- **`UserRole`:** `ADMIN`, `MANAGER`, `OPERATOR`
- **`VehicleStatus`:** `AVAILABLE`, `IN_USE`, `MAINTENANCE`, `INACTIVE`
- **`DriverStatus`:** `AVAILABLE`, `ON_TRIP`, `INACTIVE`
- **`TripStatus`:** `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- **`DeliveryStatus`:** `PENDING`, `ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`

### Seed Data & External Dataset Notice
- **External Dataset / API Status:** **NO external dataset, external API, or third-party cloud database was used.**
- **Origin of Data:** All initial records are **application-generated seed data** created on startup by [`DataInitializer`](file:///Users/monishavarshney/Desktop/tackFlow/src/main/java/com/trackflow/config/DataInitializer.java).
- **Seed Contents:**
  - 3 initial users (`admin`, `manager`, `operator`) with hashed passwords.
  - 3 vehicles (`UP16-AB-1234`, `MH02-CD-5678`, `DL01-EF-9012`).
  - 3 drivers (`Rahul Sharma`, `Priya Singh`, `Amit Kumar`).
  - 3 trips connecting seeded vehicles and drivers.
  - 4 deliveries associated with the seeded trips.

---

## 6. Database Setup & Configuration

### Prerequisites & Starting PostgreSQL Locally
On macOS (via Homebrew):
```bash
# Start PostgreSQL 16 service
brew services start postgresql@16
```

### Database Creation
Run using `psql`:
```bash
# Connect to postgres server and create the database
psql -U postgres -c "CREATE DATABASE trackflow_db;"
```

### Environment Variable & Credential Management
Application settings use safe development defaults with environment variable overrides:
```properties
spring.datasource.url=jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:trackflow_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
```

For custom environments or production, export environment variables without committing credentials:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=trackflow_db
export DB_USERNAME=your_db_username
export DB_PASSWORD=your_secure_password
```

---

## 7. Sample Credentials (Development Only)

> [!WARNING]
> **DEVELOPMENT-ONLY CREDENTIALS:** The following credentials are provided strictly for local development, evaluation, and automated testing. They must not be used in any production environment.

| Username | Password | Role | Permissions |
|---|---|---|---|
| `admin` | `admin123` | `ADMIN` | Full CRUD across all resources |
| `manager` | `manager123` | `MANAGER` | Full CRUD on Vehicles, Drivers, Trips; Read on Deliveries |
| `operator` | `operator123` | `OPERATOR` | Read on Vehicles, Drivers, Trips; Create/Update/Read on Deliveries |

Authentication is performed via HTTP Basic Authentication (`Authorization: Basic <base64>`).

---

## 8. API Endpoints

| Method | Endpoint | Purpose | Required Role |
|---|---|---|---|
| `POST` | `/api/vehicles` | Create a new vehicle | `ADMIN`, `MANAGER` |
| `GET` | `/api/vehicles` | List vehicles (filter: `?status=`, `?vehicleType=`, `?search=`) | `ADMIN`, `MANAGER`, `OPERATOR` |
| `GET` | `/api/vehicles/{id}` | Get vehicle details by ID | `ADMIN`, `MANAGER`, `OPERATOR` |
| `PUT` | `/api/vehicles/{id}` | Update existing vehicle | `ADMIN`, `MANAGER` |
| `DELETE` | `/api/vehicles/{id}` | Delete vehicle | `ADMIN`, `MANAGER` |
| `POST` | `/api/drivers` | Register a new driver | `ADMIN`, `MANAGER` |
| `GET` | `/api/drivers` | List drivers (search: `?search=`) | `ADMIN`, `MANAGER`, `OPERATOR` |
| `GET` | `/api/drivers/{id}` | Get driver details by ID | `ADMIN`, `MANAGER`, `OPERATOR` |
| `PUT` | `/api/drivers/{id}` | Update existing driver | `ADMIN`, `MANAGER` |
| `DELETE` | `/api/drivers/{id}` | Delete driver | `ADMIN`, `MANAGER` |
| `POST` | `/api/trips` | Create new trip with verified vehicle & driver | `ADMIN`, `MANAGER` |
| `GET` | `/api/trips` | List all trips | `ADMIN`, `MANAGER`, `OPERATOR` |
| `GET` | `/api/trips/{id}` | Get trip details by ID | `ADMIN`, `MANAGER`, `OPERATOR` |
| `PUT` | `/api/trips/{id}` | Update trip | `ADMIN`, `MANAGER` |
| `DELETE` | `/api/trips/{id}` | Delete trip | `ADMIN`, `MANAGER` |
| `POST` | `/api/deliveries` | Create delivery tied to an existing trip | `ADMIN`, `OPERATOR` |
| `GET` | `/api/deliveries` | List deliveries (filter: `?status=`) | `ADMIN`, `MANAGER`, `OPERATOR` |
| `GET` | `/api/deliveries/{id}` | Get delivery details by ID | `ADMIN`, `MANAGER`, `OPERATOR` |
| `PUT` | `/api/deliveries/{id}` | Update delivery details | `ADMIN`, `OPERATOR` |
| `DELETE` | `/api/deliveries/{id}` | Remove delivery | `ADMIN` |

---

## 9. Example JSON Requests

### 1. Create Vehicle (`POST /api/vehicles`)
```bash
curl -u manager:manager123 -X POST http://localhost:8080/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleNumber": "KA05-MN-7788",
    "vehicleType": "ELECTRIC_VAN",
    "model": "Tata Ace EV",
    "capacity": 1000.0,
    "status": "AVAILABLE"
  }'
```

### 2. Create Trip (`POST /api/trips`)
```bash
curl -u manager:manager123 -X POST http://localhost:8080/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "driverId": 1,
    "source": "Bengaluru",
    "destination": "Mysuru",
    "startDate": "2026-10-04T08:00:00",
    "expectedEndDate": "2026-10-04T14:00:00",
    "status": "PLANNED"
  }'
```

### 3. Create Delivery (`POST /api/deliveries`)
```bash
curl -u operator:operator123 -X POST http://localhost:8080/api/deliveries \
  -H "Content-Type: application/json" \
  -d '{
    "trackingNumber": "TRK-BLR-001",
    "tripId": 1,
    "customerName": "Ananya Hegde",
    "deliveryAddress": "15 Vijayanagar, Mysuru",
    "scheduledDate": "2026-10-04T13:00:00",
    "status": "PENDING"
  }'
```

---

## 10. How to Run & Test

### Run All Tests
```bash
mvn clean test
```

### Start the Application
```bash
mvn spring-boot:run
```

Or run the packaged JAR directly:
```bash
java -jar target/trackflow-0.0.1-SNAPSHOT.jar
```

The server starts on `http://localhost:8080`.

---

## 11. GitHub Repository & Git Usage

### Commit & Push Steps
```bash
# Check git status
git status

# Stage changes
git add .

# Commit with a descriptive message
git commit -m "Initial TrackFlow backend implementation"

# Add remote and push (replace <USERNAME> with your GitHub handle)
git remote add origin https://github.com/<USERNAME>/TrackFlow.git
git branch -M main
git push -u origin main
```

---

## 12. Known Limitations

- **Stateless HTTP Basic Authentication:** Designed for clean, simple interview evaluation. In high-scale distributed production environments, JWT or OAuth2 bearer tokens would typically be utilized.
- **Relational Integrity on Deletion:** Attempting to delete a vehicle or driver associated with active trips will be rejected by database foreign key constraints as intended.
