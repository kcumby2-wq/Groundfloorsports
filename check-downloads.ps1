$src = "C:\Users\kcumb\Downloads"
$dest = "C:\Users\kcumb\OneDrive\Documents\subjectreport-app\media\event-photos"

Write-Host "=== Files in Downloads matching DSC* ==="
Get-ChildItem $src -Filter "DSC*" | ForEach-Object { Write-Host $_.Name }

Write-Host ""
Write-Host "=== Files in Downloads matching *.jpg ==="
Get-ChildItem $src -Filter "*.jpg" | ForEach-Object { Write-Host $_.Name }

Write-Host ""
Write-Host "Press Enter to close."
Read-Host
