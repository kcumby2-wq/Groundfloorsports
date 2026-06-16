$dest = 'C:\Users\kcumb\OneDrive\Documents\subjectreport-app\media\crew-photos\crew-chris.jpg'
$names = @('Chris shots.jpg','Chris shots.jpeg','chris shot.jpg','chris shot.jpeg','Chris shot.jpg','Chris shot.jpeg')
foreach ($n in $names) {
    $src = "C:\Users\kcumb\Downloads\$n"
    if (Test-Path $src) {
        Copy-Item -LiteralPath $src -Destination $dest -Force
        Write-Host "Copied: $n"
        break
    }
}
if (Test-Path $dest) { Write-Host "SUCCESS: crew-chris.jpg exists" } else { Write-Host "FAILED - listing Downloads:"; Get-ChildItem 'C:\Users\kcumb\Downloads\' | Select-Object -First 20 | Select-Object Name }
Start-Sleep 5
