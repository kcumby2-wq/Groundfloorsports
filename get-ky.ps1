$dl = "$env:USERPROFILE\Downloads"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\crew-photos"
# List every file in Downloads whose name starts with Ky (case-insensitive) but not Kyron
$matches = Get-ChildItem -Path $dl -File | Where-Object { $_.Name -match "(?i)^ky" -and $_.Name -notmatch "(?i)^kyron" }
foreach ($f in $matches) {
  Write-Host "FOUND: '$($f.Name)' ext='$($f.Extension)' size=$($f.Length)"
  $ext = if ($f.Extension -ne "") { $f.Extension.ToLower() } else { ".jpg" }
  $target = Join-Path $dst "crew-ky$ext"
  Copy-Item -LiteralPath $f.FullName -Destination $target -Force
  Write-Host "COPIED to $target"
}
if ($matches.Count -eq 0) { Write-Host "NO KY FILES FOUND" }
Read-Host "Press Enter"
