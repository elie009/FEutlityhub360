"""
Test Report Generator
Generates comprehensive HTML and JSON reports
"""

import json
import logging
from datetime import datetime
from pathlib import Path
from config.config import HTML_REPORT_PATH, JSON_REPORT_PATH

logger = logging.getLogger(__name__)


class ReportGenerator:
    """Generate test execution reports"""

    def __init__(self):
        self.test_results = []
        self.api_errors = []
        self.screenshots = []

    def add_test_result(self, test_name, status, duration, error_message=None, screenshot_path=None):
        """Add a test result"""
        result = {
            'test_name': test_name,
            'status': status,  # PASSED, FAILED, SKIPPED
            'duration': duration,
            'error_message': error_message,
            'screenshot': screenshot_path,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)

    def add_api_error(self, page, url, status, error):
        """Add an API error"""
        api_error = {
            'page': page,
            'url': url,
            'status': status,
            'error': error,
            'timestamp': datetime.now().isoformat()
        }
        self.api_errors.append(api_error)

    def add_screenshot(self, test_name, path):
        """Add a screenshot reference"""
        self.screenshots.append({
            'test_name': test_name,
            'path': path,
            'timestamp': datetime.now().isoformat()
        })

    def generate_json_report(self):
        """Generate JSON report"""
        try:
            report = {
                'execution_date': datetime.now().isoformat(),
                'total_tests': len(self.test_results),
                'passed': len([r for r in self.test_results if r['status'] == 'PASSED']),
                'failed': len([r for r in self.test_results if r['status'] == 'FAILED']),
                'skipped': len([r for r in self.test_results if r['status'] == 'SKIPPED']),
                'total_api_errors': len(self.api_errors),
                'test_results': self.test_results,
                'api_errors': self.api_errors,
                'screenshots': self.screenshots
            }
            
            # Create directory if it doesn't exist
            JSON_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
            
            # Save report
            with open(JSON_REPORT_PATH, 'w') as f:
                json.dump(report, f, indent=2)
            
            logger.info(f"JSON report generated: {JSON_REPORT_PATH}")
            return report
            
        except Exception as e:
            logger.error(f"Failed to generate JSON report: {e}")
            return None

    def generate_html_report(self):
        """Generate HTML report"""
        try:
            report = self.generate_json_report()
            if not report:
                return None
            
            html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UtilityHub360 Test Report</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; padding: 20px; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }}
        .header h1 {{ margin-bottom: 10px; }}
        .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }}
        .summary-card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }}
        .summary-card h3 {{ font-size: 36px; margin-bottom: 5px; }}
        .summary-card p {{ color: #666; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }}
        .passed {{ color: #28a745; }}
        .failed {{ color: #dc3545; }}
        .skipped {{ color: #ffc107; }}
        .section {{ padding: 30px; border-top: 1px solid #eee; }}
        .section h2 {{ margin-bottom: 20px; color: #333; }}
        table {{ width: 100%; border-collapse: collapse; }}
        th, td {{ padding: 12px; text-align: left; border-bottom: 1px solid #eee; }}
        th {{ background: #f8f9fa; font-weight: 600; color: #666; }}
        .status {{ padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }}
        .status.passed {{ background: #d4edda; color: #155724; }}
        .status.failed {{ background: #f8d7da; color: #721c24; }}
        .status.skipped {{ background: #fff3cd; color: #856404; }}
        .error-message {{ color: #dc3545; font-size: 12px; margin-top: 5px; }}
        .api-error {{ background: #f8d7da; padding: 15px; margin-bottom: 10px; border-left: 4px solid #dc3545; border-radius: 4px; }}
        .api-error strong {{ display: block; margin-bottom: 5px; }}
        .footer {{ padding: 20px; text-align: center; color: #666; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 UtilityHub360 Test Execution Report</h1>
            <p>Execution Date: {report['execution_date']}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>{report['total_tests']}</h3>
                <p>Total Tests</p>
            </div>
            <div class="summary-card">
                <h3 class="passed">{report['passed']}</h3>
                <p>Passed</p>
            </div>
            <div class="summary-card">
                <h3 class="failed">{report['failed']}</h3>
                <p>Failed</p>
            </div>
            <div class="summary-card">
                <h3 class="skipped">{report['skipped']}</h3>
                <p>Skipped</p>
            </div>
        </div>
        
        <div class="section">
            <h2>📊 Test Results</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test Name</th>
                        <th>Status</th>
                        <th>Duration (s)</th>
                        <th>Error</th>
                    </tr>
                </thead>
                <tbody>
"""
            
            for result in report['test_results']:
                status_class = result['status'].lower()
                error_html = f"<div class='error-message'>{result['error_message']}</div>" if result['error_message'] else ""
                html_content += f"""
                    <tr>
                        <td>{result['test_name']}</td>
                        <td><span class="status {status_class}">{result['status']}</span></td>
                        <td>{result['duration']:.2f}</td>
                        <td>{error_html}</td>
                    </tr>
"""
            
            html_content += """
                </tbody>
            </table>
        </div>
"""
            
            if report['api_errors']:
                html_content += f"""
        <div class="section">
            <h2>⚠️ API Errors ({len(report['api_errors'])})</h2>
"""
                for error in report['api_errors']:
                    html_content += f"""
            <div class="api-error">
                <strong>Page: {error['page']}</strong>
                <div>URL: {error['url']}</div>
                <div>Status: {error['status']}</div>
                <div>Error: {error['error']}</div>
            </div>
"""
                html_content += """
        </div>
"""
            
            html_content += """
        <div class="footer">
            <p>Generated by UtilityHub360 Automation Framework</p>
        </div>
    </div>
</body>
</html>
"""
            
            # Create directory if it doesn't exist
            HTML_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
            
            # Save HTML report
            with open(HTML_REPORT_PATH, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            logger.info(f"HTML report generated: {HTML_REPORT_PATH}")
            return str(HTML_REPORT_PATH)
            
        except Exception as e:
            logger.error(f"Failed to generate HTML report: {e}")
            return None

