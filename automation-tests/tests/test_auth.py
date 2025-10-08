"""
Authentication Tests
"""

import pytest
import logging
from pages.login_page import LoginPage
from pages.dashboard_page import DashboardPage
from config.config import TEST_USERS

logger = logging.getLogger(__name__)


class TestAuthentication:
    """Test cases for authentication functionality"""

    def test_login_page_loads(self, driver):
        """Test TC001: Verify login page loads successfully"""
        login_page = LoginPage(driver)
        login_page.open_login_page()
        
        assert login_page.is_login_page_loaded(), "Login page did not load properly"
        assert login_page.is_welcome_text_visible(), "Welcome text not visible"
        logger.info("✓ Login page loaded successfully")

    def test_login_with_valid_credentials(self, driver):
        """Test TC002: Login with valid credentials"""
        login_page = LoginPage(driver)
        dashboard_page = DashboardPage(driver)
        
        user = TEST_USERS['valid_user']
        login_page.open_login_page()
        login_page.login(user['email'], user['password'])
        
        # Verify redirect to dashboard
        assert dashboard_page.wait_for_url_contains('/dashboard', timeout=15), \
            "Did not redirect to dashboard"
        assert dashboard_page.is_dashboard_loaded(), "Dashboard did not load"
        logger.info("✓ Login successful with valid credentials")

    def test_login_with_invalid_credentials(self, driver):
        """Test TC003: Login with invalid credentials"""
        login_page = LoginPage(driver)
        
        user = TEST_USERS['invalid_user']
        login_page.open_login_page()
        login_page.login(user['email'], user['password'])
        
        # Verify error message is displayed
        assert login_page.is_error_displayed(), "Error message not displayed"
        error_msg = login_page.get_error_message()
        assert error_msg is not None, "Error message is empty"
        logger.info(f"✓ Error message displayed: {error_msg}")

    def test_login_with_empty_email(self, driver):
        """Test TC004: Login with empty email"""
        login_page = LoginPage(driver)
        
        login_page.open_login_page()
        login_page.enter_password("SomePassword123")
        login_page.click_login_button()
        
        # Verify validation error
        current_url = login_page.get_current_url()
        assert '/dashboard' not in current_url, "Should not redirect with empty email"
        logger.info("✓ Validation prevented login with empty email")

    def test_login_with_empty_password(self, driver):
        """Test TC005: Login with empty password"""
        login_page = LoginPage(driver)
        
        login_page.open_login_page()
        login_page.enter_email("test@example.com")
        login_page.click_login_button()
        
        # Verify validation error
        current_url = login_page.get_current_url()
        assert '/dashboard' not in current_url, "Should not redirect with empty password"
        logger.info("✓ Validation prevented login with empty password")

    def test_navigate_to_register_page(self, driver):
        """Test TC006: Navigate to register page"""
        login_page = LoginPage(driver)
        
        login_page.open_login_page()
        login_page.click_register_link()
        
        # Verify redirect to register page
        assert login_page.wait_for_url_contains('/register', timeout=10), \
            "Did not redirect to register page"
        logger.info("✓ Successfully navigated to register page")

    @pytest.mark.api_error
    def test_login_api_error_handling(self, driver, api_monitor):
        """Test TC007: Verify API error handling during login"""
        login_page = LoginPage(driver)
        
        user = TEST_USERS['invalid_user']
        login_page.open_login_page()
        
        # Clear previous API errors
        api_monitor.clear_errors()
        
        # Attempt login
        login_page.login(user['email'], user['password'])
        
        # Check for API errors
        api_errors = api_monitor.get_errors()
        if api_errors:
            logger.warning(f"API errors detected: {len(api_errors)}")
            for error in api_errors:
                logger.warning(f"  - {error['url']}: {error['status']} - {error['error']}")
        
        logger.info("✓ API error handling test completed")

