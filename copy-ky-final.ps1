$src = "C:\Users\kcumb\Downloads\Ky .jpg"
$dst = "C:\Users\kcumb\OneDrive\Documents\subjectreport-app\media\crew-photos\crew-ky.jpg"
Copy-Item -LiteralPath $src -Destination $dst -Force
Write-Host "Done: crew-ky.jpg"
