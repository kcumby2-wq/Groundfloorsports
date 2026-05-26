$ErrorActionPreference = 'Stop'

$keys = @(
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_AUTH_TOKEN'
)

foreach ($key in $keys) {
  if (Test-Path "Env:$key") {
    Remove-Item "Env:$key" -ErrorAction SilentlyContinue
    Write-Host "[security] cleared $key"
  } else {
    Write-Host "[security] not set: $key"
  }
}

try {
  Clear-History -ErrorAction SilentlyContinue
  Write-Host '[security] session history cleared'
} catch {
  Write-Host '[security] could not clear session history'
}
