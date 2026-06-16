$dl = "$env:USERPROFILE\Downloads"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\crew-photos"
# Find any file starting with "Ky" but not "Kyron"
$src = Get-ChildItem $dl | Where-Object { $_.Name -imatch "^Ky[^r]" -or $_.Name -imatch "^Ky\." } | Select-Object -First 1
if ($src) {
  $ext = $src.Extension.ToLower()
  Copy-Item $src.FullName "$dst\crew-ky$ext" -Force
  Write-Host "OK: $($src.Name)"
} else {
  # fallback: list all Ky files
  Get-ChildItem $dl | Where-Object { $_.Name -ilike "Ky*" } | ForEach-Object { Write-Host "FOUND: $($_.Name)" }
}
