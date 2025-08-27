const PowerBIService = require('./src/services/powerbi.service');

async function testPowerBIConfig() {
  try {
    console.log('Testing Power BI configuration...');
    
    // Check configuration status
    const status = PowerBIService.getConfigurationStatus();
    console.log('\n--- Configuration Status ---');
    console.log('Is Configured:', status.isConfigured);
    console.log('Has Client ID:', status.hasClientId);
    console.log('Has Client Secret:', status.hasClientSecret);
    console.log('Has Tenant ID:', status.hasTenantId);
    console.log('Has Placeholders:', status.hasPlaceholders);
    console.log('Message:', status.message);
    
    if (status.isConfigured) {
      console.log('\n✅ Power BI is properly configured!');
      
      // Try to get an access token
      console.log('\n--- Testing Access Token ---');
      try {
        const token = await PowerBIService.getAccessToken();
        console.log('✅ Access token retrieved successfully');
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 20) + '...');
      } catch (tokenError) {
        console.log('❌ Failed to get access token:', tokenError.message);
      }
      
      // Try to get workspaces
      console.log('\n--- Testing Workspaces ---');
      try {
        const workspaces = await PowerBIService.getWorkspaces();
        console.log('✅ Workspaces retrieved successfully');
        console.log('Workspaces count:', workspaces.length);
        if (workspaces.length > 0) {
          console.log('First workspace:', workspaces[0].name || workspaces[0].id);
        }
      } catch (workspaceError) {
        console.log('❌ Failed to get workspaces:', workspaceError.message);
      }
      
    } else {
      console.log('\n❌ Power BI is not properly configured');
      console.log('Setup instructions:', status.setupInstructions);
    }
    
  } catch (error) {
    console.error('❌ Error testing Power BI configuration:', error);
  }
}

testPowerBIConfig();
