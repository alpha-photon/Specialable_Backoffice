# 🏢 SpecialAble Backoffice Portal

Complete admin dashboard for managing the SpecialAble platform.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📋 Features

- ✅ **Dashboard** - Platform statistics and analytics
- ✅ **User Management** - View, edit, block/unblock users
- ✅ **Content Moderation** - Approve/reject posts and comments
- ✅ **Chat Moderation** - Manage chat rooms and messages
- ✅ **Therapist Management** - Verify and manage therapist profiles
- ✅ **Children Management** - View all children/patients
- ✅ **Appointments** - Manage all appointments
- ✅ **Analytics** - Platform-wide analytics and reports
- ✅ **Settings** - Platform configuration

## 🔐 Authentication

This portal requires admin role. Login with admin credentials to access.

## 🌐 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8000/api
```

## 📁 Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── services/      # API services
├── hooks/         # Custom React hooks
├── lib/           # Utilities and API client
├── types/         # TypeScript types
└── utils/         # Helper functions
```

## 🛠️ Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Axios

## 📝 Notes

- This is a separate frontend from the main `specialable-connect` app
- Uses dark theme by default (better for admin portals)
- All routes are protected and require admin authentication
