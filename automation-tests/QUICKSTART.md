# UtilityHub360 Automation Testing - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd automation-tests
pip install -r requirements.txt
```

### Step 2: Configure Test Settings
Edit `config/config.py` to set your:
- Application URL (default: http://localhost:3000)
- API URL (default: https://api.utilityhub360.com/api)
- Test user credentials

### Step 3: Run Tests
```bash
# Run all tests
python run_tests.py

# Or use pytest directly
pytest tests/ -v
```

### Step 4: View Reports
Open the generated HTML report:
- **Windows**: `reports\html\test_report.html`
- **Mac/Linux**: `reports/html/test_report.html`

## 📊 Running Specific Tests

### Run Authentication Tests Only
```bash
pytest tests/test_auth.py -v
```

### Run Dashboard Tests
```bash
pytest tests/test_dashboard.py -v
```

### Run Full Regression Suite
```bash
pytest tests/test_regression.py -v
```

### Run Smoke Tests
```bash
pytest -m smoke -v
```

### Run with Specific Browser
```bash
# Chrome
pytest --browser chrome

# Firefox
pytest --browser firefox

# Edge
pytest --browser edge
```

### Run in Headless Mode
```bash
pytest --headless
```

### Run Tests in Parallel (Faster)
```bash
pytest -n 4  # 4 parallel workers
pytest -n auto  # Auto-detect CPU count
```

## 📝 Test Reports

After running tests, check these locations:

### HTML Report
- **Path**: `reports/html/test_report.html`
- **Contains**: Interactive test results, statistics, screenshots

### JSON Report
- **Path**: `reports/json/test_results.json`
- **Contains**: Machine-readable test data

### API Error Log
- **Path**: `reports/json/api_errors.json`
- **Contains**: All detected API errors with details

### Screenshots
- **Path**: `reports/screenshots/`
- **Contains**: Screenshots of test failures

### Logs
- **Path**: `reports/logs/test_execution.log`
- **Contains**: Detailed execution logs

## 🐛 Common Issues & Solutions

### Issue: WebDriver not found
**Solution**: WebDriver Manager will auto-download drivers. Ensure you have internet connection.

### Issue: Tests fail to connect to application
**Solution**: 
1. Check if your React app is running: `npm start`
2. Verify BASE_URL in `config/config.py`

### Issue: API errors detected
**Solution**: Check `reports/json/api_errors.json` for details on which endpoints are failing.

### Issue: Tests run too slow
**Solution**: Run tests in parallel:
```bash
pytest -n 4
```

## 💡 Tips for Best Results

1. **Start your React app** before running tests:
   ```bash
   npm start  # In your main project directory
   ```

2. **Use valid test credentials** in `config/config.py`

3. **Run smoke tests first** to verify basic functionality:
   ```bash
   pytest -m smoke
   ```

4. **Check logs** if tests fail:
   ```bash
   cat reports/logs/test_execution.log
   ```

5. **Update test data** in `data/test_data.json` as needed

## 🎯 Next Steps

1. ✅ Review generated HTML report
2. ✅ Check API error logs
3. ✅ Fix any failing tests
4. ✅ Add more test cases as needed
5. ✅ Integrate with CI/CD pipeline

## 📞 Need Help?

- Check logs in `reports/logs/`
- Review screenshots in `reports/screenshots/`
- See API errors in `reports/json/api_errors.json`

Happy Testing! 🎉

