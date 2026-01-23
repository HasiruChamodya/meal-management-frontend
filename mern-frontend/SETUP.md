# Hospital Meal Management System - Frontend Setup Guide

## Project Structure

```
mern-frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.js          # Authentication context and logic
│   ├── pages/
│   │   ├── HomePage.js              # Home/Dashboard selector
│   │   ├── LoginPage.js             # Login page
│   │   ├── DietClerkPage.js         # Diet Clerk dashboard
│   │   ├── AdminPage.js             # Admin dashboard
│   │   ├── SubjectClerkPage.js      # Subject Clerk dashboard
│   │   ├── AccountantPage.js        # Accountant dashboard
│   │   ├── KitchenPage.js           # Kitchen display
│   │   ├── ForgotPasswordPage.js    # Forgot password page
│   │   └── ResetPasswordPage.js     # Reset password page
│   ├── App.js                       # Main app component
│   ├── App.css                      # Global styles
│   ├── index.js                     # React entry point
│   └── index.css                    # Global CSS
├── public/
│   └── index.html                   # HTML template
├── package.json                     # Dependencies
└── vite.config.js                   # Vite configuration

```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Step 1: Install Dependencies

```bash
cd mern-frontend
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Diet Clerk | dietclerk | Password123 |
| Admin | admin | Password123 |
| Subject Clerk | subjectclerk | Password123 |
| Accountant | accountant | Password123 |
| Kitchen Staff | kitchen | Password123 |

## Features Implemented

### Authentication
- Login page with show/hide password
- Forgot password functionality
- Reset password with validation
- Role-based access control
- Logout functionality

### Diet Clerk Dashboard
- Daily meal cycle entry form
- Meal counts by ward and diet type
- Lunch meal type selection
- Staff meal counts (breakfast, lunch, dinner)
- Extra items tracking

### Admin Dashboard (Coming Soon)
- User account management
- Ward management
- Ingredient management
- System settings

### Subject Clerk Dashboard (Coming Soon)
- Pricing management
- Purchase order revision
- Order submission

### Accountant Dashboard (Coming Soon)
- Purchase order approvals
- Change tracking and review
- Financial reports

### Kitchen Display (Coming Soon)
- Real-time meal display
- Recipe details
- Ingredient lists

## Color Scheme (Warm Sage Green)

- **Primary**: #7a9b7f (Warm Sage Green)
- **Background**: #faf8f3 (Warm Cream)
- **Foreground**: #4a4a4a (Dark Brown)
- **Success**: #6b9b6f (Warm Sage Success)
- **Warning**: #d4a574 (Warm Amber)
- **Destructive**: #d4845c (Warm Terracotta)

## API Integration

Replace mock authentication in `src/context/AuthContext.js` with real backend API calls:

```javascript
// Example: Replace mock login with API call
const login = async (username, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.token) {
      setUser(data.user);
      localStorage.setItem('hospital_user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login failed:', error);
    return false;
  }
};
```

## Backend API Endpoints Required

Create these endpoints in your Express backend:

```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/wards
POST   /api/wards

GET    /api/ingredients
POST   /api/ingredients

GET    /api/meal-entries
POST   /api/meal-entries

GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id/approve
```

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Environment Variables

Create a `.env` file in the root:

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Hospital Meal Management
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Copyright 2025 - All rights reserved
