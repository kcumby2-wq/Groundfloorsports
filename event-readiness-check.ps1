$ErrorActionPreference = "Stop"

Write-Host "== Subjectreport Event Readiness Check ==" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

$requiredFiles = @(
  "admin.html",
  "combine-clinic-template.html",
  "marketplace.html",
  "sign-in.html",
  "sign-up.html",
  "shared-preview-utils.js",
  "PRIVATE-EVENT-DEPLOYMENT-CHECKLIST.md"
)

$missing = @()
foreach ($file in $requiredFiles) {
  if (-not (Test-Path $file)) {
    $missing += $file
  }
}

if ($missing.Count -gt 0) {
  Write-Host "Missing required files:" -ForegroundColor Red
  $missing | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host "File check passed." -ForegroundColor Green

try {
  $pythonCmd = Get-Command py -ErrorAction SilentlyContinue
  if ($null -eq $pythonCmd) {
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
  }

  if ($null -ne $pythonCmd) {
    Write-Host "Python found: $($pythonCmd.Source)" -ForegroundColor Green
    Write-Host "Offline server command: py -m http.server 8080" -ForegroundColor Yellow
  } else {
    Write-Host "Python not found. Install Python for easy offline fallback server." -ForegroundColor Yellow
  }
} catch {
  Write-Host "Could not verify Python availability." -ForegroundColor Yellow
}

Write-Host "" 
Write-Host "Manual checks to run:" -ForegroundColor Cyan
Write-Host " 1) Protected URL requires login" 
Write-Host " 2) Approved admin email can access" 
Write-Host " 3) Unapproved user is blocked" 
Write-Host " 4) CSV Import works" 
Write-Host " 5) Export CSV + Export By Date both work" 
Write-Host " 6) Draft restore works after refresh" 
Write-Host "" 
Write-Host "Ready for event validation." -ForegroundColor Green
