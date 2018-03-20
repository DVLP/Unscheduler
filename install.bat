@echo off
if not "%1"=="am_admin" (powershell start -verb runas '%0' am_admin & exit)

echo Welcome to Task Unscheduler!
echo;

WHERE node
IF %ERRORLEVEL% NEQ 0 (
  ECHO Task Unscheduler requires Node.js please install first from https://nodejs.org/en/download/
  echo;
  pause
) else (
  echo;
  node --experimental-modules %~dp0\index.mjs
  echo;
  echo ATTENTION: After restart you'll notice that Unsheduler detected itself!
  echo ATTENTION: This is to test that it's working correctly in your system.
  echo ATTENTION: When you'll see it on the list press "S" to accept it.
  echo;
  echo Today is the first day of your life without a schedule! Like you always wanted.
  echo;
  pause
)

