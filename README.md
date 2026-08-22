# GlobalMarket.com - Broker Investment Platform

A modern, full-featured investment brokerage platform built with Node.js, React, and PostgreSQL.

## Features

- **User Authentication & Account Management**: Secure JWT-based authentication with role-based access control
- **Portfolio Management**: Track holdings, performance, and asset allocation
- **Trading Engine**: Buy/sell stocks, options, and other securities with real-time order management
- **Market Data**: Real-time quotes, charts, and market analysis
- **Wallet Management**: Fund accounts, withdraw funds, and track transaction history
- **Admin Dashboard**: Monitor platform activity and manage users
- **Risk Management**: Position limits, margin requirements, and compliance checks

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** for data persistence
- **JWT** for authentication
- **WebSocket** for real-time updates
- **Redis** for caching and session management

### Frontend
- **React** with TypeScript
- **Redux** for state management
- **Material-UI** for component library
- **Chart.js** for data visualization
- **WebSocket** client for real-time updates

### DevOps
- **Docker** for containerization
- **Docker Compose** for orchestration
- **Environment configuration** for multiple environments

## Project Structure

```
GlobalMarket.com/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── app.js          # Express app setup
│   ├── migrations/         # Database migrations
│   ├── seeds/             # Database seeders
│   ├── .env.example       # Environment variables template
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # Redux store
│   │   ├── types/         # TypeScript types
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/            # Static files
│   └── package.json
├── docker-compose.yml     # Multi-container setup
├── .gitignore
└── LICENSE
```

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v13+)
- Docker & Docker Compose (optional)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jihanwu182-cpu/GlobalMarket.com.git
cd GlobalMarket.com
```

2. Set up backend:
```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm start
```

3. Set up frontend:
```bash
cd frontend
npm install
npm start
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/docs

### Docker Setup

```bash
docker-compose up --build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/accounts` - Get user accounts

### Portfolio
- `GET /api/portfolio/holdings` - Get portfolio holdings
- `GET /api/portfolio/performance` - Get portfolio performance metrics
- `GET /api/portfolio/allocation` - Get asset allocation

### Trading
- `POST /api/trades/order` - Create new order
- `GET /api/trades/orders` - Get user orders
- `PUT /api/trades/orders/:id` - Cancel/modify order
- `GET /api/trades/history` - Get trade history

### Market Data
- `GET /api/market/quotes/:symbol` - Get stock quote
- `GET /api/market/chart/:symbol` - Get price chart data
- `GET /api/market/search` - Search securities

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/withdraw` - Withdraw funds
- `GET /api/wallet/transactions` - Get transaction history

## Database Schema

Key tables:
- `users` - User accounts
- `accounts` - Trading accounts
- `portfolio_holdings` - Current positions
- `orders` - Trade orders
- `trades` - Executed trades
- `market_data` - Stock quotes and data
- `transactions` - Fund transfers
- `audit_logs` - System audit trail

## Security

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention with parameterized queries
- CORS protection
- Rate limiting on API endpoints
- HTTPS/TLS encryption
- Compliance audit logging

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### Code Quality
```bash
npm run lint
npm run format
```

## Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@globalmarket.com or open an issue in the GitHub repository.

## Roadmap

- [ ] Real-time market data integration
- [ ] Advanced charting with TradingView
- [ ] Options trading
- [ ] Cryptocurrency support
- [ ] Mobile application
- [ ] AI-powered portfolio recommendations
- [ ] Social trading features
- [ ] Algorithmic trading (paper trading first)
