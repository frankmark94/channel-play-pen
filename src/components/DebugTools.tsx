
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Code, Activity, Zap, Database, Wifi, WifiOff } from 'lucide-react';

interface DebugToolsProps {
  debugData: any;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const DebugTools = ({ debugData, connectionStatus }: DebugToolsProps) => {
  const debugLinks = [
    { 
      label: 'View /api/status', 
      url: 'http://localhost:3001/api/status',
      icon: Code,
      description: 'Current DMS connection status and configuration'
    },
    { 
      label: 'View /api/activity', 
      url: 'http://localhost:3001/api/activity',
      icon: Activity,
      description: 'Recent API activity logs and debugging information'
    },
    { 
      label: 'View /api/health', 
      url: 'http://localhost:3001/api/health',
      icon: Zap,
      description: 'Backend API health check endpoint'
    },
    { 
      label: 'View /api/sessions', 
      url: 'http://localhost:3001/api/sessions',
      icon: Database,
      description: 'Active DMS sessions'
    }
  ];

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-600" />;
      case 'connecting':
        return <Activity className="w-4 h-4 text-yellow-600 animate-pulse" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-600" />;
    }
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Connecting</Badge>;
      default:
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Disconnected</Badge>;
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Debug Tools</CardTitle>
        <p className="text-sm text-gray-600">API endpoints for debugging and monitoring</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Connection Status</h3>
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              {getConnectionBadge()}
            </div>
          </div>
          
          {debugData?.status && (
            <div className="text-xs space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Sessions:</span>
                  <span className="ml-2 font-mono">{debugData.status.connection?.session_count || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Channel ID:</span>
                  <span className="ml-2 font-mono text-blue-600">
                    {debugData.status.connection?.config?.channel_id || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Session Information */}
        {debugData?.sessions && debugData.sessions.sessions && debugData.sessions.sessions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Active Sessions</h3>
            <div className="space-y-2">
              {debugData.sessions.sessions.slice(0, 3).map((session: any, index: number) => (
                <div key={index} className="text-xs bg-gray-50 p-2 rounded border">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-blue-600">{session.customer_id}</span>
                    <Badge variant="outline" className="text-xs">
                      {session.status}
                    </Badge>
                  </div>
                  <div className="text-gray-600 mt-1">
                    Started: {new Date(session.created_at).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* API Endpoints */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">API Debug Endpoints</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {debugLinks.map((link) => (
              <Button
                key={link.url}
                variant="outline"
                size="sm"
                className="h-auto p-3 flex flex-col items-start gap-2 hover:bg-blue-50 border-blue-200 text-left"
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="flex items-center gap-2 w-full">
                  <link.icon className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-700 text-xs">{link.label}</span>
                  <ExternalLink className="w-3 h-3 text-blue-500 ml-auto" />
                </div>
                <p className="text-xs text-gray-600 text-left">
                  {link.description}
                </p>
              </Button>
            ))}
          </div>
        </div>
        
        {/* Raw Debug Data */}
        {debugData && Object.keys(debugData).length > 0 && (
          <details className="mt-4">
            <summary className="text-sm font-medium text-gray-900 cursor-pointer hover:text-gray-700">
              View Raw Debug Data
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto border">
              {JSON.stringify(debugData, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

