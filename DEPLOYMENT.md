# Netlify Deployment Guide

Your site is now configured for Netlify deployment!

## Quick Deploy Steps

1. **Push your code to GitHub**
   - Create a new repository on GitHub
   - Push this project to the repository

2. **Connect to Netlify**
   - Go to [Netlify](https://netlify.com)
   - Click "Add new site" > "Import an existing project"
   - Connect your GitHub account and select your repository

3. **Configure Build Settings** (Should auto-detect)
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These are already configured in `netlify.toml`

4. **Add Environment Variables** (CRITICAL!)
   - In Netlify dashboard, go to: Site settings > Environment variables
   - Add the following variables:
     - `VITE_SUPABASE_URL` = `https://ikcetgwybsrmvylghjfb.supabase.co`
     - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrY2V0Z3d5YnNybXZ5bGdoamZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNTE1NTYsImV4cCI6MjA4MTkyNzU1Nn0.42wRi1wsJp3AGXev9woa20LsMqi_QOi3rM1CLse_SiY`

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be live!

## Files Added for Netlify

- `netlify.toml` - Build configuration
- `public/_redirects` - SPA routing configuration

## Troubleshooting

If you see a blank page:
1. Check browser console for errors
2. Verify environment variables are set correctly in Netlify
3. Make sure the build succeeded without errors
4. Check that the Supabase URL and API key are correct
