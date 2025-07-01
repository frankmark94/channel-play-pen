
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

interface ConfigPanelProps {
  config: {
    customerId: string;
    connectionId: string;
    jwtSecret: string;
    clientWebhookUrl: string;
    digitalMessagingUrl: string;
  };
  setConfig: (config: any) => void;
  onSaveConfig: () => void;
  onTestConnection: () => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export const ConfigPanel = ({
  config,
  setConfig,
  onSaveConfig,
  onTestConnection,
  connectionStatus
}: ConfigPanelProps) => {
  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Connecting</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Disconnected</Badge>;
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900">Configuration</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerId" className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Customer ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerId"
            value={config.customerId}
            onChange={(e) => updateConfig('customerId', e.target.value)}
            placeholder="Enter Customer ID"
            className="border-orange-200 focus:border-orange-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="connectionId" className="text-sm font-medium text-gray-700">
            Connection ID
          </Label>
          <Input
            id="connectionId"
            value={config.connectionId}
            readOnly
            className="bg-gray-50 text-gray-600"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jwtSecret" className="text-sm font-medium text-gray-700">
            JWT Secret
          </Label>
          <Input
            id="jwtSecret"
            value={config.jwtSecret}
            onChange={(e) => updateConfig('jwtSecret', e.target.value)}
            type="password"
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientWebhookUrl" className="text-sm font-medium text-gray-700">
            Client Webhook URL
          </Label>
          <Input
            id="clientWebhookUrl"
            value={config.clientWebhookUrl}
            readOnly
            className="bg-gray-50 text-gray-600 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="digitalMessagingUrl" className="text-sm font-medium text-gray-700">
            Digital Messaging URL
          </Label>
          <Input
            id="digitalMessagingUrl"
            value={config.digitalMessagingUrl}
            onChange={(e) => updateConfig('digitalMessagingUrl', e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={onSaveConfig}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Save Config
          </Button>
          <Button 
            onClick={onTestConnection}
            variant="outline"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

