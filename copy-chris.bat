@echo off
copy "C:\Users\kcumb\Downloads\Chris shots.jpg" "C:\Users\kcumb\OneDrive\Documents\subjectreport-app\media\crew-photos\crew-chris.jpg" /Y
if errorlevel 1 (
  copy "C:\Users\kcumb\Downloads\Chris shots.jpeg" "C:\Users\kcumb\OneDrive\Documents\subjectreport-app\media\crew-photos\crew-chris.jpg" /Y
)
echo Done
pause
