@echo off
echo ========================================
echo UtilityHub360 Automation Test Suite
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo [1/3] Checking dependencies...
pip --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: pip is not installed
    pause
    exit /b 1
)

echo [2/3] Installing required packages...
pip install -r requirements.txt --quiet

echo.
echo [3/3] Starting test execution...
echo.
python run_tests.py

echo.
echo ========================================
echo Test execution completed!
echo ========================================
echo.
echo Reports generated at:
echo   HTML: reports\html\test_report.html
echo   JSON: reports\json\test_results.json
echo   API Errors: reports\json\api_errors.json
echo.

pause

