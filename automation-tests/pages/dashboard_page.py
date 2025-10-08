"""
Dashboard Page Object
"""

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
import logging

logger = logging.getLogger(__name__)


class DashboardPage(BasePage):
    """Dashboard page object model"""

    # Locators
    WELCOME_MESSAGE = (By.XPATH, '//*[contains(text(), "Welcome") or contains(text(), "Dashboard")]')
    PROFILE_MODAL = (By.XPATH, '//*[contains(text(), "Complete Your Profile")]')
    UNEMPLOYED_CHECKBOX = (By.XPATH, '//input[@type="checkbox"]//following-sibling::span[contains(text(), "unemployed")]')
    JOB_TITLE_INPUT = (By.CSS_SELECTOR, 'input[name="jobTitle"], input[label="Job Title"]')
    COMPANY_INPUT = (By.CSS_SELECTOR, 'input[name="company"], input[label="Company"]')
    SAVE_PROFILE_BUTTON = (By.XPATH, '//button[contains(text(), "Complete Profile") or contains(text(), "Save")]')
    
    # Stats Cards
    TOTAL_INCOME_CARD = (By.XPATH, '//*[contains(text(), "Total Income")]')
    NET_INCOME_CARD = (By.XPATH, '//*[contains(text(), "Net Income")]')
    MONTHLY_GOALS_CARD = (By.XPATH, '//*[contains(text(), "Monthly Goals")]')
    
    # Navigation
    SIDEBAR = (By.CSS_SELECTOR, '.MuiDrawer-root, nav')
    MENU_ITEMS = (By.CSS_SELECTOR, '.MuiListItem-root, .menu-item')
    
    PAGE_PATH = '/dashboard'

    def __init__(self, driver):
        super().__init__(driver)

    def open_dashboard(self):
        """Navigate to dashboard"""
        self.open(self.PAGE_PATH)
        logger.info("Opened dashboard page")
        return self

    def is_dashboard_loaded(self):
        """Check if dashboard is loaded"""
        return self.is_element_visible(self.WELCOME_MESSAGE, timeout=10)

    def is_profile_modal_visible(self):
        """Check if complete profile modal is visible"""
        return self.is_element_visible(self.PROFILE_MODAL, timeout=5)

    def check_unemployed_checkbox(self):
        """Check the unemployed checkbox"""
        self.click(self.UNEMPLOYED_CHECKBOX)
        logger.info("Checked unemployed checkbox")
        return self

    def is_job_title_disabled(self):
        """Check if job title input is disabled"""
        element = self.find_element(self.JOB_TITLE_INPUT)
        return not element.is_enabled()

    def fill_profile_form(self, data):
        """Fill profile form"""
        if 'jobTitle' in data:
            self.send_keys(self.JOB_TITLE_INPUT, data['jobTitle'])
        if 'company' in data:
            self.send_keys(self.COMPANY_INPUT, data['company'])
        logger.info("Filled profile form")
        return self

    def save_profile(self):
        """Click save profile button"""
        self.click(self.SAVE_PROFILE_BUTTON)
        logger.info("Clicked save profile button")
        return self

    def get_total_income(self):
        """Get total income value"""
        try:
            return self.get_text(self.TOTAL_INCOME_CARD)
        except:
            return None

    def navigate_to_page(self, page_name):
        """Navigate to a specific page using sidebar"""
        locator = (By.XPATH, f'//span[contains(text(), "{page_name}")]')
        self.click(locator)
        logger.info(f"Navigated to {page_name}")
        return self

