# ParkFlow Production Deployment Guide

This guide explains how to deploy the ParkFlow backend to a production hosting provider (like Render or Railway) and connect it to your Vercel-hosted frontend.

## 1. Backend Deployment (Render)
Render is a free/low-cost hosting platform for Node.js applications.

### Steps:
1. Push your `server` directory to a GitHub repository.
2. Sign up for [Render.com](https://render.com) and click **New > Web Service**.
3. Connect your GitHub account and select your repository.
4. **Root Directory:** If your backend is in the `server` folder, enter `server`.
5. **Environment:** Node
6. **Build Command:** `npm install`
7. **Start Command:** `node src/index.js`
8. **Environment Variables:**
   Add the following variables in the Render dashboard:
   - `MONGODB_URI` = `mongodb+srv://...` (Your MongoDB connection string)
   - `JWT_SECRET` = `your_secure_random_string`
   - `CLIENT_URL` = `https://parkflow-dbms.vercel.app` (Important: No trailing slash)
   - `PORT` = `5000` (Render will assign its own, but good practice to include)

9. Click **Create Web Service**. Wait for the deployment to finish and copy the Render URL (e.g., `https://parkflow-backend-xxxx.onrender.com`).

## 2. Backend Deployment (Railway)
Railway is another excellent alternative.

### Steps:
1. Sign up for [Railway.app](https://railway.app).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select your repository.
4. If your backend is in the `server` folder, go to **Settings** > **Service** and set the **Root Directory** to `/server`.
5. Under **Variables**, add:
   - `MONGODB_URI` = `...`
   - `JWT_SECRET` = `...`
   - `CLIENT_URL` = `https://parkflow-dbms.vercel.app`
6. Under **Settings** > **Environment**, click **Generate Domain** to get your public URL (e.g., `https://parkflow-backend-production.up.railway.app`).

## 3. Frontend Deployment Configuration (Vercel)
Once the backend is live, you must tell the frontend where to find it.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and select your project (`parkflow-dbms`).
2. Go to **Settings** > **Environment Variables**.
3. Add the following variables:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api/v1` (Replace with your actual backend URL + `/api/v1`)
   
   - **Key:** `VITE_SOCKET_URL`
   - **Value:** `https://your-backend-url.onrender.com` (Replace with your actual backend URL WITHOUT `/api/v1`)

4. **IMPORTANT:** You must trigger a new deployment for Vercel to pick up the new environment variables. Go to **Deployments**, click the three dots on the latest deployment, and select **Redeploy**.

## 4. Final Verification
- Go to `https://parkflow-dbms.vercel.app`.
- The Mixed Content warning should be gone (both frontend and backend are HTTPS).
- Try logging in.
- Verify that live notifications work (Socket.IO).
