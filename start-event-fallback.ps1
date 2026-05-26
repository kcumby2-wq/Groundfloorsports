param(
  [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

Write-Host "== Subjectreport Event Fallback Launcher ==" -ForegroundColor Cyan

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot

$adminUrl = "http://localhost:$Port/admin.html"
$builderUrl = "http://localhost:$Port/combine-clinic-template.html"
$healthUrl = "http://localhost:$Port/"

# Reuse existing local server if already running on chosen port.
$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
  Write-Host "Server already listening on port $Port. Reusing it." -ForegroundColor Yellow
  Start-Process $adminUrl | Out-Null
  Start-Process $builderUrl | Out-Null
  Write-Host "Opened admin and builder pages." -ForegroundColor Green
  return
}

$pythonLauncher = $null
if (Get-Command py -ErrorAction SilentlyContinue) {
  $pythonLauncher = @{ FileName = "py"; Args = @("-m", "http.server", "$Port") }
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
  $pythonLauncher = @{ FileName = "python"; Args = @("-m", "http.server", "$Port") }
}

if (-not $pythonLauncher) {
  Write-Host "Python was not found (py/python). Cannot start fallback server." -ForegroundColor Red
  Write-Host "Install Python, then run this script again." -ForegroundColor Red
  exit 1
}

$argText = $pythonLauncher.Args -join " "
$serverProcess = Start-Process -FilePath $pythonLauncher.FileName -ArgumentList $argText -WorkingDirectory $scriptRoot -PassThru

$ready = $false
for ($i = 0; $i -lt 12; $i++) {
  Start-Sleep -Milliseconds 350
  try {
    $resp = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 2
    if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 500) {
      $ready = $true
      break
    }
  } catch {
    # Wait for server warm-up.
  }
}

if (-not $ready) {
  Write-Host "Server did not respond on http://localhost:$Port in time." -ForegroundColor Red
  Write-Host "Stopping server process id $($serverProcess.Id)." -ForegroundColor Yellow
  try {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction Stop
  } catch {
    # Ignore cleanup failures.
  }
  exit 1
}

Start-Process $adminUrl | Out-Null
Start-Process $builderUrl | Out-Null

Write-Host "Fallback server running on http://localhost:$Port" -ForegroundColor Green
Write-Host "Admin:   $adminUrl" -ForegroundColor Green
Write-Host "Builder: $builderUrl" -ForegroundColor Green
Write-Host "Server PID: $($serverProcess.Id)" -ForegroundColor Yellow
Write-Host "To stop later: Stop-Process -Id $($serverProcess.Id) -Force" -ForegroundColor Yellow
