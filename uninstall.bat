@echo off
if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit)
echo;
node --experimental-modules %~dp0\uninstall.mjs
echo Time to return to your everyday schedule.
echo;
pause
