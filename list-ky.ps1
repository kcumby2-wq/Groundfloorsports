$dl = "$env:USERPROFILE\Downloads"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\crew-photos"
$out = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\ky-files.txt"
$results = Get-ChildItem $dl | Where-Object { $_.Name -ilike "Ky*" -and $_.Name -notlike "Kyron*" }
$results | ForEach-Object { "$($_.Name) | ext=$($_.Extension) | base=$($_.BaseName)" } | Out-File $out -Encoding UTF8

# Also try copying any match
$first = $results | Select-Object -First 1
if ($first) {
  $ext = if ($first.Extension) { $first.Extension.ToLower() } else { ".jpg" }
  Copy-Item $first.FullName "$dst\crew-ky$ext" -Force
  Add-Content $out "COPIED: $($first.Name)"
}
