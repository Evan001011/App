# How to Push to GitHub

This guide shows you how to get your Studently app on GitHub and deploy it from there.

## 📋 Prerequisites

- GitHub account ([Sign up free](https://github.com/signup))
- Git installed (already available on Replit)

## 🚀 Step-by-Step: Push to GitHub

### 1. Create a New Repository on GitHub

1. Go to [GitHub](https://github.com) and log in
2. Click the **"+"** icon → **"New repository"**
3. Fill in the details:
   - **Repository name**: `studently` (or your preferred name)
   - **Description**: "Student productivity platform with AI study assistant"
   - **Public** or **Private**: Your choice
   - ⚠️ **DO NOT** check "Add a README" (you already have one)
   - ⚠️ **DO NOT** add .gitignore (you already have one)
4. Click **"Create repository"**

### 2. Push Your Code from Replit

GitHub will show you instructions. Use these commands in Replit's Shell:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Studently productivity platform"

# Add GitHub as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/studently.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your GitHub username!**

### 3. Verify Upload

Go to your GitHub repository URL:
`https://github.com/YOUR_USERNAME/studently`

You should see all your files! ✅

## 🔄 Making Updates

After making changes to your code:

```bash
# See what changed
git status

# Add changed files
git add .

# Commit with a message
git commit -m "Add new feature"

# Push to GitHub
git push
```

## 🚀 Deploy from GitHub

Now that your code is on GitHub, you can deploy to any platform:

### Railway (Recommended)
1. Go to [Railway](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `studently` repository
5. Add PostgreSQL database
6. Set environment variables
7. Deploy!

### Render
1. Go to [Render](https://render.com)
2. Sign in with GitHub
3. Click "New" → "Blueprint"
4. Select your `studently` repository
5. Render auto-configures using `render.yaml`
6. Deploy!

### Automatic Deployments
Both Railway and Render will **automatically redeploy** whenever you push to GitHub!

```bash
# Make a change
git add .
git commit -m "Update feature"
git push

# Your app automatically redeploys! 🎉
```

## 🔐 Environment Variables

⚠️ **NEVER commit your `.env` file to GitHub!**

Your `.gitignore` already prevents this, but double-check:

```bash
# This should NOT show .env
git status
```

Instead:
- Add environment variables in Railway/Render dashboard
- Use the `.env.example` file as a template

## 🌟 Add a Nice README Badge

Add this to the top of your `README.md` to show it's deployed:

```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/studently)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/studently)
```

## 📝 Best Practices

### Good Commit Messages
```bash
# ✅ Good
git commit -m "Add learning preferences dialog"
git commit -m "Fix AI chat bug in Math mode"
git commit -m "Update README with deployment guide"

# ❌ Bad
git commit -m "changes"
git commit -m "fix"
git commit -m "update"
```

### Commit Often
```bash
# Commit after each feature or fix
git add .
git commit -m "Add task completion animation"
git push
```

### Use Branches for Big Features
```bash
# Create a new branch
git checkout -b feature/study-groups

# Make changes and commit
git add .
git commit -m "Add study groups feature"

# Push branch to GitHub
git push -u origin feature/study-groups

# Create Pull Request on GitHub
# Merge when ready
```

## 🐛 Troubleshooting

### "Remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/studently.git
```

### "Authentication failed"
GitHub removed password authentication. Use either:

**Option 1: Personal Access Token**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Use token instead of password

**Option 2: SSH Key (Recommended)**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key
cat ~/.ssh/id_ed25519.pub

# Add to GitHub: Settings → SSH Keys → New SSH key
```

Then use SSH URL:
```bash
git remote set-url origin git@github.com:YOUR_USERNAME/studently.git
```

### "Push rejected"
```bash
# Pull latest changes first
git pull origin main --rebase

# Then push
git push
```

## ✨ You're Done!

Your app is now on GitHub and can be deployed to any platform! 🎉

**Next steps:**
1. ✅ Code is on GitHub
2. 🚀 Deploy to Railway/Render (see [DEPLOYMENT.md](./DEPLOYMENT.md))
3. 🌐 Share your live app with friends!
4. 📱 Keep building and pushing updates

---

**Questions?** Open an issue on GitHub or check the main [README.md](./README.md)
