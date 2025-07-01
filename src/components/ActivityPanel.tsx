
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Log {
  id: string;
  type: 'sent' | 'received';
  content: string;
  timestamp: Date;
}

interface ActivityPanelProps {
  logs: Log[];
}

export const ActivityPanel = ({ logs }: ActivityPanelProps) => {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-[600px]">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Console Log</CardTitle>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Sent to DMS</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Received from DMS</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[480px]">
          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                No activity yet. Send a message to see logs.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg border bg-gray-50/50 text-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0 ${
                        log.type === 'sent' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}
                    >
                      {log.type === 'sent' ? '🔵 Sent' : '🟢 Received'}
                    </Badge>
                    <span className="text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-700 font-mono text-xs">
                    {log.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

