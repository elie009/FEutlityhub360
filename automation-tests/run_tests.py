"""
Main test runner script
Execute all automation tests and generate reports
"""

import sys
import subprocess
import logging
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """Main test execution function"""
    logger.info("=" * 80)
    logger.info("🚀 Starting UtilityHub360 Automation Test Suite")
    logger.info("=" * 80)
    
    start_time = datetime.now()
    
    # Pytest command with options
    pytest_args = [
        'pytest',
        'tests/',
        '-v',  # Verbose output
        '--tb=short',  # Short traceback format
        '--html=reports/html/test_report.html',  # HTML report
        '--self-contained-html',  # Embed assets in HTML
        '-n', '4',  # Run with 4 parallel workers
        '--maxfail=10',  # Stop after 10 failures
        '--reruns=1',  # Rerun failed tests once
        '--reruns-delay=2',  # Wait 2 seconds before rerun
    ]
    
    try:
        # Run pytest
        result = subprocess.run(pytest_args, check=False)
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info("=" * 80)
        logger.info(f"✓ Test execution completed in {duration:.2f} seconds")
        logger.info("=" * 80)
        
        # Print report locations
        logger.info("\n📊 Test Reports Generated:")
        logger.info(f"   • HTML Report: reports/html/test_report.html")
        logger.info(f"   • JSON Report: reports/json/test_results.json")
        logger.info(f"   • API Errors:  reports/json/api_errors.json")
        logger.info(f"   • Screenshots: reports/screenshots/")
        logger.info(f"   • Logs:        reports/logs/test_execution.log")
        
        # Exit with pytest's exit code
        sys.exit(result.returncode)
        
    except KeyboardInterrupt:
        logger.warning("\n⚠️  Test execution interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Test execution failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

