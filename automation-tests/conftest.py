"""
Pytest configuration and fixtures
"""

import pytest
import logging
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from datetime import datetime
from pathlib import Path

from config.config import (
    BROWSER, HEADLESS, WINDOW_SIZE, IMPLICIT_WAIT, 
    PAGE_LOAD_TIMEOUT, SCREENSHOTS_DIR, TAKE_SCREENSHOT_ON_FAILURE
)
from utils.api_monitor import APIMonitor
from utils.report_generator import ReportGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('reports/logs/test_execution.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Global report generator
report_generator = ReportGenerator()


def pytest_addoption(parser):
    """Add custom command line options"""
    parser.addoption(
        "--browser",
        action="store",
        default=BROWSER,
        help="Browser to run tests: chrome, firefox, edge"
    )
    parser.addoption(
        "--headless",
        action="store_true",
        default=HEADLESS,
        help="Run tests in headless mode"
    )


@pytest.fixture(scope='function')
def driver(request):
    """WebDriver fixture"""
    browser = request.config.getoption("--browser")
    headless = request.config.getoption("--headless")
    
    logger.info(f"Initializing {browser} driver (headless: {headless})")
    
    # Initialize driver based on browser choice
    if browser.lower() == 'chrome':
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument(f'--window-size={WINDOW_SIZE[0]},{WINDOW_SIZE[1]}')
        driver = webdriver.Chrome(
            service=ChromeService(ChromeDriverManager().install()),
            options=options
        )
    elif browser.lower() == 'firefox':
        options = webdriver.FirefoxOptions()
        if headless:
            options.add_argument('--headless')
        options.add_argument(f'--width={WINDOW_SIZE[0]}')
        options.add_argument(f'--height={WINDOW_SIZE[1]}')
        driver = webdriver.Firefox(
            service=FirefoxService(GeckoDriverManager().install()),
            options=options
        )
    elif browser.lower() == 'edge':
        options = webdriver.EdgeOptions()
        if headless:
            options.add_argument('--headless')
        options.add_argument(f'--window-size={WINDOW_SIZE[0]},{WINDOW_SIZE[1]}')
        driver = webdriver.Edge(
            service=EdgeService(EdgeChromiumDriverManager().install()),
            options=options
        )
    else:
        raise ValueError(f"Unsupported browser: {browser}")
    
    # Set timeouts
    driver.implicitly_wait(IMPLICIT_WAIT)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    
    # Maximize window if not headless
    if not headless:
        driver.maximize_window()
    
    yield driver
    
    # Take screenshot on failure
    if request.node.rep_call.failed and TAKE_SCREENSHOT_ON_FAILURE:
        take_screenshot(driver, request.node.nodeid)
    
    # Cleanup
    driver.quit()
    logger.info("Driver closed")


@pytest.fixture(scope='function')
def api_monitor(driver):
    """API Monitor fixture"""
    monitor = APIMonitor(driver)
    
    # Inject monitoring script
    try:
        monitor.inject_monitoring_script()
    except Exception as e:
        logger.warning(f"Could not inject API monitoring script: {e}")
    
    yield monitor
    
    # Save errors at the end of test
    errors = monitor.get_errors()
    if errors:
        monitor.save_errors_to_file(test_name="test")


def take_screenshot(driver, test_name):
    """Take screenshot on test failure"""
    try:
        # Create screenshots directory if it doesn't exist
        SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Generate filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_test_name = test_name.replace('/', '_').replace('::', '_')
        filename = f"{safe_test_name}_{timestamp}.png"
        filepath = SCREENSHOTS_DIR / filename
        
        # Take screenshot
        driver.save_screenshot(str(filepath))
        logger.info(f"Screenshot saved: {filepath}")
        
        # Add to report
        report_generator.add_screenshot(test_name, str(filepath))
        
        return str(filepath)
    except Exception as e:
        logger.error(f"Failed to take screenshot: {e}")
        return None


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Hook to capture test results"""
    outcome = yield
    rep = outcome.get_result()
    
    # Add report to request for screenshot logic
    setattr(item, f"rep_{rep.when}", rep)
    
    # Capture test result for report
    if rep.when == 'call':
        test_name = item.nodeid
        status = 'PASSED' if rep.passed else 'FAILED' if rep.failed else 'SKIPPED'
        duration = rep.duration
        error_message = str(rep.longrepr) if rep.failed else None
        
        report_generator.add_test_result(
            test_name=test_name,
            status=status,
            duration=duration,
            error_message=error_message
        )


def pytest_sessionfinish(session, exitstatus):
    """Hook to generate final report"""
    logger.info("Generating test reports...")
    
    # Generate JSON report
    report_generator.generate_json_report()
    
    # Generate HTML report
    html_report = report_generator.generate_html_report()
    if html_report:
        logger.info(f"✓ HTML Report: {html_report}")
    
    logger.info("Test execution completed")

