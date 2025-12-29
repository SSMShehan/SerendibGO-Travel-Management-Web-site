# SerendibGo Backend API

Backend API for the SerendibGo travel booking platform built with Node.js, Express.js, and MongoDB.

## Features

- 🔐 JWT-based authentication with role-based access control
- 👥 Multi-role user system (Tourist, Hotel Owner, Guide, Driver, Staff, Admin)
- 🏨 Tour and accommodation management
- 📅 Booking system with real-time availability
- 💳 Stripe payment integration
- 📧 Email notifications (verification, booking confirmations)
- 🤖 Gemini AI chatbot integration
- 🗺️ Google Maps integration
- 📱 Push notifications support
- 🔒 Security middleware (helmet, rate limiting, CORS)
- 📊 Comprehensive error handling and validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **Payments**: Stripe
- **AI**: Google Gemini
- **Security**: Helmet, CORS, Rate Limiting, Input Sanitization

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- Stripe account
- Google Gemini API key
- Gmail account for email service

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd serendibgo/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/serendibgo

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d

   # Email Service
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password

   # Stripe
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

   # Gemini AI
   GEMINI_API_KEY=your-gemini-api-key

   # Google Maps
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password
- `GET /api/auth/verify-email/:token` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email

### Health Check
- `GET /api/health` - API health status

## User Roles

1. **Tourist** - Browse and book tours
2. **Hotel Owner** - Manage hotels and rooms
3. **Guide** - Manage tour packages
4. **Driver** - Manage vehicles and bookings
5. **Staff** - Support role with limited admin access
6. **Admin** - Full system access

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input sanitization
- SQL injection prevention
- XSS protection with helmet
- Secure cookie settings

## Error Handling

The API uses comprehensive error handling with:
- Validation errors with detailed messages
- Custom error classes
- Global error handler
- Proper HTTP status codes
- Development vs production error responses

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Project Structure
```
src/
├── controllers/     # Route controllers
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── services/        # External services
├── utils/           # Utility functions
└── config/          # Configuration files
```

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

1. Set `NODE_ENV=production` in environment variables
2. Update MongoDB URI for production
3. Configure production email service
4. Set up Stripe webhooks
5. Deploy to your preferred platform (Heroku, AWS, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

