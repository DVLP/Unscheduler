@echo off
if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit)

echo Task Unscheduler doing it's job!
echo;
echo Checking for new, unexpected, scheduled tasks
echo;
node --experimental-modules %~dp0\check.mjs

echo;
pause
