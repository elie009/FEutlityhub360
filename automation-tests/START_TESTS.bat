@echo off
echo Opening new terminal for automation tests...
start cmd /k "cd /d %~dp0 && run_tests.bat"

