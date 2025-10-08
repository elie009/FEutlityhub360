"""
Login Page Object
"""

from selenium.webdriver.common.by import By
from pages.base_page import BasePage
import logging

logger = logging.getLogger(__name__)


class LoginPage(BasePage):
    """Login page object model"""

    # Locators
    EMAIL_INPUT = (By.CSS_SELECTOR, 'input[name="email"], input[type="email"]')
    PASSWORD_INPUT = (By.CSS_SELECTOR, 'input[name="password"], input[type="password"]')
    LOGIN_BUTTON = (By.XPATH, '//button[contains(text(), "Sign In") or contains(text(), "Login")]')
    ERROR_MESSAGE = (By.CSS_SELECTOR, '.MuiAlert-message, .error-message')
    REGISTER_LINK = (By.XPATH, '//a[contains(text(), "Create Your Account") or contains(text(), "Register")]')
    FORGOT_PASSWORD_LINK = (By.XPATH, '//a[contains(text(), "Forgot Password")]')
    WELCOME_TEXT = (By.XPATH, '//*[contains(text(), "Welcome Back")]')
    
    # Page path
    PAGE_PATH = '/login'

    def __init__(self, driver):
        super().__init__(driver)

    def open_login_page(self):
        """Navigate to login page"""
        self.open(self.PAGE_PATH)
        logger.info("Opened login page")
        return self

    def enter_email(self, email):
        """Enter email address"""
        self.send_keys(self.EMAIL_INPUT, email)
        logger.info(f"Entered email: {email}")
        return self

    def enter_password(self, password):
        """Enter password"""
        self.send_keys(self.PASSWORD_INPUT, password)
        logger.info("Entered password")
        return self

    def click_login_button(self):
        """Click login button"""
        self.click(self.LOGIN_BUTTON)
        logger.info("Clicked login button")
        return self

    def login(self, email, password):
        """Complete login flow"""
        self.enter_email(email)
        self.enter_password(password)
        self.click_login_button()
        logger.info(f"Performed login with email: {email}")
        return self

    def get_error_message(self):
        """Get error message text"""
        try:
            return self.get_text(self.ERROR_MESSAGE)
        except:
            return None

    def is_error_displayed(self):
        """Check if error message is displayed"""
        return self.is_element_visible(self.ERROR_MESSAGE, timeout=5)

    def click_register_link(self):
        """Click register link"""
        self.click(self.REGISTER_LINK)
        logger.info("Clicked register link")
        return self

    def is_welcome_text_visible(self):
        """Check if welcome text is visible"""
        return self.is_element_visible(self.WELCOME_TEXT)

    def is_login_page_loaded(self):
        """Verify login page is fully loaded"""
        return (self.is_element_visible(self.EMAIL_INPUT) and 
                self.is_element_visible(self.PASSWORD_INPUT) and
                self.is_element_visible(self.LOGIN_BUTTON))

