#!/bin/bash

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Dependency Resolution Fix Script ===${NC}"
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

echo -e "${GREEN}All dependencies are installed.${NC}"
echo ""

# Ask for installation method
echo -e "${YELLOW}How would you like to fix the dependency conflict?${NC}"
echo "1) Standard fix (recommended)"
echo "2) Force install (use if standard fix fails)"
echo "3) Legacy peer deps (use if other methods fail)"
echo "4) Exit"
read -p "Enter your choice (1-4): " fix_choice

case $fix_choice in
  1)
    # Standard fix
    echo -e "${BLUE}Applying standard fix...${NC}"
    echo -e "${YELLOW}Cleaning npm cache...${NC}"
    npm cache clean --force
    
    echo -e "${YELLOW}Removing node_modules and package-lock.json...${NC}"
    rm -rf node_modules package-lock.json
    
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    
    echo -e "${GREEN}Standard fix applied. If the issue persists, try option 2 or 3.${NC}"
    ;;
    
  2)
    # Force install
    echo -e "${BLUE}Applying force install...${NC}"
    echo -e "${YELLOW}Cleaning npm cache...${NC}"
    npm cache clean --force
    
    echo -e "${YELLOW}Removing node_modules and package-lock.json...${NC}"
    rm -rf node_modules package-lock.json
    
    echo -e "${YELLOW}Installing dependencies with --force flag...${NC}"
    npm install --force
    
    echo -e "${GREEN}Force install applied. If the issue persists, try option 3.${NC}"
    ;;
    
  3)
    # Legacy peer deps
    echo -e "${BLUE}Applying legacy peer deps fix...${NC}"
    echo -e "${YELLOW}Cleaning npm cache...${NC}"
    npm cache clean --force
    
    echo -e "${YELLOW}Removing node_modules and package-lock.json...${NC}"
    rm -rf node_modules package-lock.json
    
    echo -e "${YELLOW}Installing dependencies with --legacy-peer-deps flag...${NC}"
    npm install --legacy-peer-deps
    
    echo -e "${GREEN}Legacy peer deps fix applied.${NC}"
    ;;
    
  4)
    # Exit
    echo -e "${BLUE}Exiting fix script.${NC}"
    exit 0
    ;;
    
  *)
    echo -e "${RED}Invalid choice. Exiting.${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}Fix process completed!${NC}"
echo -e "${YELLOW}If you're still experiencing issues, try the following:${NC}"
echo "1. Check for any errors in the console"
echo "2. Try a different fix option from the script"
echo "3. Manually edit package.json to set date-fns version to ^2.30.0"
echo "4. Contact support if the issue persists"

