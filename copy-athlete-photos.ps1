$src = "$env:USERPROFILE\Downloads"
$dst = "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\media\athlete-photos"

New-Item -ItemType Directory -Force -Path $dst | Out-Null

$files = @(
  @{ From = "Jr eybl.JPG";         To = "ath-basketball.jpg" },
  @{ From = "Lacrosse.PNG";        To = "ath-lacrosse.png"   },
  @{ From = "Soccer.PNG";          To = "ath-soccer.png"     },
  @{ From = "Volleyball.PNG";      To = "ath-volleyball.png" },
  @{ From = "Girls Flag.jpg";      To = "ath-girls-flag.jpg" },
  @{ From = "Track.PNG";           To = "ath-track.png"      },
  @{ From = "Hooks & Kingston.JPG";To = "ath-hooks-kingston.jpg" }
)

foreach ($f in $files) {
  $src_path = Join-Path $src $f.From
  $dst_path = Join-Path $dst $f.To
  if (Test-Path $src_path) {
    Copy-Item $src_path $dst_path -Force
    Write-Host "OK: $($f.To)"
  } else {
    Write-Host "MISSING: $($f.From)"
  }
}
Write-Host "Done."
