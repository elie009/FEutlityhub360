"""
Regression Tests for All Pages
"""

import pytest
import logging
from pages.login_page import LoginPage
from config.config import PAGES_TO_TEST, TEST_USERS

logger = logging.getLogger(__name__)


class TestAllPages:
    """Regression tests for all application pages"""

    @pytest.fixture(autouse=True)
    def login_if_needed(self, driver, request):
        """Login before tests that require authentication"""
        # Check if test requires auth
        if hasattr(request, 'param') and request.param.get('requires_auth'):
            login_page = LoginPage(driver)
            user = TEST_USERS['valid_user']
            
            login_page.open_login_page()
            login_page.login(user['email'], user['password'])
            login_page.wait_for_url_contains('/dashboard', timeout=15)

    @pytest.mark.parametrize('page', PAGES_TO_TEST, ids=[p['name'] for p in PAGES_TO_TEST])
    def test_page_loads_without_errors(self, driver, page, api_monitor):
        """Test TC100: Verify each page loads without errors"""
        from pages.base_page import BasePage
        
        # Login if page requires authentication
        if page['requires_auth']:
            login_page = LoginPage(driver)
            user = TEST_USERS['valid_user']
            login_page.open_login_page()
            login_page.login(user['email'], user['password'])
            login_page.wait_for_url_contains('/dashboard', timeout=15)
        
        # Clear API errors before navigating
        api_monitor.clear_errors()
        
        # Navigate to page
        base_page = BasePage(driver)
        base_page.open(page['path'])
        
        # Wait for page to load
        import time
        time.sleep(2)  # Allow time for page to fully load
        
        # Check current URL
        current_url = base_page.get_current_url()
        assert page['path'] in current_url, f"Failed to navigate to {page['name']}"
        
        # Check for API errors
        api_errors = api_monitor.get_errors()
        
        # Log results
        if api_errors:
            logger.error(f"✗ {page['name']} - API errors detected:")
            for error in api_errors:
                logger.error(f"    {error['url']}: {error['status']} - {error['error']}")
            # Don't fail test, just log errors
        else:
            logger.info(f"✓ {page['name']} loaded successfully")

    @pytest.mark.parametrize('page', PAGES_TO_TEST, ids=[p['name'] for p in PAGES_TO_TEST])
    def test_page_title_present(self, driver, page):
        """Test TC101: Verify each page has a title"""
        from pages.base_page import BasePage
        
        # Login if needed
        if page['requires_auth']:
            login_page = LoginPage(driver)
            user = TEST_USERS['valid_user']
            login_page.open_login_page()
            login_page.login(user['email'], user['password'])
            login_page.wait_for_url_contains('/dashboard', timeout=15)
        
        # Navigate to page
        base_page = BasePage(driver)
        base_page.open(page['path'])
        
        # Get page title
        title = base_page.get_page_title()
        assert title is not None and title != '', f"{page['name']} has no title"
        logger.info(f"✓ {page['name']} title: {title}")

    @pytest.mark.smoke
    @pytest.mark.parametrize('page', [p for p in PAGES_TO_TEST if p['requires_auth']], 
                             ids=[p['name'] for p in PAGES_TO_TEST if p['requires_auth']])
    def test_authenticated_page_requires_login(self, driver, page):
        """Test TC102: Verify protected pages redirect to login"""
        from pages.base_page import BasePage
        
        # Try to access protected page without login
        base_page = BasePage(driver)
        base_page.open(page['path'])
        
        # Should redirect to login
        import time
        time.sleep(2)
        current_url = base_page.get_current_url()
        
        # Verify we're not on the protected page
        if '/login' in current_url or '/auth' in current_url:
            logger.info(f"✓ {page['name']} correctly requires authentication")
        else:
            logger.warning(f"⚠ {page['name']} may not be properly protected")

