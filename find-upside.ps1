Get-ChildItem "$env:USERPROFILE\Downloads" -Recurse | Where-Object { $_.Name -ilike "*upside*" -or $_.Name -ilike "*7v7*" -or $_.Name -ilike "*football*" } | Select-Object FullName, Name | Out-File "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\find-upside.txt" -Encoding UTF8
Write-Host "Done"
