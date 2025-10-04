#!/usr/bin/env python3
"""
Test script for the updated Expense Management API with approval workflow
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_expense_workflow():
    print("🧪 Testing Expense Management Workflow...")
    
    # Test data
    admin_user = {
        "company_name": "Test Company",
        "email": "admin@test.com",
        "password": "testpass123"
    }
    
    manager_user = {
        "name": "Test Manager",
        "email": "manager@test.com",
        "password": "testpass123",
        "role": "Manager"
    }
    
    employee_user = {
        "name": "Test Employee",
        "email": "employee@test.com",
        "password": "testpass123",
        "role": "Employee"
    }
    
    test_expense = {
        "description": "Test Expense for Workflow",
        "category": "Office Supplies",
        "amount": 100.50,
        "currency": "USD",
        "expense_date": "2024-01-15",
        "paid_by": "John Doe",
        "remarks": "Test expense for approval workflow"
    }
    
    try:
        # 1. Create a test company and admin user
        print("\n1. Creating test company and admin user...")
        signup_response = requests.post(f"{BASE_URL}/auth/signup", json=admin_user)
        if signup_response.status_code == 201:
            print("✅ Company and admin user created successfully")
            admin_data = signup_response.json()
            admin_token = admin_data['access_token']
            admin_headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
        else:
            print(f"❌ Failed to create company: {signup_response.text}")
            return
        
        # 2. Set up approval chain (Manager -> Director)
        print("\n2. Setting up approval chain...")
        approval_chain_data = {"chain": ["Manager", "Director"]}
        chain_response = requests.post(f"{BASE_URL}/admin/approval-chain", json=approval_chain_data, headers=admin_headers)
        if chain_response.status_code == 200:
            print("✅ Approval chain set successfully")
        else:
            print(f"❌ Failed to set approval chain: {chain_response.text}")
            return
        
        # 3. Create manager user
        print("\n3. Creating manager user...")
        manager_response = requests.post(f"{BASE_URL}/users/create", json=manager_user, headers=admin_headers)
        if manager_response.status_code == 201:
            print("✅ Manager user created successfully")
            # Get manager token by logging in
            manager_login = requests.post(f"{BASE_URL}/auth/login", json={
                "email": manager_user["email"],
                "password": manager_user["password"]
            })
            if manager_login.status_code == 200:
                manager_data = manager_login.json()
                manager_token = manager_data['access_token']
                manager_headers = {"Authorization": f"Bearer {manager_token}", "Content-Type": "application/json"}
            else:
                print("❌ Failed to login manager")
                return
        else:
            print(f"❌ Failed to create manager: {manager_response.text}")
            return
        
        # 4. Create employee user
        print("\n4. Creating employee user...")
        employee_response = requests.post(f"{BASE_URL}/users/create", json=employee_user, headers=admin_headers)
        if employee_response.status_code == 201:
            print("✅ Employee user created successfully")
            # Get employee token by logging in
            employee_login = requests.post(f"{BASE_URL}/auth/login", json={
                "email": employee_user["email"],
                "password": employee_user["password"]
            })
            if employee_login.status_code == 200:
                employee_data = employee_login.json()
                employee_token = employee_data['access_token']
                employee_headers = {"Authorization": f"Bearer {employee_token}", "Content-Type": "application/json"}
            else:
                print("❌ Failed to login employee")
                return
        else:
            print(f"❌ Failed to create employee: {employee_response.text}")
            return
        
        # 5. Employee submits expense
        print("\n5. Employee submitting expense...")
        expense_response = requests.post(f"{BASE_URL}/expenses/add", json=test_expense, headers=employee_headers)
        if expense_response.status_code == 201:
            print("✅ Expense submitted successfully")
            expense_data = expense_response.json()
            expense_id = expense_data['expense_id']
            print(f"   Expense ID: {expense_id}")
            print(f"   Status: {expense_data['status']}")
        else:
            print(f"❌ Failed to submit expense: {expense_response.text}")
            return
        
        # 6. Manager views pending expenses
        print("\n6. Manager viewing pending expenses...")
        manager_expenses = requests.get(f"{BASE_URL}/expenses/list", headers=manager_headers)
        if manager_expenses.status_code == 200:
            expenses = manager_expenses.json()['expenses']
            print(f"✅ Manager can see {len(expenses)} expense(s)")
            for expense in expenses:
                print(f"   - {expense['description']}: {expense['status']}")
        else:
            print(f"❌ Failed to list expenses for manager: {manager_expenses.text}")
            return
        
        # 7. Manager approves expense
        print("\n7. Manager approving expense...")
        approve_response = requests.put(f"{BASE_URL}/expenses/approve/{expense_id}", 
                                      json={"action": "approve"}, headers=manager_headers)
        if approve_response.status_code == 200:
            print("✅ Expense approved by manager")
            print(f"   Status: {approve_response.json()['status']}")
        else:
            print(f"❌ Failed to approve expense: {approve_response.text}")
            return
        
        # 8. Check final status
        print("\n8. Checking final expense status...")
        final_expenses = requests.get(f"{BASE_URL}/expenses/list", headers=admin_headers)
        if final_expenses.status_code == 200:
            expenses = final_expenses.json()['expenses']
            for expense in expenses:
                if expense['_id'] == expense_id:
                    print(f"✅ Final status: {expense['status']}")
                    print(f"   Approvals: {expense['approvals']}")
                    break
        
        print("\n🎉 All workflow tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to the API. Make sure the backend server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ An error occurred: {str(e)}")

if __name__ == "__main__":
    test_expense_workflow()
