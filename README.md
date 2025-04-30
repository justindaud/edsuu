# EDSU House Project

This project is a monorepo containing frontend-public, frontend-admin, and shared code for the EDSU House application.

## Project Structure

- `frontend-public` - The public-facing Next.js application
- `frontend-admin` - The admin dashboard Next.js application
- `backend` - The Express.js backend API
- `shared` - Shared components, utilities, and models

## Prerequisites

- Node.js 16+ and npm
- MongoDB database

## Environment Setup

Create the following environment files:

1. `.env.local` in the root directory:
```
# MongoDB connection string 
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edsu-house?retryWrites=true&w=majority
```

2. `.env.local` in the frontend-public directory:
```
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edsu-house?retryWrites=true&w=majority
NEXT_PUBLIC_API_URL=/api
```

3. `.env.local` in the frontend-admin directory:
```
# MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edsu-house?retryWrites=true&w=majority
NEXT_PUBLIC_API_URL=/api
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Development

```bash
npm run dev
```

## Deployment with Vercel

1. Configure your project on Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy the project from your GitHub repository

### Important Notes for Deployment

- Make sure to add the `MONGODB_URI` environment variable in Vercel
- For the frontend-public app, add these dependencies in package.json:
  - `@radix-ui/react-select`
  - `mongoose`

## Troubleshooting Deployment

If you encounter build errors like "Module not found":

1. Check that all dependencies are installed in the corresponding package.json
2. Make sure environment variables are set up correctly
3. Run a local build to verify it works before deploying 