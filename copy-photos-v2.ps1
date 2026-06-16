$src = "C:\Users\kcumb\Downloads"
$dest = "C:\Users\kcumb\OneDrive\Documents\subjectreport-app\media\event-photos"
$log = "C:\Users\kcumb\OneDrive\Documents\subjectreport-app\copy-log.txt"

$files = @(
    "DSC03825_ARW.jpg",
    "DSC03794_ARW.jpg",
    "DSC02829.jpg",
    "DSC01875.jpg",
    "DSC01846.jpg"
)

$output = @()
foreach ($f in $files) {
    $src_path = Join-Path $src $f
    if (Test-Path $src_path) {
        Copy-Item $src_path $dest -Force
        $output += "COPIED: $f"
    } else {
        $output += "NOT FOUND: $f"
    }
}

# Also list all DSC jpg files in Downloads
$output += ""
$output += "=== All DSC*.jpg in Downloads ==="
Get-ChildItem $src -Filter "DSC*.jpg" | ForEach-Object { $output += $_.Name }

$output | Out-File -FilePath $log -Encoding utf8
