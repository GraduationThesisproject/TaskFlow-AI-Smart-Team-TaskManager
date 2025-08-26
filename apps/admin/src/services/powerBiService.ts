import { env } from '../config/env';

export interface PowerBIConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  workspaceId: string;
  reportId: string;
}

export interface PowerBIReport {
  id: string;
  name: string;
  embedUrl: string;
  datasetId: string;
  webUrl: string;
}

export interface PowerBIDataset {
  id: string;
  name: string;
  tables: PowerBITable[];
  refreshSchedule?: string;
}

export interface PowerBITable {
  name: string;
  columns: PowerBIColumn[];
  rows?: any[];
}

export interface PowerBIColumn {
  name: string;
  dataType: string;
  formatString?: string;
}

class PowerBIService {
  private baseUrl = `${env.API_BASE_URL}/powerbi`;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get Power BI access token
   */
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to get Power BI access token');
      }

      const data = await response.json();
      this.accessToken = data.accessToken;
      this.tokenExpiry = Date.now() + (data.expiresIn * 1000);
      
      return this.accessToken;
    } catch (error) {
      console.error('PowerBIService: Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Get available workspaces
   */
  async getWorkspaces(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/workspaces`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Power BI workspaces');
      }

      const data = await response.json();
      return data.workspaces || [];
    } catch (error) {
      console.error('PowerBIService: Error fetching workspaces:', error);
      throw error;
    }
  }

  /**
   * Get reports from a workspace
   */
  async getReports(workspaceId: string): Promise<PowerBIReport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/workspaces/${workspaceId}/reports`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Power BI reports');
      }

      const data = await response.json();
      return data.reports || [];
    } catch (error) {
      console.error('PowerBIService: Error fetching reports:', error);
      throw error;
    }
  }

  /**
   * Get datasets from a workspace
   */
  async getDatasets(workspaceId: string): Promise<PowerBIDataset[]> {
    try {
      const response = await fetch(`${this.baseUrl}/workspaces/${workspaceId}/datasets`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Power BI datasets');
      }

      const data = await response.json();
      return data.datasets || [];
    } catch (error) {
      console.error('PowerBIService: Error fetching datasets:', error);
      throw error;
    }
  }

  /**
   * Get report embed token
   */
  async getReportEmbedToken(reportId: string, workspaceId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/reports/${reportId}/embed-token`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ workspaceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get report embed token');
      }

      const data = await response.json();
      return data.embedToken;
    } catch (error) {
      console.error('PowerBIService: Error getting embed token:', error);
      throw error;
    }
  }

  /**
   * Refresh a dataset
   */
  async refreshDataset(datasetId: string, workspaceId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/datasets/${datasetId}/refresh`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ workspaceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh dataset');
      }
    } catch (error) {
      console.error('PowerBIService: Error refreshing dataset:', error);
      throw error;
    }
  }

  /**
   * Get dataset schema
   */
  async getDatasetSchema(datasetId: string, workspaceId: string): Promise<PowerBIDataset> {
    try {
      const response = await fetch(`${this.baseUrl}/datasets/${datasetId}/schema`, {
        method: 'GET',
        headers: this.getHeaders(),
        body: JSON.stringify({ workspaceId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get dataset schema');
      }

      const data = await response.json();
      return data.dataset;
    } catch (error) {
      console.error('PowerBIService: Error getting dataset schema:', error);
      throw error;
    }
  }
}

export default new PowerBIService();
