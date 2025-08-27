# Power BI Integration Guide

This document provides comprehensive instructions for setting up and using the Power BI integration in TaskFlow Admin.

## Overview

The Power BI integration allows administrators to:
- Connect to Power BI workspaces and reports
- Embed Power BI reports directly in the admin dashboard
- Manage datasets and refresh schedules
- Configure Power BI authentication settings

## Prerequisites

### 1. Azure Active Directory App Registration

Before using Power BI integration, you need to create an Azure AD app registration:

1. **Go to Azure Portal**: Navigate to [portal.azure.com](https://portal.azure.com)
2. **Azure Active Directory**: Go to Azure Active Directory > App registrations
3. **New Registration**: Click "New registration"
4. **Configure App**:
   - Name: `TaskFlow Power BI Integration`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: Leave blank (not needed for this integration)
5. **API Permissions**:
   - Click "Add a permission"
   - Select "Power BI Service"
   - Choose "Delegated permissions"
   - Select: `Report.Read.All`, `Dataset.Read.All`, `Workspace.Read.All`
6. **Grant Admin Consent**: Click "Grant admin consent for [Your Organization]"
7. **Client Credentials**:
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Add description and expiration
   - **Copy the secret value immediately** (you won't see it again)

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Power BI Configuration
POWERBI_CLIENT_ID=your-azure-ad-app-client-id
POWERBI_CLIENT_SECRET=your-azure-ad-app-client-secret
POWERBI_TENANT_ID=your-azure-tenant-id
```

## Installation

### Backend Dependencies

Install the required Power BI packages:

```bash
cd apps/backend
npm install @azure/identity @microsoft/microsoft-graph-client axios
```

### Frontend Dependencies

The frontend components are already included in the codebase.

## Configuration

### 1. Backend Configuration

The Power BI service is automatically configured when you set the environment variables.

### 2. Frontend Configuration

Navigate to the Power BI section in your admin dashboard:
1. Go to `/powerbi` route
2. Click "Configuration" button
3. Enter your Power BI credentials
4. Test the connection
5. Save the configuration

## Usage

### 1. Accessing Power BI Integration

1. Navigate to the admin dashboard
2. Click on "Power BI" in the navigation menu
3. The Power BI integration page will load

### 2. Connecting to Workspaces

1. The system will automatically load available Power BI workspaces
2. Select a workspace from the dropdown
3. Reports and datasets for that workspace will be loaded

### 3. Viewing Reports

1. Select a report from the reports dropdown
2. The report will be embedded in the dashboard
3. Use Power BI controls to interact with the report

### 4. Managing Datasets

1. View all datasets in the selected workspace
2. See dataset refresh schedules and last refresh times
3. Manually refresh datasets as needed

### 5. Configuration Management

1. Click the "Configuration" button
2. Update Power BI connection settings
3. Test the connection before saving
4. Save changes to update the configuration

## API Endpoints

### Authentication
- `POST /api/powerbi/auth/token` - Get Power BI access token

### Workspaces
- `GET /api/powerbi/workspaces` - List available workspaces
- `GET /api/powerbi/workspaces/:workspaceId/reports` - Get reports in workspace
- `GET /api/powerbi/workspaces/:workspaceId/datasets` - Get datasets in workspace

### Reports
- `POST /api/powerbi/reports/:reportId/embed-token` - Get report embed token

### Datasets
- `POST /api/powerbi/datasets/:datasetId/refresh` - Refresh dataset
- `GET /api/powerbi/datasets/:datasetId/schema` - Get dataset schema

### Configuration
- `GET /api/powerbi/config` - Get current configuration
- `POST /api/powerbi/config` - Save configuration
- `POST /api/powerbi/test-connection` - Test connection

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

**Problem**: "Failed to authenticate with Power BI"
**Solution**: 
- Verify your Azure AD app registration has the correct permissions
- Ensure admin consent has been granted
- Check that environment variables are correctly set

#### 2. Permission Errors

**Problem**: "Access denied" or "Insufficient permissions"
**Solution**:
- Ensure the Azure AD app has the required Power BI API permissions
- Grant admin consent for the permissions
- Verify the app is registered in the correct tenant

#### 3. Report Embedding Issues

**Problem**: Reports not displaying properly
**Solution**:
- Check that the report ID and workspace ID are correct
- Verify the embed token is valid
- Ensure the Power BI JavaScript library is loading correctly

#### 4. CORS Issues

**Problem**: Frontend can't connect to Power BI API
**Solution**:
- Verify CORS configuration in backend
- Check that the frontend URL is in the allowed origins list

### Debug Mode

Enable debug mode to see detailed logs:

```bash
# Backend
DEBUG_MODE=true

# Frontend
VITE_DEBUG_MODE=true
```

## Security Considerations

### 1. Client Secret Management

- Never commit client secrets to version control
- Use environment variables or secure secret management
- Rotate client secrets regularly

### 2. API Permissions

- Use the principle of least privilege
- Only grant necessary permissions
- Regularly review and audit permissions

### 3. Token Management

- Access tokens are cached and automatically refreshed
- Tokens expire after 1 hour
- Implement proper error handling for expired tokens

## Performance Optimization

### 1. Caching

- Workspace and report metadata is cached
- Access tokens are cached until expiration
- Implement additional caching as needed

### 2. Batch Operations

- Use batch API calls when possible
- Implement pagination for large datasets
- Consider implementing virtual scrolling for large lists

## Monitoring and Logging

### 1. Backend Logs

The Power BI service logs all operations:
- Authentication attempts
- API calls and responses
- Error details and stack traces

### 2. Frontend Logs

Frontend components log:
- Component lifecycle events
- API call results
- User interactions

## Future Enhancements

### Planned Features

1. **Advanced Filtering**: Custom filters for embedded reports
2. **Scheduled Refreshes**: Automated dataset refresh scheduling
3. **Report Templates**: Pre-configured report configurations
4. **User Permissions**: Role-based access to Power BI features
5. **Analytics Dashboard**: Power BI usage analytics

### Customization

The Power BI integration is designed to be extensible:
- Add new Power BI API endpoints
- Customize report embedding behavior
- Implement additional authentication methods

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review backend and frontend logs
3. Verify Azure AD configuration
4. Test with a simple Power BI report first

## Changelog

### Version 1.0.0
- Initial Power BI integration
- Basic workspace and report management
- Report embedding functionality
- Dataset refresh capabilities
- Configuration management interface
