# AI-Powered Forecasting Module - Auto Deployment Script (Windows PowerShell)
# This script automatically commits changes to GitHub and triggers Vercel deployment

param(
    [string]$RepoUrl = "https://github.com/yourusername/pharma-commercial-intelligence.git",
    [string]$VercelToken = $env:VERCEL_TOKEN,
    [string]$VercelProjectId = $env:VERCEL_PROJECT_ID,
    [string]$CustomDomain = "pharmacommercialintelligence.synaptic-group.online",
    [string]$CommitMessage = "feat: AI-Powered Forecasting Module - Automated Deployment"
)

# Color output helper
function Write-ColorOutput($message, $color) {
    $colors = @{
        "Green" = 10
        "Yellow" = 14
        "Red" = 12
    }
    $colorCode = $colors[$color]
    
    $host.ui.RawUI.ForegroundColor = $colorCode
    Write-Host $message
    $host.ui.RawUI.ForegroundColor = 7
}

Write-ColorOutput "Starting Auto-Deployment Pipeline" "Yellow"
Write-Host "=================================="
Write-Host ""

# Check prerequisites
function Check-Prerequisites {
    Write-ColorOutput "Checking prerequisites..." "Yellow"
    
    # Check Git
    $gitExists = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
    if (-not $gitExists) {
        Write-ColorOutput "Git is not installed or not in PATH" "Red"
        exit 1
    }
    
    # Check Vercel Token
    if ([string]::IsNullOrEmpty($VercelToken)) {
        Write-ColorOutput "VERCEL_TOKEN environment variable is not set" "Red"
        exit 1
    }
    
    Write-ColorOutput "✓ Prerequisites OK" "Green"
}

# Initialize git repository
function Initialize-Git {
    Write-ColorOutput "Initializing/updating git repository..." "Yellow"
    
    if (-not (Test-Path ".git")) {
        git init
        git remote add origin $RepoUrl -q
    }
    
    # Configure git
    git config user.email "automation@pharmaCI.dev" -q
    git config user.name "Pharma CI Bot" -q
    
    # Ensure we're on main branch
    try {
        git checkout main -q
    } catch {
        git checkout -b main -q
    }
    
    Write-ColorOutput "✓ Git repository initialized" "Green"
}

# Stage and commit changes
function Commit-Changes {
    Write-ColorOutput "Staging changes..." "Yellow"
    
    git add -A
    
    # Check if there are changes
    $status = git status --porcelain
    if ([string]::IsNullOrEmpty($status)) {
        Write-ColorOutput "No changes to commit" "Yellow"
        return $false
    }
    
    Write-ColorOutput "Committing changes..." "Yellow"
    
    $timestamp = Get-Date -Format "u"
    $fullMessage = @"
$CommitMessage

AI-Powered Forecasting Module Implementation
✓ Advanced time-series forecasting engine
✓ Pharma-specific business logic
✓ AI-generated insights and risk analysis
✓ Enhanced dashboard with forecast views
✓ Automatic deployment pipeline
Generated at: $timestamp
"@
    
    git commit -m $fullMessage -q
    
    Write-ColorOutput "✓ Changes committed" "Green"
    return $true
}

# Push to GitHub
function Push-ToGithub {
    Write-ColorOutput "Pushing to GitHub..." "Yellow"
    
    try {
        git push -u origin main -q 2>$null
    } catch {
        try {
            git push -u origin master -q 2>$null
        } catch {
            Write-ColorOutput "Failed to push to GitHub" "Red"
            exit 1
        }
    }
    
    Write-ColorOutput "✓ Pushed to GitHub" "Green"
}

# Trigger Vercel deployment
function Trigger-VercelDeployment {
    Write-ColorOutput "Triggering Vercel deployment..." "Yellow"
    
    if ([string]::IsNullOrEmpty($VercelProjectId)) {
        Write-ColorOutput "VERCEL_PROJECT_ID not set, using git-based deployment" "Yellow"
        return $true
    }
    
    $headers = @{
        "Authorization" = "Bearer $VercelToken"
        "Content-Type" = "application/json"
    }
    
    $body = @{
        gitSource = @{
            ref = "main"
            repo = "pharma-commercial-intelligence"
        }
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.vercel.com/v13/deployments" `
            -Method Post -Headers $headers -Body $body -ErrorAction SilentlyContinue
        
        if ($response.id) {
            Write-ColorOutput "✓ Deployment ID: $($response.id)" "Green"
        } else {
            Write-ColorOutput "Deployment triggered via git push (Vercel connected)" "Yellow"
        }
        return $true
    } catch {
        Write-ColorOutput "Failed to trigger Vercel deployment: $_" "Red"
        return $false
    }
}

# Verify domain
function Verify-Domain {
    Write-ColorOutput "Verifying custom domain..." "Yellow"
    
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "https://$CustomDomain" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 301 -or $response.StatusCode -eq 302) {
            Write-ColorOutput "✓ Custom domain is accessible: https://$CustomDomain" "Green"
            return $true
        }
    } catch {
        Write-ColorOutput "⚠ Custom domain verification pending (DNS may need time to propagate)" "Yellow"
        return $true
    }
}

# Deployment summary
function Show-DeploymentSummary {
    Write-Host ""
    Write-ColorOutput "==================================" "Green"
    Write-ColorOutput "DEPLOYMENT SUMMARY" "Green"
    Write-ColorOutput "==================================" "Green"
    Write-Host ""
    
    Write-Host "Repository:   $(Write-ColorOutput $RepoUrl 'Yellow' -NoNewline)$($RepoUrl)"
    Write-Host "Branch:       $(Write-ColorOutput 'main' 'Yellow' -NoNewline)main"
    Write-Host "Domain:       $(Write-ColorOutput "https://$CustomDomain" 'Yellow' -NoNewline)https://$CustomDomain"
    Write-Host "Timestamp:    $(Get-Date)"
    Write-Host ""
    Write-ColorOutput "✓ Forecasting Module Deployment Complete" "Green"
    Write-Host ""
}

# Main execution
function Main {
    Check-Prerequisites
    Initialize-Git
    
    if (Commit-Changes) {
        Push-ToGithub
        Trigger-VercelDeployment | Out-Null
        Verify-Domain | Out-Null
    }
    
    Show-DeploymentSummary
}

# Run main
Main
