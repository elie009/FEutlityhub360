# UtilityHub360 Automation Testing Framework

## Overview
Comprehensive automation testing framework for UtilityHub360 frontend using Python Selenium with Page Object Model (POM) design pattern.

## Features
- ✅ Regression Testing for all pages
- ✅ API Error Detection & Logging
- ✅ Cross-browser Testing (Chrome, Firefox, Edge)
- ✅ HTML & JSON Test Reports
- ✅ Screenshot Capture on Failures
- ✅ Test Data Management
- ✅ Parallel Test Execution
- ✅ CI/CD Integration Ready

## Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Chrome/Firefox/Edge browser installed

## Installation

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Download WebDrivers
The framework will automatically download the appropriate WebDriver for your browser.

## Project Structure
```
automation-tests/
├── config/           # Configuration files
│   ├── config.py     # Main configuration
│   └── test_data.json
├── pages/            # Page Object Model classes
│   ├── base_page.py
│   ├── login_page.py
│   ├── dashboard_page.py
│   ├── settings_page.py
│   └── ... (other pages)
├── tests/            # Test cases
│   ├── test_auth.py
│   ├── test_dashboard.py
│   ├── test_profile.py
│   └── ... (other tests)
├── utils/            # Utility functions
│   ├── logger.py
│   ├── api_monitor.py
│   ├── screenshot.py
│   └── report_generator.py
├── data/             # Test data files
│   └── test_users.json
├── reports/          # Test execution reports
│   ├── html/
│   ├── json/
│   └── screenshots/
├── requirements.txt  # Python dependencies
├── pytest.ini        # Pytest configuration
└── run_tests.py      # Main test runner
```

## Running Tests

### Run All Tests
```bash
python run_tests.py
```

### Run Specific Test Suite
```bash
pytest tests/test_auth.py -v
```

### Run with Specific Browser
```bash
pytest --browser chrome
pytest --browser firefox
pytest --browser edge
```

### Run in Headless Mode
```bash
pytest --headless
```

### Run Parallel Tests
```bash
pytest -n 4  # Run with 4 parallel workers
```

### Generate HTML Report
```bash
pytest --html=reports/html/report.html --self-contained-html
```

## Test Reports

### HTML Reports
Located in: `reports/html/`
- Interactive HTML report with test results
- Screenshots of failures
- Execution time and statistics

### JSON Reports
Located in: `reports/json/`
- Machine-readable test results
- API error logs
- Performance metrics

### Screenshots
Located in: `reports/screenshots/`
- Automatic screenshot capture on test failures
- Timestamped for easy identification

## Configuration

Edit `config/config.py` to customize:
- Base URL
- Browser settings
- Timeout values
- API endpoints
- Test user credentials

## Test Data

Test data is stored in JSON format in the `data/` folder:
- `test_users.json` - Test user credentials
- `test_data.json` - General test data

## API Error Monitoring

The framework automatically monitors and logs:
- Failed API calls
- HTTP error codes (4xx, 5xx)
- Network errors
- CORS errors
- Timeout errors

Results are saved in: `reports/json/api_errors.json`

## Best Practices

1. **Page Object Model**: All page interactions are in `pages/` folder
2. **Data-Driven Testing**: Use JSON files for test data
3. **Assertions**: Use descriptive assertion messages
4. **Screenshots**: Automatically captured on failures
5. **Logging**: Comprehensive logging for debugging

## CI/CD Integration

### GitHub Actions
```yaml
# Add to .github/workflows/test.yml
- name: Run Automation Tests
  run: |
    cd automation-tests
    pip install -r requirements.txt
    python run_tests.py
```

### Jenkins
```groovy
stage('Automation Tests') {
    steps {
        sh 'cd automation-tests && pip install -r requirements.txt'
        sh 'cd automation-tests && python run_tests.py'
    }
}
```

## Troubleshooting

### WebDriver Issues
- Ensure your browser is up to date
- WebDriver Manager will auto-download the correct driver

### Timeout Errors
- Increase timeout values in `config/config.py`
- Check network connectivity

### Element Not Found
- Verify page locators in page objects
- Check if page has fully loaded

## Contributing

1. Add new page objects in `pages/`
2. Create test cases in `tests/`
3. Follow POM design pattern
4. Add descriptive docstrings
5. Update test data in `data/` if needed

## Support

For issues or questions:
- Check logs in `reports/logs/`
- Review screenshots in `reports/screenshots/`
- Check API error logs in `reports/json/api_errors.json`

