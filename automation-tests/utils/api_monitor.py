"""
API Monitor Utility
Monitors and logs API calls and errors
"""

import logging
import json
from datetime import datetime
from selenium.webdriver.common.by import By
from config.config import API_ERRORS_REPORT

logger = logging.getLogger(__name__)


class APIMonitor:
    """Monitor API calls and capture errors"""

    def __init__(self, driver):
        self.driver = driver
        self.errors = []
        self.api_calls = []

    def inject_monitoring_script(self):
        """Inject JavaScript to monitor XHR requests"""
        script = """
        window.apiErrors = [];
        window.apiCalls = [];
        
        // Intercept fetch
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const url = args[0];
            const startTime = Date.now();
            
            return originalFetch.apply(this, args)
                .then(response => {
                    const endTime = Date.now();
                    const callInfo = {
                        url: url,
                        method: args[1]?.method || 'GET',
                        status: response.status,
                        duration: endTime - startTime,
                        timestamp: new Date().toISOString()
                    };
                    
                    window.apiCalls.push(callInfo);
                    
                    if (!response.ok) {
                        window.apiErrors.push({
                            ...callInfo,
                            error: `HTTP ${response.status}: ${response.statusText}`
                        });
                    }
                    
                    return response;
                })
                .catch(error => {
                    const endTime = Date.now();
                    const errorInfo = {
                        url: url,
                        method: args[1]?.method || 'GET',
                        status: 0,
                        duration: endTime - startTime,
                        error: error.message,
                        timestamp: new Date().toISOString()
                    };
                    
                    window.apiErrors.push(errorInfo);
                    window.apiCalls.push(errorInfo);
                    
                    throw error;
                });
        };
        
        // Intercept XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            this._method = method;
            this._url = url;
            this._startTime = Date.now();
            return originalXHROpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function() {
            this.addEventListener('load', function() {
                const endTime = Date.now();
                const callInfo = {
                    url: this._url,
                    method: this._method,
                    status: this.status,
                    duration: endTime - this._startTime,
                    timestamp: new Date().toISOString()
                };
                
                window.apiCalls.push(callInfo);
                
                if (this.status >= 400) {
                    window.apiErrors.push({
                        ...callInfo,
                        error: `HTTP ${this.status}: ${this.statusText}`
                    });
                }
            });
            
            this.addEventListener('error', function() {
                const endTime = Date.now();
                const errorInfo = {
                    url: this._url,
                    method: this._method,
                    status: 0,
                    duration: endTime - this._startTime,
                    error: 'Network Error',
                    timestamp: new Date().toISOString()
                };
                
                window.apiErrors.push(errorInfo);
                window.apiCalls.push(errorInfo);
            });
            
            return originalXHRSend.apply(this, arguments);
        };
        """
        
        try:
            self.driver.execute_script(script)
            logger.debug("API monitoring script injected")
        except Exception as e:
            logger.error(f"Failed to inject monitoring script: {e}")

    def get_errors(self):
        """Get captured API errors"""
        try:
            errors = self.driver.execute_script("return window.apiErrors || [];")
            self.errors.extend(errors)
            return errors
        except Exception as e:
            logger.error(f"Failed to get API errors: {e}")
            return []

    def get_api_calls(self):
        """Get all API calls"""
        try:
            calls = self.driver.execute_script("return window.apiCalls || [];")
            self.api_calls.extend(calls)
            return calls
        except Exception as e:
            logger.error(f"Failed to get API calls: {e}")
            return []

    def clear_errors(self):
        """Clear captured errors"""
        try:
            self.driver.execute_script("window.apiErrors = []; window.apiCalls = [];")
            logger.debug("API errors cleared")
        except Exception as e:
            logger.error(f"Failed to clear API errors: {e}")

    def save_errors_to_file(self, test_name=None):
        """Save API errors to JSON file"""
        try:
            # Prepare error report
            report = {
                'test_name': test_name or 'Unknown',
                'timestamp': datetime.now().isoformat(),
                'total_errors': len(self.errors),
                'errors': self.errors,
                'api_calls': self.api_calls
            }
            
            # Load existing errors if file exists
            existing_reports = []
            if API_ERRORS_REPORT.exists():
                with open(API_ERRORS_REPORT, 'r') as f:
                    existing_reports = json.load(f)
            
            # Append new report
            existing_reports.append(report)
            
            # Save to file
            with open(API_ERRORS_REPORT, 'w') as f:
                json.dump(existing_reports, f, indent=2)
            
            logger.info(f"API errors saved to {API_ERRORS_REPORT}")
            
        except Exception as e:
            logger.error(f"Failed to save API errors: {e}")

    def get_error_summary(self):
        """Get summary of API errors"""
        if not self.errors:
            return "No API errors detected"
        
        summary = {
            'total_errors': len(self.errors),
            'by_status': {},
            'by_endpoint': {}
        }
        
        for error in self.errors:
            # Count by status
            status = error.get('status', 'Unknown')
            summary['by_status'][status] = summary['by_status'].get(status, 0) + 1
            
            # Count by endpoint
            url = error.get('url', 'Unknown')
            endpoint = url.split('?')[0] if '?' in url else url
            summary['by_endpoint'][endpoint] = summary['by_endpoint'].get(endpoint, 0) + 1
        
        return summary

