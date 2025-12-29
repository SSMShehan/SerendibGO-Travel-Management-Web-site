# SerendibGo Frontend

Frontend application for the SerendibGo travel booking platform built with React, DaisyUI, and Tailwind CSS.

## Features

- 🎨 **Modern UI/UX** - Built with DaisyUI and Tailwind CSS
- 📱 **Responsive Design** - Mobile-first approach with desktop optimization
- 🔐 **Authentication** - Complete login/register system with role-based access
- 🎯 **Role-Based Dashboards** - Different interfaces for tourists, guides, hotel owners, etc.
- 💬 **AI Chatbot** - Interactive assistant for customer support
- 🔔 **Real-time Notifications** - Toast notifications and notification center
- 🗺️ **Tour Management** - Browse, search, and book tours
- 💳 **Payment Integration** - Stripe payment processing
- 🌐 **Multi-language Ready** - Prepared for Sinhala, Tamil, English support

## Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + DaisyUI
- **State Management**: React Context + React Query
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on port 5000

## Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
   VITE_GEMINI_API_KEY=your-gemini-api-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (LoadingSpinner, etc.)
│   ├── layout/         # Layout components (Header, Footer, Layout)
│   └── chatbot/        # AI chatbot components
├── context/            # React Context providers
│   ├── AuthContext.jsx
│   ├── TourContext.jsx
│   └── NotificationContext.jsx
├── pages/              # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Tours.jsx
│   ├── Dashboard.jsx
│   └── admin/          # Admin-specific pages
├── services/           # API services
│   ├── api.js
│   └── authService.js
├── styles/             # Global styles
│   └── globals.css
├── App.jsx             # Main App component
└── main.jsx           # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features Overview

### Authentication System
- User registration with role selection
- Secure login with JWT tokens
- Password reset functionality
- Email verification
- Role-based access control

### User Roles
- **Tourist** - Browse and book tours
- **Hotel Owner** - Manage hotels and bookings
- **Guide** - Manage tour packages
- **Driver** - Manage vehicles and bookings
- **Staff** - Support role with limited access
- **Admin** - Full system administration

### UI Components
- Responsive navigation with mobile menu
- Beautiful hero sections with gradients
- Card-based layouts for tours and content
- Form components with validation
- Loading states and error handling
- Toast notifications
- Interactive chatbot

### Styling
- Custom DaisyUI theme (serendibgo)
- Blue color scheme with accent colors
- Smooth animations and transitions
- Mobile-first responsive design
- Custom CSS utilities
- Gradient backgrounds and effects

## API Integration

The frontend communicates with the backend API through:
- **Authentication**: Login, register, profile management
- **Tours**: Browse, search, view details
- **Bookings**: Create and manage bookings
- **Payments**: Stripe integration for secure payments
- **Notifications**: Real-time updates and alerts

## Development

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation if needed

### Adding New Components
1. Create component in appropriate `src/components/` subdirectory
2. Export from component file
3. Import and use in pages

### Styling Guidelines
- Use DaisyUI classes for consistent styling
- Follow Tailwind CSS utility-first approach
- Use custom CSS classes for complex animations
- Maintain responsive design principles

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting platform:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting service

3. **Update environment variables** for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
