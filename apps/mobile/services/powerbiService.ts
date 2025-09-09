import axiosInstance from '../config/axios';

export interface PowerBIWorkspace { id: string; name: string }
export interface PowerBIReport { id: string; name: string; webUrl?: string; embedUrl?: string }

export const PowerBIService = {
  async getWorkspaces(): Promise<PowerBIWorkspace[]> {
    const res = await axiosInstance.get('/powerbi/workspaces');
    return res?.data?.data?.workspaces || res?.data?.workspaces || [];
  },

  async getReports(workspaceId: string): Promise<PowerBIReport[]> {
    const res = await axiosInstance.get(`/powerbi/workspaces/${workspaceId}/reports`);
    return res?.data?.data?.reports || res?.data?.reports || [];
  },

  async getReportEmbedToken(reportId: string, workspaceId: string): Promise<string> {
    const res = await axiosInstance.post(`/powerbi/reports/${reportId}/embed-token`, { workspaceId });
    return res?.data?.data?.embedToken || res?.data?.embedToken;
  },

  async discoverFirstEmbed(): Promise<{ workspaceId: string; reportId: string; embedUrl: string; token: string } | null> {
    const workspaces = await this.getWorkspaces();
    if (!Array.isArray(workspaces) || workspaces.length === 0) return null;
    const ws = workspaces[0];
    const reports = await this.getReports(ws.id);
    if (!Array.isArray(reports) || reports.length === 0) return null;
    const report = reports[0];
    const token = await this.getReportEmbedToken(report.id, ws.id);
    const embedUrl = report.embedUrl || report.webUrl;
    if (!embedUrl || !token) return null;
    return { workspaceId: ws.id, reportId: report.id, embedUrl, token };
  },

  async getConfigStatus(): Promise<any> {
    const res = await axiosInstance.get('/powerbi/config/status');
    return res?.data?.data?.status || res?.data?.status || res?.data;
  }
};
