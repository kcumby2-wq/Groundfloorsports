$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

Write-Host '[dev-stable] Workspace:' $repoRoot

if (-not (Test-Path (Join-Path $repoRoot 'package.json'))) {
  throw '[dev-stable] package.json not found. Run from subjectreport-app.'
}

$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
$npmCmd = Get-Command npm -ErrorAction SilentlyContinue
if (-not $nodeCmd -or -not $npmCmd) {
  throw '[dev-stable] Node.js and npm are required in PATH.'
}

$nodeVersion = node --version
Write-Host '[dev-stable] Node version:' $nodeVersion

$nextDir = Join-Path $repoRoot '.next'
if (Test-Path $nextDir) {
  Write-Host '[dev-stable] Removing stale .next cache...'
  Remove-Item -Recurse -Force $nextDir -ErrorAction SilentlyContinue
}

$port = 3000
$listeners = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listeners) {
  $pids = $listeners | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pid in $pids) {
    Write-Host "[dev-stable] Stopping process on port $port (PID $pid)..."
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
  }
}

Write-Host '[dev-stable] Starting Next dev server with webpack fallback...'
npm run dev -- --webpack
