$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root "marketplace.html"
$latest = Join-Path $root "marketplace.backup-latest.html"
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$timestamped = Join-Path $root ("marketplace.backup-" + $stamp + ".html")

if (-not (Test-Path $source)) {
  throw "Could not find source file: $source"
}

Copy-Item -Path $source -Destination $latest -Force
Copy-Item -Path $source -Destination $timestamped -Force

Write-Host "Latest backup: $latest"
Write-Host "Timestamped backup: $timestamped"
