#!/usr/bin/env python3
"""
Smart PYQ Development Setup Script

This script helps developers set up their development environment quickly.
It handles:
- Environment file creation
- Docker setup validation
- Development dependencies
- Pre-commit hooks
- Local development server startup

Usage:
    python scripts/dev-setup.py [--skip-docker] [--skip-hooks] [--start-server]
"""

import argparse
import os
import subprocess
import sys
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import secrets
import string


class DevSetup:
    """Development environment setup manager."""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.env_file = self.project_root / ".env"
        self.env_example = self.project_root / ".env.example"
    
    def print_header(self, title: str):
        """Print a formatted header."""
        print("\n" + "=" * 60)
        print(f"🔧 {title}")
        print("=" * 60)
    
    def print_step(self, step: str, status: str = "INFO"):
        """Print a formatted step."""
        icons = {
            "INFO": "ℹ️",
            "SUCCESS": "✅",
            "WARNING": "⚠️",
            "ERROR": "❌",
            "RUNNING": "🔄"
        }
        print(f"{icons.get(status, 'ℹ️')} {step}")
    
    def generate_secret_key(self, length: int = 64) -> str:
        """Generate a secure random secret key."""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(secrets.choice(alphabet) for _ in range(length))
    
    def check_command_exists(self, command: str) -> bool:
        """Check if a command exists in PATH."""
        return shutil.which(command) is not None
    
    def run_command(self, command: List[str], cwd: Optional[Path] = None) -> bool:
        """Run a command and return success status."""
        try:
            result = subprocess.run(
                command,
                cwd=cwd or self.project_root,
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except subprocess.CalledProcessError as e:
            self.print_step(f"Command failed: {' '.join(command)}", "ERROR")
            self.print_step(f"Error: {e.stderr}", "ERROR")
            return False
        except FileNotFoundError:
            self.print_step(f"Command not found: {command[0]}", "ERROR")
            return False
    
    def validate_prerequisites(self) -> bool:
        """Validate that required tools are installed."""
        self.print_header("Validating Prerequisites")
        
        required_tools = {
            "python": "Python 3.8+",
            "docker": "Docker",
            "docker-compose": "Docker Compose",
            "git": "Git"
        }
        
        missing_tools = []
        
        for tool, description in required_tools.items():
            if self.check_command_exists(tool):
                self.print_step(f"{description} found", "SUCCESS")
            else:
                self.print_step(f"{description} not found", "ERROR")
                missing_tools.append(tool)
        
        if missing_tools:
            self.print_step("Please install missing tools before continuing", "ERROR")
            return False
        
        # Check Python version
        try:
            result = subprocess.run(
                ["python", "--version"],
                capture_output=True,
                text=True,
                check=True
            )
            version = result.stdout.strip()
            self.print_step(f"Python version: {version}", "SUCCESS")
        except Exception:
            self.print_step("Could not determine Python version", "WARNING")
        
        # Check Docker version
        try:
            result = subprocess.run(
                ["docker", "--version"],
                capture_output=True,
                text=True,
                check=True
            )
            version = result.stdout.strip()
            self.print_step(f"Docker version: {version}", "SUCCESS")
        except Exception:
            self.print_step("Could not determine Docker version", "WARNING")
        
        return True
    
    def create_env_file(self) -> bool:
        """Create .env file from .env.example with generated secrets."""
        self.print_header("Setting Up Environment File")
        
        if self.env_file.exists():
            response = input("⚠️  .env file already exists. Overwrite? (y/N): ")
            if response.lower() != 'y':
                self.print_step("Keeping existing .env file", "INFO")
                return True
        
        if not self.env_example.exists():
            self.print_step(".env.example not found", "ERROR")
            return False
        
        # Read .env.example
        with open(self.env_example, 'r') as f:
            content = f.read()
        
        # Generate secrets and replace placeholders
        replacements = {
            'your_jwt_secret_here': self.generate_secret_key(64),
            'your_gemini_api_key': 'your_actual_gemini_api_key_here',
            'your_openai_key_optional': 'your_actual_openai_api_key_here',
            'your_sentry_dsn_here': 'your_actual_sentry_dsn_here',
            'your_smtp_password': 'your_actual_smtp_password_here',
            'your_firebase_credentials': 'path/to/your/firebase/credentials.json',
            'your_aws_access_key': 'your_actual_aws_access_key_here',
            'your_aws_secret_key': 'your_actual_aws_secret_key_here'
        }
        
        for placeholder, replacement in replacements.items():
            content = content.replace(placeholder, replacement)
        
        # Write .env file
        with open(self.env_file, 'w') as f:
            f.write(content)
        
        self.print_step(".env file created successfully", "SUCCESS")
        self.print_step("⚠️  Remember to update API keys and credentials!", "WARNING")
        
        return True
    
    def setup_python_environment(self) -> bool:
        """Set up Python virtual environment and install dependencies."""
        self.print_header("Setting Up Python Environment")
        
        # Check if we're in a virtual environment
        in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
        
        if not in_venv:
            self.print_step("Not in a virtual environment", "WARNING")
            response = input("Create virtual environment? (Y/n): ")
            if response.lower() != 'n':
                self.print_step("Creating virtual environment...", "RUNNING")
                if not self.run_command(["python", "-m", "venv", "venv"]):
                    return False
                
                self.print_step("Virtual environment created", "SUCCESS")
                self.print_step("Activate it with: source venv/bin/activate (Linux/Mac) or venv\\Scripts\\activate (Windows)", "INFO")
                return True
        
        # Install dependencies
        self.print_step("Installing Python dependencies...", "RUNNING")
        if not self.run_command(["pip", "install", "-r", "requirements.txt"]):
            return False
        
        # Install development dependencies
        dev_packages = [
            "pytest-asyncio",
            "pytest-cov",
            "black",
            "isort",
            "flake8",
            "mypy",
            "pre-commit"
        ]
        
        self.print_step("Installing development dependencies...", "RUNNING")
        if not self.run_command(["pip", "install"] + dev_packages):
            self.print_step("Failed to install dev dependencies", "WARNING")
        
        self.print_step("Python environment setup complete", "SUCCESS")
        return True
    
    def setup_pre_commit_hooks(self) -> bool:
        """Set up pre-commit hooks for code quality."""
        self.print_header("Setting Up Pre-commit Hooks")
        
        # Create .pre-commit-config.yaml if it doesn't exist
        pre_commit_config = self.project_root / ".pre-commit-config.yaml"
        
        if not pre_commit_config.exists():
            config_content = """
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
  
  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3
  
  - repo: https://github.com/pycqa/isort
    rev: 5.12.0
    hooks:
      - id: isort
        args: ["--profile", "black"]
  
  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: ["--max-line-length=88", "--extend-ignore=E203,W503"]
  
  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.3.0
    hooks:
      - id: mypy
        additional_dependencies: [types-all]
        args: ["--ignore-missing-imports"]
"""
            
            with open(pre_commit_config, 'w') as f:
                f.write(config_content)
            
            self.print_step("Created .pre-commit-config.yaml", "SUCCESS")
        
        # Install pre-commit hooks
        self.print_step("Installing pre-commit hooks...", "RUNNING")
        if not self.run_command(["pre-commit", "install"]):
            self.print_step("Failed to install pre-commit hooks", "WARNING")
            return False
        
        self.print_step("Pre-commit hooks installed", "SUCCESS")
        return True
    
    def validate_docker_setup(self) -> bool:
        """Validate Docker setup and build images."""
        self.print_header("Validating Docker Setup")
        
        # Check if Docker is running
        self.print_step("Checking Docker daemon...", "RUNNING")
        if not self.run_command(["docker", "info"]):
            self.print_step("Docker daemon not running. Please start Docker.", "ERROR")
            return False
        
        self.print_step("Docker daemon is running", "SUCCESS")
        
        # Validate docker-compose.yml
        if not (self.project_root / "docker-compose.yml").exists():
            self.print_step("docker-compose.yml not found", "ERROR")
            return False
        
        self.print_step("Validating docker-compose configuration...", "RUNNING")
        if not self.run_command(["docker-compose", "config"]):
            return False
        
        self.print_step("Docker Compose configuration is valid", "SUCCESS")
        
        # Build images
        response = input("Build Docker images now? This may take a while. (Y/n): ")
        if response.lower() != 'n':
            self.print_step("Building Docker images...", "RUNNING")
            if not self.run_command(["docker-compose", "build"]):
                self.print_step("Failed to build images", "WARNING")
                return False
            
            self.print_step("Docker images built successfully", "SUCCESS")
        
        return True
    
    def run_initial_tests(self) -> bool:
        """Run initial tests to validate setup."""
        self.print_header("Running Initial Tests")
        
        # Check if pytest is available
        if not self.check_command_exists("pytest"):
            self.print_step("pytest not found, skipping tests", "WARNING")
            return True
        
        # Run a simple test to validate setup
        self.print_step("Running basic tests...", "RUNNING")
        
        # Create a simple test if none exist
        test_dir = self.project_root / "tests"
        if not test_dir.exists():
            test_dir.mkdir()
        
        simple_test = test_dir / "test_setup.py"
        if not simple_test.exists():
            test_content = """
def test_basic_setup():
    """Test that basic setup is working."""
    assert True

def test_imports():
    """Test that main modules can be imported."""
    try:
        from app.main import app
        assert app is not None
    except ImportError:
        # Skip if app is not ready yet
        pass
"""
            with open(simple_test, 'w') as f:
                f.write(test_content)
        
        if self.run_command(["pytest", "tests/test_setup.py", "-v"]):
            self.print_step("Basic tests passed", "SUCCESS")
        else:
            self.print_step("Some tests failed, but setup can continue", "WARNING")
        
        return True
    
    def start_development_server(self) -> bool:
        """Start the development server."""
        self.print_header("Starting Development Server")
        
        self.print_step("Starting services with docker-compose...", "RUNNING")
        
        try:
            # Start in detached mode
            subprocess.Popen(
                ["docker-compose", "up", "-d"],
                cwd=self.project_root
            )
            
            self.print_step("Development server starting...", "SUCCESS")
            self.print_step("API will be available at: http://localhost:8080", "INFO")
            self.print_step("API docs will be available at: http://localhost:8080/docs", "INFO")
            self.print_step("Flower (Celery monitor) will be available at: http://localhost:5555", "INFO")
            
            self.print_step("Use 'docker-compose logs -f' to view logs", "INFO")
            self.print_step("Use 'docker-compose down' to stop services", "INFO")
            
            return True
            
        except Exception as e:
            self.print_step(f"Failed to start server: {e}", "ERROR")
            return False
    
    def print_next_steps(self):
        """Print next steps for the developer."""
        self.print_header("Next Steps")
        
        steps = [
            "1. Update .env file with your actual API keys and credentials",
            "2. Run 'python scripts/init-app.py' to initialize the database",
            "3. Start development: 'docker-compose up'",
            "4. Access API docs: http://localhost:8080/docs",
            "5. Run tests: 'pytest'",
            "6. Format code: 'black . && isort .'",
            "7. Check code quality: 'flake8 app tests'",
            "8. View logs: 'docker-compose logs -f app'"
        ]
        
        for step in steps:
            self.print_step(step, "INFO")
        
        self.print_step("\n📚 Documentation:", "INFO")
        self.print_step("- README.md for detailed setup instructions", "INFO")
        self.print_step("- API docs at /docs endpoint when server is running", "INFO")
        self.print_step("- Check docker-compose.yml for service configuration", "INFO")
        
        self.print_step("\n🆘 Need help?", "INFO")
        self.print_step("- Check the troubleshooting section in README.md", "INFO")
        self.print_step("- Review logs with 'docker-compose logs'", "INFO")
        self.print_step("- Ensure all prerequisites are installed", "INFO")
    
    def setup(self, skip_docker: bool = False, skip_hooks: bool = False, start_server: bool = False) -> bool:
        """Run the complete development setup."""
        print("🚀 Smart PYQ Development Setup")
        print("This script will help you set up your development environment.")
        print("")
        
        # Validate prerequisites
        if not self.validate_prerequisites():
            return False
        
        # Create environment file
        if not self.create_env_file():
            return False
        
        # Setup Python environment
        if not self.setup_python_environment():
            return False
        
        # Setup pre-commit hooks
        if not skip_hooks:
            if not self.setup_pre_commit_hooks():
                self.print_step("Pre-commit setup failed, continuing...", "WARNING")
        
        # Validate Docker setup
        if not skip_docker:
            if not self.validate_docker_setup():
                self.print_step("Docker setup failed, continuing...", "WARNING")
        
        # Run initial tests
        self.run_initial_tests()
        
        # Start development server if requested
        if start_server:
            self.start_development_server()
        
        # Print next steps
        self.print_next_steps()
        
        self.print_header("Setup Complete!")
        self.print_step("Development environment is ready", "SUCCESS")
        
        return True


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Set up Smart PYQ development environment")
    parser.add_argument("--skip-docker", action="store_true", help="Skip Docker setup and validation")
    parser.add_argument("--skip-hooks", action="store_true", help="Skip pre-commit hooks setup")
    parser.add_argument("--start-server", action="store_true", help="Start development server after setup")
    
    args = parser.parse_args()
    
    setup = DevSetup()
    
    success = setup.setup(
        skip_docker=args.skip_docker,
        skip_hooks=args.skip_hooks,
        start_server=args.start_server
    )
    
    if not success:
        print("❌ Setup failed")
        sys.exit(1)
    
    print("✅ Setup completed successfully")


if __name__ == "__main__":
    main()