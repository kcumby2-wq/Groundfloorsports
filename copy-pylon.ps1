$src = "$env:USERPROFILE\Downloads\pylon.mp4"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\pylon.mp4"
Copy-Item $src $dst -Force
Write-Host "Done"
