# PersonalMoneyManagement 💰

A comprehensive personal finance management application inspired by 鲨鱼记账 (Shark Accounting), built with modern full-stack technologies.

## 🎯 Project Overview

PersonalMoneyManagement is a full-featured finance tracker that helps users manage:
- ✅ Income & Expense Tracking with customizable categories
- 📈 Investment Portfolio (stocks, ETFs) with real-time price updates
- 💎 Net Worth Management (assets & liabilities)
- 🏦 Loan Calculator with amortization schedules
- 📅 Calendar View for visual transaction browsing
- 🤖 AI-powered transaction categorization

**Design Philosophy:** Clean, yellow-themed UI inspired by 鲨鱼记账, focusing on simplicity and visual clarity.

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.2.1
- **Language:** Java 17
- **Database:** MySQL 8.0
- **Cache:** Redis 7.x
- **Security:** Spring Security + JWT
- **ORM:** Spring Data JPA + Hibernate
- **API Docs:** SpringDoc OpenAPI 3
- **Build Tool:** Maven

### Data Service
- **Framework:** Python 3.11 + FastAPI
- **Scraping:** yfinance + BeautifulSoup4
- **Scheduler:** APScheduler
- **Cache:** Redis integration

### Frontend
- **Framework:** Angular 17
- **Language:** TypeScript 5.x
- **UI Library:** Angular Material
- **State Management:** NgRx (planned)
- **Charts:** Chart.js
- **Styling:** SCSS with custom yellow theme

### DevOps
- **Containerization:** Docker + Docker Compose
- **Database Migration:** Flyway
- **CI/CD:** GitHub Actions (planned)

---

## 📁 Project Structure

```
PersonalMoneyManagement/
├── backend/                    # Spring Boot API
│   ├── src/main/java/com/moneyflow/
│   │   ├── config/             # Configuration classes
│   │   ├── controller/         # REST controllers
│   │   ├── model/
│   │   │   ├── entity/         # JPA entities
│   │   │   └── dto/            # Request/Response DTOs
│   │   ├── repository/         # Spring Data repositories
│   │   ├── security/           # JWT & security
│   │   ├── service/            # Business logic
│   │   └── exception/          # Exception handling
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── db/migration/       # Flyway SQL scripts
│   └── pom.xml
│
├── python-service/             # Stock price scraper
│   ├── app/
│   │   ├── main.py             # FastAPI app
│   │   ├── scraper/            # Yahoo Finance scraper
│   │   └── cache/              # Redis cache
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Angular SPA
│   ├── src/app/
│   │   ├── core/               # Singleton services
│   │   ├── features/           # Feature modules
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   │   └── calendar-view/  # Key feature!
│   │   │   ├── investments/
│   │   │   ├── net-worth/
│   │   │   └── auth/
│   │   └── shared/             # Shared components
│   ├── package.json
│   └── angular.json
│
├── docker-compose.yml          # Multi-container setup
├── IMPLEMENTATION_GUIDE.md     # Detailed implementation steps
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+ & npm
- Python 3.11+
- MySQL 8.0
- Redis 7.x
- Docker & Docker Compose (optional)

### Option 1: Run with Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/PersonalMoneyManagement.git
cd PersonalMoneyManagement

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
# Python API: http://localhost:8000/docs
```

### Option 2: Run Locally

#### 1. Database Setup
```bash
# Install and start MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE moneyflow;
CREATE USER 'moneyflow_user'@'localhost' IDENTIFIED BY 'moneyflow_pass';
GRANT ALL PRIVILEGES ON moneyflow.* TO 'moneyflow_user'@'localhost';
FLUSH PRIVILEGES;
```

#### 2. Start Redis
```bash
redis-server
```

#### 3. Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run

# API will be available at http://localhost:8080
```

#### 4. Python Service
```bash
cd python-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# API will be available at http://localhost:8000
```

#### 5. Frontend
```bash
cd frontend
npm install
ng serve

# Application will be available at http://localhost:4200
```

---

## 📊 Database Schema

The application uses 8 main tables:

1. **users** - User accounts
2. **custom_categories** - Income/expense categories
3. **transactions** - Income and expense records
4. **investments** - Stock/ETF portfolio
5. **investment_transactions** - Buy/sell history
6. **assets** - Cash, real estate, vehicles
7. **loans** - Mortgages, car loans, etc.
8. **loan_payments** - Payment tracking

All migrations are managed by Flyway in `/backend/src/main/resources/db/migration/`.

---

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Registration
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "currencyCode": "CAD"
}
```

