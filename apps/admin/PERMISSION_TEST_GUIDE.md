# 🔒 Permission System Test Guide

This guide will help you thoroughly test the permission system to ensure that users can only access features they have permission for.

## 🚀 How to Test

### 1. Access the Test Page
1. Log into the admin panel
2. Navigate to **🔒 Permission Test** in the sidebar
3. This will take you to `/permission-test`

### 2. Run the Automated Tests
1. Click the **"Run Permission Tests"** button
2. The system will automatically test all permissions against your current role
3. Review the test results showing PASS/FAIL for each permission

### 3. Test Live Permission Guards
The page includes live examples of `PermissionGuard` components that will:
- Show "Access Granted" with functional buttons if you have permission
- Show "Access Denied" with locked icons if you don't have permission

## 🧪 What Gets Tested

### Permission Tests (9 total)
- **General System Settings** (`system_settings`)
- **Security & Compliance** (`security_compliance`)
- **Admin Management** (`admin_management`)
- **User Management** (`user_management`)
- **Analytics & Insights** (`analytics_insights`)
- **Integration Management** (`integration_mgmt`)
- **Notifications & Communications** (`notifications_comms`)
- **Data Export** (`data_export`)
- **Profile Settings** (`profile_settings`)

### Live Permission Guard Tests
- **System Settings Access** - Tests `system_settings` permission
- **Admin Management Access** - Tests `admin_management` permission
- **User Management Access** - Tests `user_management` permission
- **Analytics Access** - Tests `analytics_insights` permission
- **Integrations Access** - Tests `integration_mgmt` permission
- **Data Export Access** - Tests `data_export` permission

## 🔍 Expected Results by Role

### Viewer Role
- ✅ **Access Granted**: Analytics, Notifications, Profile Settings
- ❌ **Access Denied**: System Settings, Security, Admin Management, User Management, Integrations, Data Export

### Moderator Role
- ✅ **Access Granted**: Analytics, Notifications, Profile Settings, User Management
- ❌ **Access Denied**: System Settings, Security, Admin Management, Integrations, Data Export

### Admin Role
- ✅ **Access Granted**: All permissions except Super Admin specific features
- ❌ **Access Denied**: None (full access)

### Super Admin Role
- ✅ **Access Granted**: All permissions
- ❌ **Access Denied**: None (complete access)

## 🎯 Testing Scenarios

### Scenario 1: Viewer Role Testing
1. Log in as a viewer admin
2. Navigate to Permission Test page
3. Run the tests
4. Verify that only 3 permissions show as PASS
5. Check that live permission guards show "Access Denied" for restricted features

### Scenario 2: Moderator Role Testing
1. Log in as a moderator admin
2. Navigate to Permission Test page
3. Run the tests
4. Verify that 4 permissions show as PASS
5. Check that user management shows "Access Granted" but system settings show "Access Denied"

### Scenario 3: Admin Role Testing
1. Log in as an admin
2. Navigate to Permission Test page
3. Run the tests
4. Verify that most permissions show as PASS
5. Check that all live permission guards show "Access Granted"

### Scenario 4: Super Admin Role Testing
1. Log in as a super admin
2. Navigate to Permission Test page
3. Run the tests
4. Verify that ALL permissions show as PASS
5. Check that all live permission guards show "Access Granted"

## 🚨 What to Look For

### ✅ Success Indicators
- Test results show expected PASS/FAIL counts for your role
- Live permission guards correctly show "Access Granted" or "Access Denied"
- No permission bypasses or unauthorized access
- Permission denied popups appear when trying to access restricted features

### ❌ Failure Indicators
- Tests show unexpected results for your role
- Live permission guards show incorrect access states
- Users can access features they shouldn't have permission for
- Permission denied popups don't appear when they should

## 🔧 Troubleshooting

### If Tests Fail
1. Check that you're logged in with the correct role
2. Verify that the `useAdminPermissions` hook is working correctly
3. Check that permission guards are properly wrapping protected content
4. Ensure that the permission system is properly integrated

### If Permission Guards Don't Work
1. Verify that `PermissionGuard` components are properly imported
2. Check that required permissions match the permission system
3. Ensure that `showPopup={true}` is set for features that should show permission denied popups
4. Verify that the permission system is properly connected to Redux state

## 📊 Test Results Interpretation

### Test Summary
- **Total Tests**: 9 permission tests
- **Passed**: Number of tests that passed (should match expected for your role)
- **Failed**: Number of tests that failed (should be 0 for correct role)

### Individual Test Results
Each test shows:
- **Feature**: What feature is being tested
- **Permission**: Which permission is required
- **Expected**: What access should be granted for your role
- **Actual**: What access is actually granted
- **Status**: PASS or FAIL based on expected vs actual

## 🎉 Success Criteria

The permission system is working correctly when:
1. ✅ All automated tests pass for your current role
2. ✅ Live permission guards show correct access states
3. ✅ Users cannot access features they don't have permission for
4. ✅ Permission denied popups appear appropriately
5. ✅ Role-based access control is enforced consistently

## 🔐 Security Verification

To verify the system is secure:
1. **Try to access restricted features** - Should show permission denied popups
2. **Check URL manipulation** - Direct navigation to restricted routes should be blocked
3. **Verify API calls** - Backend should reject unauthorized requests
4. **Test role switching** - Permissions should update when admin role changes

---

**Note**: This test suite is designed to catch permission system issues early. Run these tests after any changes to the permission system to ensure security is maintained.
