"""
Configuration file for UtilityHub360 Automation Testing
"""

import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent
REPORTS_DIR = BASE_DIR / 'reports'
DATA_DIR = BASE_DIR / 'data'
SCREENSHOTS_DIR = REPORTS_DIR / 'screenshots'

# Application URLs
BASE_URL = os.getenv('BASE_URL', 'http://localhost:3000')
API_BASE_URL = os.getenv('API_BASE_URL', 'https://api.utilityhub360.com/api')

# Browser Configuration
BROWSER = os.getenv('BROWSER', 'chrome')  # chrome, firefox, edge
HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'
WINDOW_SIZE = (1920, 1080)

# Timeouts (in seconds)
IMPLICIT_WAIT = 10
EXPLICIT_WAIT = 20
PAGE_LOAD_TIMEOUT = 30

# Test Configuration
TAKE_SCREENSHOT_ON_FAILURE = True
RETRY_FAILED_TESTS = 1
PARALLEL_WORKERS = 4

# Test User Credentials
TEST_USERS = {
    'valid_user': {
        'email': 'test@utilityhub360.com',
        'password': 'Test@123456'
    },
    'admin_user': {
        'email': 'admin@utilityhub360.com',
        'password': 'Admin@123456'
    },
    'invalid_user': {
        'email': 'invalid@test.com',
        'password': 'WrongPassword'
    }
}

# API Endpoints for Monitoring
API_ENDPOINTS = {
    'auth': '/Auth',
    'login': '/Auth/login',
    'register': '/Auth/register',
    'me': '/Auth/me',
    'loans': '/Loans',
    'bills': '/Bills',
    'notifications': '/Notifications',
    'bank_accounts': '/BankAccounts',
    'transactions': '/Transactions',
    'user_profile': '/UserProfile',
}

# Pages to Test
PAGES_TO_TEST = [
    {'name': 'Login', 'path': '/login', 'requires_auth': False},
    {'name': 'Register', 'path': '/register', 'requires_auth': False},
    {'name': 'Dashboard', 'path': '/dashboard', 'requires_auth': True},
    {'name': 'Settings', 'path': '/settings', 'requires_auth': True},
    {'name': 'Bills', 'path': '/bills', 'requires_auth': True},
    {'name': 'Loans', 'path': '/loans', 'requires_auth': True},
    {'name': 'Transactions', 'path': '/transactions', 'requires_auth': True},
    {'name': 'Bank Accounts', 'path': '/bank-accounts', 'requires_auth': True},
    {'name': 'Apportioner', 'path': '/apportioner', 'requires_auth': True},
    {'name': 'Savings', 'path': '/savings', 'requires_auth': True},
    {'name': 'Notifications', 'path': '/notifications', 'requires_auth': True},
    {'name': 'Reports', 'path': '/reports', 'requires_auth': True},
]

# Locators Strategy
LOCATOR_STRATEGY = 'css'  # css, xpath, id, name, class

# Logging Configuration
LOG_LEVEL = 'INFO'  # DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOG_FILE = REPORTS_DIR / 'logs' / 'test_execution.log'

# Report Configuration
HTML_REPORT_PATH = REPORTS_DIR / 'html' / 'test_report.html'
JSON_REPORT_PATH = REPORTS_DIR / 'json' / 'test_results.json'
API_ERRORS_REPORT = REPORTS_DIR / 'json' / 'api_errors.json'

# Create necessary directories
for directory in [REPORTS_DIR, DATA_DIR, SCREENSHOTS_DIR, 
                  REPORTS_DIR / 'html', REPORTS_DIR / 'json', 
                  REPORTS_DIR / 'logs']:
    directory.mkdir(parents=True, exist_ok=True)

