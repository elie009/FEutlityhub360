"""
Base Page class with common methods for all page objects
"""

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.by import By
import logging
from config.config import EXPLICIT_WAIT, BASE_URL

logger = logging.getLogger(__name__)


class BasePage:
    """Base class for all page objects"""

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, EXPLICIT_WAIT)
        self.base_url = BASE_URL

    def open(self, path=''):
        """Open a specific page"""
        url = f"{self.base_url}{path}"
        logger.info(f"Opening URL: {url}")
        self.driver.get(url)
        return self

    def find_element(self, locator, timeout=EXPLICIT_WAIT):
        """Find an element with explicit wait"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
            logger.debug(f"Element found: {locator}")
            return element
        except TimeoutException:
            logger.error(f"Element not found: {locator}")
            raise

    def find_elements(self, locator, timeout=EXPLICIT_WAIT):
        """Find multiple elements"""
        try:
            elements = WebDriverWait(self.driver, timeout).until(
                EC.presence_of_all_elements_located(locator)
            )
            logger.debug(f"Found {len(elements)} elements: {locator}")
            return elements
        except TimeoutException:
            logger.error(f"Elements not found: {locator}")
            return []

    def click(self, locator, timeout=EXPLICIT_WAIT):
        """Click an element"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable(locator)
            )
            element.click()
            logger.info(f"Clicked element: {locator}")
        except TimeoutException:
            logger.error(f"Element not clickable: {locator}")
            raise

    def send_keys(self, locator, text, clear_first=True):
        """Send keys to an input field"""
        element = self.find_element(locator)
        if clear_first:
            element.clear()
        element.send_keys(text)
        logger.info(f"Entered text into {locator}")

    def get_text(self, locator):
        """Get text from an element"""
        element = self.find_element(locator)
        text = element.text
        logger.debug(f"Got text from {locator}: {text}")
        return text

    def is_element_visible(self, locator, timeout=EXPLICIT_WAIT):
        """Check if element is visible"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False

    def is_element_present(self, locator):
        """Check if element is present in DOM"""
        try:
            self.driver.find_element(*locator)
            return True
        except NoSuchElementException:
            return False

    def wait_for_url_contains(self, text, timeout=EXPLICIT_WAIT):
        """Wait for URL to contain specific text"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.url_contains(text)
            )
            logger.info(f"URL contains: {text}")
            return True
        except TimeoutException:
            logger.error(f"URL does not contain: {text}")
            return False

    def get_current_url(self):
        """Get current page URL"""
        return self.driver.current_url

    def get_page_title(self):
        """Get page title"""
        return self.driver.title

    def scroll_to_element(self, locator):
        """Scroll to an element"""
        element = self.find_element(locator)
        self.driver.execute_script("arguments[0].scrollIntoView();", element)
        logger.info(f"Scrolled to element: {locator}")

    def execute_script(self, script, *args):
        """Execute JavaScript"""
        return self.driver.execute_script(script, *args)

    def switch_to_alert(self):
        """Switch to alert"""
        return self.wait.until(EC.alert_is_present())

    def get_alert_text(self):
        """Get alert text"""
        alert = self.switch_to_alert()
        return alert.text

    def accept_alert(self):
        """Accept alert"""
        alert = self.switch_to_alert()
        alert.accept()
        logger.info("Alert accepted")

    def dismiss_alert(self):
        """Dismiss alert"""
        alert = self.switch_to_alert()
        alert.dismiss()
        logger.info("Alert dismissed")

    def refresh_page(self):
        """Refresh the current page"""
        self.driver.refresh()
        logger.info("Page refreshed")

    def get_attribute(self, locator, attribute):
        """Get attribute value from element"""
        element = self.find_element(locator)
        return element.get_attribute(attribute)

    def wait_for_element_to_disappear(self, locator, timeout=EXPLICIT_WAIT):
        """Wait for an element to disappear"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.invisibility_of_element_located(locator)
            )
            logger.info(f"Element disappeared: {locator}")
            return True
        except TimeoutException:
            logger.error(f"Element still visible: {locator}")
            return False

