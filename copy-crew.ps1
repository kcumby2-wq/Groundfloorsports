$dl = "$env:USERPROFILE\Downloads"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\crew-photos"
New-Item -ItemType Directory -Force -Path $dst | Out-Null

$files = @(
  @{ pattern = "^Ky \(1\)\."      ; out = "crew-ky" },
  @{ pattern = "^Kyron & Mikey"   ; out = "crew-kyron-mikey" },
  @{ pattern = "^KT\."            ; out = "crew-kt" },
  @{ pattern = "^Subject Maddy"   ; out = "crew-maddy" },
  @{ pattern = "^Lathem"          ; out = "crew-lathem" },
  @{ pattern = "^Kyron cumby"     ; out = "crew-kyron-solo" }
)

foreach ($f in $files) {
  $src = Get-ChildItem $dl | Where-Object { $_.Name -imatch $f.pattern } | Select-Object -First 1
  if ($src) {
    $ext = $src.Extension.ToLower()
    Copy-Item $src.FullName "$dst\$($f.out)$ext" -Force
    Write-Host "OK: $($src.Name) -> $($f.out)$ext"
  } else {
    Write-Host "NOT FOUND: $($f.pattern)"
  }
}
Write-Host "DONE"
