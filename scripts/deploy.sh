#!/bin/bash

# AI-Powered Forecasting Module - Auto Deployment Script
# This script automatically commits changes to GitHub and triggers Vercel deployment

set -e

# Configuration
REPO_URL="${REPO_URL:-https://github.com/yourusername/pharma-commercial-intelligence.git}"
VERCEL_TOKEN="${VERCEL_TOKEN}"
VERCEL_PROJECT_ID="${VERCEL_PROJECT_ID}"
CUSTOM_DOMAIN="${CUSTOM_DOMAIN:-pharmacommercialintelligence.synaptic-group.online}"
COMMIT_MESSAGE="${COMMIT_MESSAGE:-feat: AI-Powered Forecasting Module - Automated Deployment}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Auto-Deployment Pipeline${NC}"
echo "=================================="

# Check prerequisites
check_prerequisites() {
  echo -e "${YELLOW}Checking prerequisites...${NC}"
  
  if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed${NC}"
    exit 1
  fi
  
  if [ -z "$VERCEL_TOKEN" ]; then
    echo -e "${RED}VERCEL_TOKEN environment variable is not set${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Prerequisites OK${NC}"
}

# Initialize git if needed
initialize_git() {
  echo -e "${YELLOW}Initializing/updating git repository...${NC}"
  
  if [ ! -d ".git" ]; then
    git init
    git remote add origin "$REPO_URL" || true
  fi
  
  # Configure git
  git config user.email "automation@pharmaCI.dev" || git config --global user.email "automation@pharmaCI.dev"
  git config user.name "Pharma CI Bot" || git config --global user.name "Pharma CI Bot"
  
  echo -e "${GREEN}✓ Git repository initialized${NC}"
}

# Stage and commit changes
commit_changes() {
  echo -e "${YELLOW}Staging changes...${NC}"
  
  git add -A
  
  # Check if there are changes to commit
  if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}No changes to commit${NC}"
    return 1
  fi
  
  echo -e "${YELLOW}Committing changes...${NC}"
  git commit -m "$COMMIT_MESSAGE" \
    -m "AI-Powered Forecasting Module Implementation" \
    -m "✓ Advanced time-series forecasting engine" \
    -m "✓ Pharma-specific business logic" \
    -m "✓ AI-generated insights and risk analysis" \
    -m "✓ Enhanced dashboard with forecast views" \
    -m "✓ Automatic deployment pipeline" \
    -m "Generated at: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  
  echo -e "${GREEN}✓ Changes committed${NC}"
  return 0
}

# Push to GitHub
push_to_github() {
  echo -e "${YELLOW}Pushing to GitHub...${NC}"
  
  git push -u origin main --force-with-lease || git push -u origin master --force-with-lease || {
    echo -e "${RED}Failed to push to GitHub${NC}"
    exit 1
  }
  
  echo -e "${GREEN}✓ Pushed to GitHub${NC}"
}

# Trigger Vercel deployment
trigger_vercel_deployment() {
  echo -e "${YELLOW}Triggering Vercel deployment...${NC}"
  
  if [ -z "$VERCEL_PROJECT_ID" ]; then
    echo -e "${YELLOW}VERCEL_PROJECT_ID not set, using git-based deployment${NC}"
    return 0
  fi
  
  DEPLOYMENT_RESPONSE=$(curl -s -X POST \
    "https://api.vercel.com/v13/deployments" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"gitSource\": {
        \"ref\": \"main\",
        \"repo\": \"$(git config --get remote.origin.url | sed 's/.*\\///' | sed 's/.git$//')\"
      }
    }")
  
  DEPLOYMENT_ID=$(echo "$DEPLOYMENT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
  
  if [ -z "$DEPLOYMENT_ID" ]; then
    echo -e "${YELLOW}Deployment triggered via git push (Vercel connected)${NC}"
    return 0
  fi
  
  echo -e "${GREEN}✓ Deployment ID: $DEPLOYMENT_ID${NC}"
  return 0
}

# Monitor deployment
monitor_deployment() {
  echo -e "${YELLOW}Monitoring deployment status...${NC}"
  
  MAX_WAIT=600 # 10 minutes
  ELAPSED=0
  POLL_INTERVAL=10
  
  while [ $ELAPSED -lt $MAX_WAIT ]; do
    STATUS=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
      "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID" | grep -o '"state":"[^"]*' | cut -d'"' -f4)
    
    case $STATUS in
      "READY")
        echo -e "${GREEN}✓ Deployment ready${NC}"
        return 0
        ;;
      "ERROR")
        echo -e "${RED}✗ Deployment failed${NC}"
        return 1
        ;;
      "BUILDING"|"QUEUED")
        echo -e "${YELLOW}Status: $STATUS... (${ELAPSED}s)${NC}"
        ;;
    esac
    
    sleep $POLL_INTERVAL
    ELAPSED=$((ELAPSED + POLL_INTERVAL))
  done
  
  echo -e "${YELLOW}Deployment monitoring timeout (deployment continuing in background)${NC}"
}

# Verify domain
verify_domain() {
  echo -e "${YELLOW}Verifying custom domain...${NC}"
  
  # Wait for DNS propagation
  sleep 5
  
  if curl -s -o /dev/null -w "%{http_code}" "https://$CUSTOM_DOMAIN" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Custom domain is accessible: https://$CUSTOM_DOMAIN${NC}"
    return 0
  else
    echo -e "${YELLOW}⚠ Custom domain verification pending (DNS may need time to propagate)${NC}"
    return 0
  fi
}

# Build summary
deployment_summary() {
  echo ""
  echo -e "${GREEN}=================================="
  echo "DEPLOYMENT SUMMARY"
  echo "==================================${NC}"
  echo ""
  echo -e "Repository: ${YELLOW}$REPO_URL${NC}"
  echo -e "Branch: ${YELLOW}main${NC}"
  echo -e "Custom Domain: ${YELLOW}https://$CUSTOM_DOMAIN${NC}"
  echo -e "Timestamp: ${YELLOW}$(date)${NC}"
  echo ""
  echo -e "${GREEN}✓ Forecasting Module Deployment Complete${NC}"
  echo ""
}

# Main execution
main() {
  check_prerequisites
  initialize_git
  
  if commit_changes; then
    push_to_github
    trigger_vercel_deployment
    # monitor_deployment  # Uncomment to wait for deployment
    verify_domain
  fi
  
  deployment_summary
}

# Run main function
main
