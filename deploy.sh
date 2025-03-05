#!/bin/bash

# TikTok Email Region Fetcher Deployment Script
# This script helps deploy the application to various hosting platforms

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== TikTok Email Region Fetcher Deployment Script ===${NC}"
echo ""

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for required dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
if ! command_exists npm; then
  echo -e "${RED}Error: npm is not installed. Please install Node.js and npm first.${NC}"
  exit 1
fi

if ! command_exists git; then
  echo -e "${RED}Error: git is not installed. Please install git first.${NC}"
  exit 1
fi

echo -e "${GREEN}All dependencies are installed.${NC}"
echo ""

# Ask for deployment target
echo -e "${YELLOW}Where would you like to deploy?${NC}"
echo "1) Vercel (Recommended for full functionality)"
echo "2) Netlify"
echo "3) GitHub Pages"
echo "4) Other static hosting (generate static files)"
echo "5) Exit"
read -p "Enter your choice (1-5): " deployment_choice

case $deployment_choice in
  1)
    # Vercel deployment
    echo -e "${BLUE}Preparing for Vercel deployment...${NC}"
    
    if ! command_exists vercel; then
      echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
      npm install -g vercel
    fi
    
    echo -e "${GREEN}Running Vercel deployment...${NC}"
    vercel
    ;;
    
  2)
    # Netlify deployment
    echo -e "${BLUE}Preparing for Netlify deployment...${NC}"
    
    if ! command_exists netlify; then
      echo -e "${YELLOW}Netlify CLI not found. Installing...${NC}"
      npm install -g netlify-cli
    fi
    
    # Create netlify.toml if it doesn't exist
    if [ ! -f "netlify.toml" ]; then
      echo -e "${YELLOW}Creating netlify.toml configuration file...${NC}"
      cat > netlify.toml << EOF
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  STATIC_EXPORT = "true"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
    fi
    
    echo -e "${GREEN}Running Netlify deployment...${NC}"
    STATIC_EXPORT=true netlify deploy
    ;;
    
  3)
    # GitHub Pages deployment
    echo -e "${BLUE}Preparing for GitHub Pages deployment...${NC}"
    
    # Build the project for static hosting
    echo -e "${YELLOW}Building project for static hosting...${NC}"
    STATIC_EXPORT=true npm run build
    
    # Create a .nojekyll file to bypass Jekyll processing
    touch out/.nojekyll
    
    # Ask for GitHub repository information
    read -p "Enter your GitHub username: " github_username
    read -p "Enter your repository name: " github_repo
    
    echo -e "${YELLOW}Creating temporary branch for GitHub Pages...${NC}"
    rm -rf gh-pages-branch
    mkdir gh-pages-branch
    cp -r out/* gh-pages-branch/
    cp out/.nojekyll gh-pages-branch/
    
    cd gh-pages-branch
    git init
    git add .
    git commit -m "Deploy to GitHub Pages"
    git branch -M gh-pages
    git remote add origin https://github.com/$github_username/$github_repo.git
    
    echo -e "${GREEN}Pushing to GitHub Pages...${NC}"
    git push -f origin gh-pages
    
    cd ..
    rm -rf gh-pages-branch
    
    echo -e "${GREEN}Deployed to GitHub Pages!${NC}"
    echo -e "${YELLOW}Your site will be available at: https://$github_username.github.io/$github_repo/${NC}"
    ;;
    
  4)
    # Generate static files
    echo -e "${BLUE}Generating static files for hosting...${NC}"
    
    # Build the project for static hosting
    echo -e "${YELLOW}Building project for static hosting...${NC}"
    STATIC_EXPORT=true npm run build
    
    # Create a .nojekyll file to bypass Jekyll processing on some hosts
    touch out/.nojekyll
    
    echo -e "${GREEN}Static files generated in the 'out' directory.${NC}"
    echo -e "${YELLOW}Upload the contents of the 'out' directory to your hosting provider.${NC}"
    
    # Ask if user wants to create a zip file
    read -p "Would you like to create a zip file of the static files? (y/n): " create_zip
    if [ "$create_zip" = "y" ] || [ "$create_zip" = "Y" ]; then
      zip_filename="tiktok-email-region-fetcher-static.zip"
      
      if command_exists zip; then
        echo -e "${YELLOW}Creating zip file...${NC}"
        cd out && zip -r ../$zip_filename * .nojekyll && cd ..
        echo -e "${GREEN}Created $zip_filename${NC}"
      else
        echo -e "${RED}Error: zip command not found. Please install zip or manually compress the 'out' directory.${NC}"
      fi
    fi
    ;;
    
  5)
    # Exit
    echo -e "${BLUE}Exiting deployment script.${NC}"
    exit 0
    ;;
    
  *)
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}Deployment process completed!${NC}"

