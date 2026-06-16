$src = "$env:USERPROFILE\Downloads\upside down.PNG"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\athlete-photos\ath-7v7-football.png"
Copy-Item $src $dst -Force
Write-Host "Done: $dst"
