import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  Typography, 
  Button, 
  Select, 
  SelectItem, 
  Card, 
  CardBody,
  CardHeader,
  Spinner,
  Alert
} from '@taskflow/ui';
import { 
  ChartBarIcon, 
  ArrowPathIcon, 
  CogIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import PowerBIService, { PowerBIReport, PowerBIDataset } from '../services/powerBiService';
import { PowerBIEmbedConfig } from '../types/analytics.types';
import PowerBIReportViewer from '../components/PowerBI/PowerBIReportViewer';
import PowerBIConfiguration from '../components/PowerBI/PowerBIConfiguration';

const PowerBILayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [reports, setReports] = useState<PowerBIReport[]>([]);
  const [datasets, setDatasets] = useState<PowerBIDataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [embedConfig, setEmbedConfig] = useState<PowerBIEmbedConfig | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceData(selectedWorkspace);
    }
  }, [selectedWorkspace]);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const workspacesData = await PowerBIService.getWorkspaces();
      setWorkspaces(workspacesData);
      
      if (workspacesData.length > 0) {
        setSelectedWorkspace(workspacesData[0].id);
      }
    } catch (err) {
      setError('Failed to load Power BI workspaces');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkspaceData = async (workspaceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [reportsData, datasetsData] = await Promise.all([
        PowerBIService.getReports(workspaceId),
        PowerBIService.getDatasets(workspaceId)
      ]);
      
      setReports(reportsData);
      setDatasets(datasetsData);
      
      if (reportsData.length > 0) {
        setSelectedReport(reportsData[0].id);
      }
    } catch (err) {
      setError('Failed to load workspace data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportSelect = async (reportId: string) => {
    if (!selectedWorkspace) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const embedToken = await PowerBIService.getReportEmbedToken(reportId, selectedWorkspace);
      const report = reports.find(r => r.id === reportId);
      
      if (report) {
        const config: PowerBIEmbedConfig = {
          reportId,
          workspaceId: selectedWorkspace,
          embedToken,
          embedUrl: report.embedUrl,
          permissions: ['View'],
          settings: {
            filterPaneEnabled: true,
            navContentPaneEnabled: true,
            bookmarksPaneEnabled: true,
            useCustomSaveAsDialog: false,
            panes: {
              filters: { visible: true, expanded: true },
              bookmarks: { visible: true, expanded: true },
              pageNavigation: { visible: true, expanded: true }
            }
          }
        };
        
        setEmbedConfig(config);
      }
    } catch (err) {
      setError('Failed to load report');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshDataset = async (datasetId: string) => {
    if (!selectedWorkspace) return;
    
    try {
      await PowerBIService.refreshDataset(datasetId, selectedWorkspace);
      // Reload workspace data to get updated refresh times
      await loadWorkspaceData(selectedWorkspace);
    } catch (err) {
      setError('Failed to refresh dataset');
      console.error(err);
    }
  };

  if (isLoading && workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
        <Typography variant="body" className="ml-3">Loading Power BI workspaces...</Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h2" className="flex items-center">
            <ChartBarIcon className="w-8 h-8 mr-3 text-blue-600" />
            Power BI Integration
          </Typography>
          <Typography variant="body" className="text-gray-600 mt-1">
            Connect and visualize your data with Power BI reports
          </Typography>
        </div>
        
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center"
          >
            <CogIcon className="w-4 h-4 mr-2" />
            Configuration
          </Button>
          
          <Button
            variant="primary"
            onClick={loadWorkspaces}
            className="flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <PowerBIConfiguration />
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Workspace and Report Selection */}
      <Card>
        <CardHeader>
          <Typography variant="h3">Select Workspace & Report</Typography>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Typography variant="label" className="block mb-2">
                Workspace
              </Typography>
              <Select
                value={selectedWorkspace}
                onChange={(e) => setSelectedWorkspace(e.target.value)}
                disabled={isLoading}
              >
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <Typography variant="label" className="block mb-2">
                Report
              </Typography>
              <Select
                value={selectedReport}
                onChange={(e) => handleReportSelect(e.target.value)}
                disabled={isLoading || !selectedWorkspace}
              >
                {reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Datasets Overview */}
      <Card>
        <CardHeader>
          <Typography variant="h3">Datasets</Typography>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset) => (
              <div key={dataset.id} className="border rounded-lg p-4">
                <Typography variant="h4" className="mb-2">{dataset.name}</Typography>
                <Typography variant="body" className="text-gray-600 mb-2">
                  {dataset.description || 'No description'}
                </Typography>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Tables: {dataset.tables.length}</span>
                  <span>Last: {dataset.lastRefresh ? new Date(dataset.lastRefresh).toLocaleDateString() : 'Never'}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => handleRefreshDataset(dataset.id)}
                  disabled={isLoading}
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Report Viewer */}
      {embedConfig && (
        <Card>
          <CardHeader>
            <Typography variant="h3">Report Viewer</Typography>
          </CardHeader>
          <CardBody>
            <PowerBIReportViewer config={embedConfig} />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default PowerBILayout;
