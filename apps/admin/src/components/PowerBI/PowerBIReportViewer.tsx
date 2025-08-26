import React, { useEffect, useRef } from 'react';
import { PowerBIEmbedConfig } from '../../types/analytics.types';

interface PowerBIReportViewerProps {
  config: PowerBIEmbedConfig;
}

declare global {
  interface Window {
    powerbi: any;
  }
}

const PowerBIReportViewer: React.FC<PowerBIReportViewerProps> = ({ config }) => {
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<any>(null);

  useEffect(() => {
    // Load Power BI JavaScript library
    const script = document.createElement('script');
    script.src = 'https://microsoft.github.io/PowerBI-JavaScript/demo/node_modules/powerbi-client/dist/powerbi.min.js';
    script.onload = embedReport;
    document.head.appendChild(script);

    return () => {
      if (reportRef.current) {
        reportRef.current.remove();
      }
    };
  }, [config]);

  const embedReport = () => {
    if (!window.powerbi || !reportContainerRef.current) return;

    try {
      // Remove existing report if any
      if (reportRef.current) {
        reportRef.current.remove();
      }

      // Create new report
      reportRef.current = window.powerbi.embed(reportContainerRef.current, {
        type: 'report',
        id: config.reportId,
        embedUrl: config.embedUrl,
        accessToken: config.embedToken,
        permissions: config.permissions,
        settings: config.settings,
        tokenType: window.powerbi.TokenType.Embed,
        onEmbedded: (event: any) => {
          console.log('Report embedded successfully:', event);
        },
        onError: (event: any) => {
          console.error('Error embedding report:', event);
        }
      });
    } catch (error) {
      console.error('Failed to embed Power BI report:', error);
    }
  };

  return (
    <div className="w-full">
      <div 
        ref={reportContainerRef} 
        className="w-full h-96 border rounded-lg"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default PowerBIReportViewer;
