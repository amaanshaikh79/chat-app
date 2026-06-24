# 🚀 Render Deployment Guide

## Prerequisites

1. **GitHub Repository**: Your code is already pushed to https://github.com/amaanshaikh79/chat-app
2. **MongoDB Atlas Account**: You need a MongoDB database
3. **Render Account**: Sign up at https://render.com

---

## Step 1: Create MongoDB Atlas Database

### 1.1 Sign Up/Login to MongoDB Atlas
Go to https://www.mongodb.com/cloud/atlas and create an account or login.

### 1.2 Create a New Cluster
1. Click **"Build a Database"**
2. Choose **"M0 FREE"** tier
3. Select a cloud provider and region (choose closest to your users)
4. Click **"Create Cluster"**

### 1.3 Create Database User
1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **Password** authentication
4. Username: `chatapp-admin` (or your choice)
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **"Add User"**

### 1.4 Whitelist IP Address
1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Render's dynamic IPs
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **Database** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<username>` and `<password>` with your actual credentials
6. Add database name after `.net/`: 
   ```
   mongodb+srv://chatapp-admin:your_password@cluster0.xxxxx.mongodb.net/chatapp?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy to Render

### 2.1 Create New Web Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** (if not connected)
4. Find and select your repository: `amaanshaikh79/chat-app`
5. Click **"Connect"**

### 2.2 Configure Web Service

Fill in the settings:

**Name:** `premium-chat-app` (or your choice)

**Region:** Choose closest to your users

**Branch:** `main`

**Root Directory:** Leave blank

**Runtime:** `Node`

**Build Command:** `npm install`

**Start Command:** `npm start`

**Instance Type:** `Free` (or choose paid for better performance)

### 2.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these 3 variables:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string from Step 1.5 |
| `JWT_SECRET` | `your_super_secret_key_here` | Generate a random string (min 32 chars) |
| `NODE_ENV` | `production` | Tells app it's in production mode |

**To generate a secure JWT_SECRET:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use online generator
# https://www.grc.com/passwords.htm
```

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Wait for deployment (takes 2-5 minutes)
3. Watch the logs for any errors

---

## Step 3: Verify Deployment

### 3.1 Check Logs
Look for these success messages:
```
🚀 Server chal raha hai: http://0.0.0.0:10000
📊 Environment: production
✅ MongoDB connected: cluster0.xxxxx.mongodb.net
```

### 3.2 Test Your App
1. Open your Render URL: `https://premium-chat-app.onrender.com`
2. Create a test account
3. Send a message in Global Chat
4. Test all features

---

## Common Issues & Solutions

### ❌ "MONGODB_URI is not defined"
**Solution:** 
1. Go to Render Dashboard → Your Service → Environment
2. Add `MONGODB_URI` environment variable
3. Click **"Save Changes"**
4. Service will auto-redeploy

### ❌ "MongoServerError: bad auth"
**Solution:**
- Check your MongoDB username and password are correct
- Make sure you URL-encoded special characters in password
  - Example: `p@ssw0rd!` → `p%40ssw0rd%21`
  - Use: https://www.urlencoder.org/

### ❌ "Could not connect to any servers"
**Solution:**
- Make sure you whitelisted 0.0.0.0/0 in MongoDB Network Access
- Wait 2-3 minutes for Atlas to update firewall rules

### ❌ "JWT malformed" or auth errors
**Solution:**
- Check `JWT_SECRET` is set in Render environment variables
- Make sure it's a long random string (min 32 characters)

### ⚠️ App sleeps after 15 minutes (Free tier)
**Info:** 
- Render free tier spins down after 15 min of inactivity
- First request after sleep takes ~30 seconds
- Upgrade to paid plan for 24/7 uptime

---

## Environment Variables Summary

Your Render environment should have these 3 variables:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=your_64_character_random_string_here_make_it_very_secure
NODE_ENV=production
```

---

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster is running
- [ ] Database user created with password
- [ ] IP 0.0.0.0/0 whitelisted in Network Access
- [ ] MONGODB_URI set in Render
- [ ] JWT_SECRET set in Render (min 32 chars)
- [ ] NODE_ENV=production set in Render
- [ ] Build successful (no errors in logs)
- [ ] "MongoDB connected" appears in logs
- [ ] Can access app URL
- [ ] Can create account
- [ ] Can send messages
- [ ] Real-time features working

---

## Monitoring & Maintenance

### View Logs
```
Render Dashboard → Your Service → Logs
```

### Restart Service
```
Render Dashboard → Your Service → Manual Deploy → Deploy latest commit
```

### Update Environment Variables
```
Render Dashboard → Your Service → Environment → Edit → Save Changes
```

### View Metrics
```
Render Dashboard → Your Service → Metrics
- CPU usage
- Memory usage
- Request count
```

---

## Scaling (Optional)

### Upgrade Instance Type
For better performance:
1. Go to Settings
2. Change Instance Type from Free to:
   - **Starter ($7/month)**: 512 MB RAM, no sleep
   - **Standard ($25/month)**: 2 GB RAM, better performance

### Add Custom Domain
1. Go to Settings → Custom Domain
2. Add your domain (e.g., `chat.yourdomain.com`)
3. Update DNS records as shown
4. SSL automatically provided

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **Common Issues**: Check logs first!
- **Support**: contact@render.com

---

**Your premium chat app is now live! 🎉**

Share your URL: `https://your-app-name.onrender.com`
