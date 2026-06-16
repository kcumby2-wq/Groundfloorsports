$dl = "$env:USERPROFILE\Downloads"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\crew-photos"
# Try exact basename match
$src = Get-ChildItem $dl | Where-Object { $_.BaseName -ieq "Ky" -or $_.BaseName -ieq "Ky (1)" } | Select-Object -First 1
if ($src) {
  $ext = $src.Extension.ToLower()
  Copy-Item $src.FullName "$dst\crew-ky$ext" -Force
  Write-Host "OK: $($src.Name)"
} else {
  Write-Host "NOT FOUND - listing all Ky files:"
  Get-ChildItem $dl | Where-Object { $_.Name -ilike "Ky*" } | ForEach-Object { Write-Host "$($_.Name) [$($_.Extension)]" }
}
