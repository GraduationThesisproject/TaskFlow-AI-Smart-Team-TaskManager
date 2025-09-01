# Integration Setup Guide for Production

## Overview
This guide provides step-by-step instructions for setting up integrations with GitHub, Google Drive, and other third-party services in your TaskFlow application.

## Security Best Practices

### 1. API Key Management
- **Never commit API keys to version control**
- Use environment variables for sensitive data
- Implement key rotation policies
- Store keys encrypted in the database

### 2. Environment Variables Setup
Add these to your `.env` file:

```bash
# Database
DATABASE_URL=mongodb://localhost:27017/taskflow

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# Encryption Key for API Keys
ENCRYPTION_KEY=your-32-character-encryption-key

# Integration Rate Limits
INTEGRATION_RATE_LIMIT=100
INTEGRATION_RATE_WINDOW=60000

# Webhook Secret
WEBHOOK_SECRET=your-webhook-secret
```

## GitHub Integration Setup

### 1. Create GitHub Personal Access Token
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read organization data)
   - `read:user` (Read user data)
   - `read:email` (Read email addresses)

### 2. Configure GitHub Integration
1. In your admin panel, click "Add Integration"
2. Select "GitHub" template
3. Enter your GitHub Personal Access Token
4. Configure settings:
   - **Repositories**: Select which repos to sync
   - **Webhook Enabled**: Enable for real-time updates
   - **Sync Issues**: Automatically sync GitHub issues
   - **Sync Pull Requests**: Sync PR data

### 3. Webhook Configuration (Optional)
For real-time updates, set up GitHub webhooks:
1. Go to your repository settings
2. Navigate to Webhooks
3. Add webhook URL: `https://yourdomain.com/api/integrations/github/webhook`
4. Set content type to `application/json`
5. Select events: Issues, Pull requests, Push

## Google Drive Integration Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API
4. Create credentials (API Key or Service Account)

### 2. API Key Method (Simpler)
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "API Key"
3. Restrict the key to Google Drive API
4. Set application restrictions (HTTP referrers)

### 3. Service Account Method (More Secure)
1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "Service Account"
3. Download JSON key file
4. Share Google Drive folders with service account email

### 4. Configure Google Drive Integration
1. In admin panel, click "Add Integration"
2. Select "Google Drive" template
3. Enter API key or service account credentials
4. Configure settings:
   - **Sync Folders**: Specify folders to monitor
   - **Auto Backup**: Enable automatic backups
   - **File Types**: Select document types to sync

## Slack Integration Setup

### 1. Create Slack App
1. Go to [Slack API](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Add bot token scopes:
   - `chat:write`
   - `channels:read`
   - `users:read`

### 2. Install App to Workspace
1. Go to "OAuth & Permissions"
2. Click "Install to Workspace"
3. Copy the "Bot User OAuth Token"

### 3. Configure Slack Integration
1. In admin panel, click "Add Integration"
2. Select "Slack" template
3. Enter Bot User OAuth Token
4. Configure settings:
   - **Default Channel**: Set default notification channel
   - **Notifications Enabled**: Enable task notifications
   - **Sync Messages**: Sync channel messages (optional)

## Production Deployment Checklist

### 1. Security Configuration
- [ ] API keys stored encrypted in database
- [ ] Environment variables properly set
- [ ] HTTPS enabled for all endpoints
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints

### 2. Monitoring & Logging
- [ ] Integration health monitoring
- [ ] Error logging and alerting
- [ ] Performance metrics tracking
- [ ] API usage monitoring

### 3. Backup & Recovery
- [ ] Database backups configured
- [ ] Integration configuration backups
- [ ] Disaster recovery plan
- [ ] Data retention policies

### 4. Testing
- [ ] Integration connection tests
- [ ] Error handling tests
- [ ] Rate limit tests
- [ ] Security penetration tests

## Troubleshooting Common Issues

### Connection Failures
1. **Invalid API Key**: Verify key format and permissions
2. **Rate Limiting**: Check API usage limits
3. **Network Issues**: Verify firewall and proxy settings
4. **Authentication**: Ensure proper OAuth flow

### Sync Issues
1. **Permission Denied**: Check API scopes and permissions
2. **Data Format**: Verify data structure compatibility
3. **Timeout**: Increase timeout settings for large datasets
4. **Partial Sync**: Implement retry mechanisms

### Performance Issues
1. **Slow Sync**: Implement pagination and batching
2. **Memory Usage**: Optimize data processing
3. **Database Load**: Add proper indexing
4. **API Limits**: Implement rate limiting and queuing

## API Rate Limits

| Service | Rate Limit | Window |
|---------|------------|---------|
| GitHub | 5,000 requests/hour | 1 hour |
| Google Drive | 10,000 requests/100 seconds | 100 seconds |
| Slack | 50 requests/second | 1 second |

## Error Handling

### Common Error Codes
- `401 Unauthorized`: Invalid API key
- `403 Forbidden`: Insufficient permissions
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Service unavailable

### Retry Strategy
```javascript
// Exponential backoff with jitter
const retryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
};
```

## Monitoring Integration Health

### Health Check Endpoints
- `GET /api/integrations/:id/health` - Check integration status
- `GET /api/integrations/stats` - Get integration statistics
- `POST /api/integrations/:id/test` - Test connection

### Key Metrics to Monitor
- Connection success rate
- Sync completion rate
- API response times
- Error frequency
- Data volume processed

## Support and Maintenance

### Regular Maintenance Tasks
1. **Monthly**: Review and rotate API keys
2. **Weekly**: Check integration health reports
3. **Daily**: Monitor error logs
4. **As needed**: Update integration configurations

### Contact Information
- **GitHub Support**: https://support.github.com/
- **Google Cloud Support**: https://cloud.google.com/support/
- **Slack Support**: https://slack.com/help

## Security Considerations

### Data Protection
- Encrypt sensitive data at rest and in transit
- Implement proper access controls
- Regular security audits
- Compliance with data protection regulations

### API Security
- Use HTTPS for all API communications
- Implement proper authentication
- Validate all input data
- Monitor for suspicious activity

### Privacy
- Minimize data collection
- Implement data retention policies
- Provide user consent mechanisms
- Regular privacy impact assessments