### Login
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response includes a JWT token to be used in subsequent requests:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Using the Token
```bash
GET /api/v1/transactions
Authorization: Bearer {token}
```

---

## 📱 Key Features

### 1. Calendar View (Signature Feature)
- Monthly calendar grid showing daily income/expense
- Visual color coding (green for income, red for expense)
- Bottom sheet detail view on day click
- Week/Month/Year view toggle
- Inspired by 鲨鱼记账's elegant design

### 2. Investment Portfolio
- Real-time stock prices via Yahoo Finance
- Automatic P&L calculation
- Pie chart allocation visualization
- Buy/sell transaction history

### 3. Net Worth Tracking
- Assets (cash, investments, real estate)
- Liabilities (loans with progress bars)
- Auto-sync with investment portfolio
- Historical trend charts

### 4. Loan Calculator
- Monthly payment calculation
- Amortization schedule generation
- Progress visualization
- Extra payment tracking

---

## 🎨 Design System

### Color Palette
```scss
$primary-yellow: #F5D547;      // Main brand color
$primary-yellow-light: #FFF8DC; // Highlights
$success-green: #4CAF50;        // Income/profit
$danger-red: #F44336;           // Expense/loss
$info-blue: #2196F3;            // Information
```

### Typography
- Clean, sans-serif fonts
- Large numbers for key metrics
- Hierarchical headings

### Layout
- Card-based design with rounded corners
- Bottom tab navigation (5 tabs)
- Yellow floating action button for quick add
- Mobile-first responsive design

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

### Transactions
- `GET /api/v1/transactions` - List all (paginated)
- `POST /api/v1/transactions` - Create transaction
- `GET /api/v1/transactions/{id}` - Get details
- `PUT /api/v1/transactions/{id}` - Update
- `DELETE /api/v1/transactions/{id}` - Delete
- `GET /api/v1/transactions/calendar?month=2024-12` - Calendar data

### Investments
- `GET /api/v1/investments/portfolio` - Portfolio summary
- `POST /api/v1/investments` - Add investment
- `POST /api/v1/investments/{id}/buy` - Record purchase
- `POST /api/v1/investments/{id}/sell` - Record sale
- `GET /api/v1/investments/refresh` - Refresh prices

### Net Worth
- `GET /api/v1/networth` - Net worth summary
- `GET /api/v1/assets` - List assets
- `POST /api/v1/assets` - Add asset
- `GET /api/v1/loans` - List loans
- `POST /api/v1/loans` - Add loan

### Stock Prices (Python Service)
- `GET /api/stocks/{symbol}` - Get current price
- `GET /api/stocks/batch?symbols=AAPL,GOOGL` - Batch prices

Full API documentation available at `/swagger-ui.html` when backend is running.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
npm run e2e  # End-to-end tests
```

### API Testing with Postman
Import the Postman collection from `/docs/postman_collection.json` (to be added).

---

## 🚧 Development Status

### ✅ Completed
- [x] Database schema design
- [x] Entity models and repositories
- [x] Security configuration (JWT)
- [x] Authentication service & controller
- [x] Category management
- [x] CORS configuration
- [x] Project structure

### ⏳ In Progress
- [ ] Transaction service & controller
- [ ] Investment service & controller
- [ ] Net worth calculation service
- [ ] Loan calculator service
- [ ] Python stock scraper
- [ ] Angular frontend

### 📋 Todo
- [ ] AI categorization integration
- [ ] Frontend calendar view component
- [ ] Charts and data visualization
- [ ] Docker deployment
- [ ] Unit and integration tests
- [ ] CI/CD pipeline
- [ ] Production deployment

---

## 🤝 Contributing

This is a portfolio project, but suggestions and feedback are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- LinkedIn: [linkedin.com/in/yourprofile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Design inspiration from 鲨鱼记账 (Shark Accounting)
- Stock price data from Yahoo Finance
- Icons from Material Design Icons
- Community support from Spring Boot and Angular communities

---

## 📚 Additional Documentation

- [Implementation Guide](IMPLEMENTATION_GUIDE.md) - Detailed development steps
- [API Documentation](http://localhost:8080/swagger-ui.html) - Interactive API docs (when running)
- [Database Schema](backend/src/main/resources/db/migration/) - Flyway migration scripts

---

**Built with ❤️ for demonstrating full-stack Java development skills**
