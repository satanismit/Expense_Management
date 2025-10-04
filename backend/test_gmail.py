#!/usr/bin/env python3
"""
Simple email test to verify Gmail configuration
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def test_gmail_connection():
    print("Testing Gmail SMTP Connection...")
    print("=" * 50)
    
    try:
        # Get credentials from .env
        username = os.getenv('MAIL_USERNAME')
        password = os.getenv('MAIL_PASSWORD')
        server = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
        port = int(os.getenv('MAIL_PORT', 587))
        
        print(f"Username: {username}")
        print(f"Server: {server}:{port}")
        print("Password: " + ("*" * len(password) if password else "NOT SET"))
        
        if not username or not password or username == 'your-email@gmail.com':
            print("❌ Email credentials not configured in .env file")
            return False
        
        # Create SMTP connection
        print("\nTesting SMTP connection...")
        with smtplib.SMTP(server, port) as smtp:
            smtp.starttls()
            smtp.login(username, password)
            print("✅ Gmail SMTP connection successful!")
            return True
            
    except Exception as e:
        print(f"❌ Gmail SMTP connection failed: {e}")
        return False

if __name__ == "__main__":
    test_gmail_connection()