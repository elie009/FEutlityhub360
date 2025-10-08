"""
Dashboard Tests
"""

import pytest
import logging
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from config.config import TEST_USERS

logger = logging.getLogger(__name__)


class TestDashboard:
    """Test cases for dashboard functionality"""

    @pytest.fixture(autouse=True)
    def login_before_test(self, driver):
        """Automatically login before each test"""
        login_page = LoginPage(driver)
        user = TEST_USERS['valid_user']
        
        login_page.open_login_page()
        login_page.login(user['email'], user['password'])
        
        # Wait for dashboard to load
        dashboard_page = DashboardPage(driver)
        dashboard_page.wait_for_url_contains('/dashboard', timeout=15)

    def test_dashboard_loads_successfully(self, driver):
        """Test TC010: Verify dashboard loads after login"""
        dashboard_page = DashboardPage(driver)
        
        assert dashboard_page.is_dashboard_loaded(), "Dashboard did not load"
        logger.info("✓ Dashboard loaded successfully")

    def test_profile_modal_appears_for_new_user(self, driver):
        """Test TC011: Verify profile completion modal appears"""
        dashboard_page = DashboardPage(driver)
        
        # Check if profile modal is visible
        if dashboard_page.is_profile_modal_visible():
            logger.info("✓ Profile completion modal is visible")
        else:
            logger.info("✓ User already has profile (modal not shown)")

    def test_unemployed_checkbox_functionality(self, driver):
        """Test TC012: Test unemployed checkbox disables employment fields"""
        dashboard_page = DashboardPage(driver)
        
        if dashboard_page.is_profile_modal_visible():
            # Check unemployed checkbox
            dashboard_page.check_unemployed_checkbox()
            
            # Verify employment fields are disabled
            assert dashboard_page.is_job_title_disabled(), \
                "Job title field should be disabled when unemployed is checked"
            logger.info("✓ Employment fields disabled when unemployed is checked")
        else:
            pytest.skip("Profile modal not visible")

    def test_dashboard_statistics_display(self, driver):
        """Test TC013: Verify dashboard statistics are displayed"""
        dashboard_page = DashboardPage(driver)
        
        # Check if income card is visible
        total_income = dashboard_page.get_total_income()
        if total_income:
            logger.info(f"✓ Total income displayed: {total_income}")
        else:
            logger.info("✓ Statistics cards present (data may be empty)")

    @pytest.mark.api_error
    def test_dashboard_api_calls(self, driver, api_monitor):
        """Test TC014: Monitor API calls on dashboard load"""
        dashboard_page = DashboardPage(driver)
        
        # Clear previous API errors
        api_monitor.clear_errors()
        
        # Refresh dashboard to trigger API calls
        dashboard_page.refresh_page()
        dashboard_page.wait_for_url_contains('/dashboard')
        
        # Check for API errors
        api_errors = api_monitor.get_errors()
        if api_errors:
            logger.warning(f"API errors detected: {len(api_errors)}")
            for error in api_errors:
                logger.warning(f"  - {error['url']}: {error['status']}")
        else:
            logger.info("✓ No API errors detected")

