
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Code, Activity, Zap } from 'lucide-react';

export const DebugTools = () => {
  const debugLinks = [
    { 
      label: 'View /api/config', 
      url: '/api/config',
      icon: Code,
      description: 'Current configuration settings'
    },
    { 
      label: 'View /api/debug/messages', 
      url: '/api/debug/messages',
      icon: Activity,
      description: 'Message debugging information'
    },
    { 
      label: 'View /api/ping', 
      url: '/api/ping',
      icon: Zap,
      description: 'API health check endpoint'
    }
  ];

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Debug Tools</CardTitle>
        <p className="text-sm text-gray-600">API endpoints for debugging and monitoring</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {debugLinks.map((link) => (
            <Button
              key={link.url}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-blue-50 border-blue-200"
              onClick={() => window.open(link.url, '_blank')}
            >
              <div className="flex items-center gap-2 w-full">
                <link.icon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-700">{link.label}</span>
                <ExternalLink className="w-3 h-3 text-blue-500 ml-auto" />
              </div>
              <p className="text-xs text-gray-600 text-left">
                {link.description}
              </p>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

