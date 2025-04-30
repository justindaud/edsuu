# Git and Deployment Guide

## Git Setup

If you're starting from scratch:

```bash
# Initialize the repository
git init

# Add all files to the staging area
git add .

# Commit the changes
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/username/edsuu.git

# Push to the remote repository
git push -u origin main
```

## Regular Git Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "fix: description of the changes"

# Push to remote
git push
```

## Deployment to Vercel

1. Connect your GitHub repository to Vercel
2. Set up the environment variables in Vercel dashboard:
   - MONGODB_URI
   - Any other required environment variables
3. Configure the project settings:
   - Framework preset: Next.js
   - Root directory: frontend-public
   - Build command: npm run build
   - Output directory: .next
4. Deploy

## Troubleshooting Deployment Issues

If you encounter the error "Module not found: Can't resolve '@radix-ui/react-select'":

1. Make sure the dependency is added to package.json:
   ```bash
   cd frontend-public
   npm install @radix-ui/react-select --save
   ```

2. Commit and push changes:
   ```bash
   git add .
   git commit -m "fix: add missing dependencies"
   git push
   ```

3. Redeploy on Vercel

## Handling Mongoose Connection Issues

If MongoDB connection fails:

1. Verify the MONGODB_URI environment variable is set correctly in Vercel
2. Check MongoDB Atlas settings (IP whitelist, user permissions)
3. Update the mongoose connection code if needed

git add .
git commit -m "fix: fix visitor model"
git push

