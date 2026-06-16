$src = "$env:USERPROFILE\Downloads\Pylon rated.mp4"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\pylon-rated.mp4"
if (Test-Path $src) {
  Copy-Item $src $dst -Force
  Write-Host "Done"
} else {
  # try alternate casing
  $alt = Get-ChildItem "$env:USERPROFILE\Downloads" | Where-Object { $_.Name -ilike "*pylon*rated*" -or $_.Name -ilike "*pylon rated*" } | Select-Object -First 1
  if ($alt) {
    Copy-Item $alt.FullName $dst -Force
    Write-Host "Done: $($alt.Name)"
  } else {
    Write-Host "NOT FOUND"
  }
}
