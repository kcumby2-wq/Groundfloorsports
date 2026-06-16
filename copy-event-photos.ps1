$src = "C:\Users\kcumb\Downloads"
$dest = "C:\Users\kcumb\OneDrive\Documents\subjectreport-app\media\event-photos"

$files = @(
    "DSC03825_ARW.jpg",
    "DSC03794_ARW.jpg",
    "DSC02829.jpg",
    "DSC01875.jpg",
    "DSC01846.jpg"
)

foreach ($f in $files) {
    $src_path = Join-Path $src $f
    if (Test-Path $src_path) {
        Copy-Item $src_path $dest
        Write-Host "Copied: $f"
    } else {
        Write-Host "NOT FOUND: $f"
    }
}

Write-Host ""
Write-Host "Done! Press Enter to close."
Read-Host
