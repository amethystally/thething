# TikTok Account Email Region Fetcher

This application helps identify the region of TikTok accounts based on their email address.

## Deployment Options

This project is designed to be easily deployable on various hosting platforms. Here are instructions for different hosting options:

### Option 1: Deploy to Vercel (Recommended)

The easiest way to deploy this application is using Vercel:

1. Fork or clone this repository
2. Import the project into Vercel
3. Deploy with default settings

Vercel will automatically detect the Next.js configuration and deploy the application with API routes enabled.

### Option 2: Deploy to Netlify

To deploy on Netlify:

1. Fork or clone this repository
2. Import the project into Netlify
3. Set the build command to `npm run build`
4. Set the publish directory to `out`
5. Add an environment variable `STATIC_EXPORT=true`

The application will automatically use the static version when deployed to Netlify.

### Option 3: Deploy to GitHub Pages

To deploy on GitHub Pages:

1. Fork this repository
2. Go to Settings > Pages
3. Set up GitHub Pages to deploy from the `gh-pages` branch
4. Run the following commands locally:

