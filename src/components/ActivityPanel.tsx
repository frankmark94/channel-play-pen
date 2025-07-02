
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ActivityLog } from '@/lib/api';

interface ActivityPanelProps {
  logs: ActivityLog[];
}

export const ActivityPanel = ({ logs }: ActivityPanelProps) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-[600px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Activity Log</CardTitle>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Request</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Response</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Error</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span>System</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[480px]">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No activity yet. Connect to DMS and send messages to see logs.
              </div>
            ) : (
              logs.slice().reverse().map((log) => {
                const getLogBadgeStyle = (type: string) => {
                  switch (type) {
                    case 'request':
                      return 'bg-blue-50 text-blue-700 border-blue-200';
                    case 'response':
                      return 'bg-green-50 text-green-700 border-green-200';
                    case 'error':
                      return 'bg-red-50 text-red-700 border-red-200';
                    case 'system':
                      return 'bg-gray-50 text-gray-700 border-gray-200';
                    default:
                      return 'bg-gray-50 text-gray-700 border-gray-200';
                  }
                };

                const getLogIcon = (type: string) => {
                  switch (type) {
                    case 'request':
                      return '🔵';
                    case 'response':
                      return '🟢';
                    case 'error':
                      return '🔴';
                    case 'system':
                      return '⚪';
                    default:
                      return '⚪';
                  }
                };

                return (
                  <div
                    key={log.id}
                    className="p-3 rounded-lg border bg-gray-50/50 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-0 ${getLogBadgeStyle(log.type)}`}
                        >
                          {getLogIcon(log.type)} {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                        </Badge>
                        {log.method && (
                          <span className="text-gray-600 font-mono text-xs">
                            {log.method}
                          </span>
                        )}
                        {log.status_code && (
                          <Badge variant="secondary" className="text-xs">
                            {log.status_code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        {log.duration_ms && (
                          <span className="text-xs">{log.duration_ms}ms</span>
                        )}
                        <span className="text-xs">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="text-gray-700 font-mono text-xs mb-2">
                      {log.message}
                    </div>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="text-gray-600 text-xs cursor-pointer hover:text-gray-800">
                          View details
                        </summary>
                        <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

