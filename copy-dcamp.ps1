$src = Get-ChildItem "$env:USERPROFILE\Downloads" | Where-Object { $_.Name -ilike "*D Camp Vid*" } | Select-Object -First 1
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\action-reel-2.mp4"
if ($src) {
  Copy-Item $src.FullName $dst -Force
  Write-Host "Done: $($src.Name)"
} else {
  Write-Host "NOT FOUND"
}
