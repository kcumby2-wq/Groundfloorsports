Get-ChildItem "$env:USERPROFILE\Downloads" -Include *.jpg,*.jpeg,*.png,*.JPG,*.JPEG,*.PNG -Recurse | Select-Object Name, Length | Sort-Object Name | Format-Table -AutoSize | Out-File "$env:USERPROFILE\OneDrive\Documents\subjectreport-app\downloads-list.txt" -Encoding UTF8
Write-Host "Done"
