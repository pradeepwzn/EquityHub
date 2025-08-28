# 🚀 Startup Value Simulator - Setup Guide

## ✅ What's Already Done

- ✅ Node.js v22.18.0 installed via nvm
- ✅ npm v10.9.3 installed
- ✅ Project dependencies installed
- ✅ Security vulnerabilities fixed
- ✅ Development server running on http://localhost:3000
- ✅ `.env.local` file created with placeholder values

## 🔧 Next Steps Required

### 1. Set Up Supabase Database

You need to create a Supabase account and project to get the required credentials:

1. **Go to [https://supabase.com](https://supabase.com)**
2. **Sign up/Sign in** to your account
3. **Create a new project** or use an existing one
4. **Get your project credentials:**
   - Go to Project Settings → API
   - Copy your **Project URL** and **anon/public key**

### 2. Update Environment Variables

Edit the `.env.local` file in your project root:

```bash
# Replace these placeholder values with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### 3. Set Up Database Schema

The project includes database setup documentation. Check these files:
- `DATABASE_SETUP.md` - Initial database setup
- `DATABASE_UPDATE_GUIDE.md` - Database updates and migrations

### 4. Restart Development Server

After updating the environment variables:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

## 🌐 Access Your Application

Once everything is set up:
- **Local Development**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard

## 📚 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Make sure to load nvm first:
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Supabase URL not configured"**
   - Check your `.env.local` file
   - Ensure credentials are correct
   - Restart the development server

2. **Database connection errors**
   - Verify Supabase project is active
   - Check database schema setup
   - Review `DATABASE_SETUP.md`

3. **Port already in use**
   - Kill existing processes: `lsof -ti:3000 | xargs kill -9`
   - Or use different port: `npm run dev -- -p 3001`

## 📖 Documentation Files

- `PROJECT_DOCUMENTATION.md` - Complete project overview
- `DATABASE_SETUP.md` - Database configuration
- `PERFORMANCE_OPTIMIZATIONS.md` - Performance tips
- `JWT_README.md` - Authentication details

## 🎯 Project Features

This is a **Startup Value Simulator** that helps:
- Manage cap tables and ownership structures
- Model funding rounds and dilution
- Calculate exit scenarios and returns
- Track founder equity over time
- Compare multiple exit scenarios

## 🆘 Need Help?

If you encounter issues:
1. Check the documentation files in the project
2. Verify your Supabase credentials
3. Ensure the database schema is properly set up
4. Check the browser console for error messages

---

**Happy coding! 🚀**
