
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dmsApi, { DMSConfig } from '@/lib/api';

interface ConfigPanelProps {
  config: {
    customerId: string;
    channelId: string;
    jwtSecret: string;
    clientWebhookUrl: string;
    digitalMessagingUrl: string;
  };
  setConfig: (config: any) => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  onConnectionStatusChange: (status: 'connected' | 'disconnected' | 'connecting') => void;
}

export const ConfigPanel = ({
  config,
  setConfig,
  connectionStatus,
  onConnectionStatusChange
}: ConfigPanelProps) => {
  const { toast } = useToast();
  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveConfig = async () => {
    if (!config.customerId.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer ID is required",
        variant: "destructive"
      });
      return;
    }

    if (!config.jwtSecret.trim()) {
      toast({
        title: "Validation Error",
        description: "JWT Secret is required",
        variant: "destructive"
      });
      return;
    }

    if (!config.channelId.trim()) {
      toast({
        title: "Validation Error",
        description: "Channel ID is required",
        variant: "destructive"
      });
      return;
    }

    if (!config.digitalMessagingUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Digital Messaging URL is required",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Configuration Saved",
      description: "Your settings have been updated successfully",
    });
  };

  const handleTestConnection = async () => {
    if (!config.customerId.trim() || !config.jwtSecret.trim() || !config.channelId.trim() || !config.digitalMessagingUrl.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before testing connection",
        variant: "destructive"
      });
      return;
    }

    onConnectionStatusChange('connecting');

    try {
      const dmsConfig: DMSConfig = {
        customer_id: config.customerId,
        jwt_secret: config.jwtSecret,
        channel_id: config.channelId,
        api_url: config.digitalMessagingUrl
      };

      const response = await dmsApi.connect(dmsConfig);
      
      if (response.success) {
        onConnectionStatusChange('connected');
        toast({
          title: "Connection Successful",
          description: "Successfully connected to Pega DMS",
        });
      } else {
        throw new Error(response.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection failed:', error);
      onConnectionStatusChange('disconnected');
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : 'Failed to connect to DMS',
        variant: "destructive"
      });
    }
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
          <Label htmlFor="channelId" className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Channel ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="channelId"
            value={config.channelId}
            onChange={(e) => updateConfig('channelId', e.target.value)}
            placeholder="Enter Channel ID"
            className="border-orange-200 focus:border-orange-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="jwtSecret" className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            JWT Secret <span className="text-red-500">*</span>
          </Label>
          <Input
            id="jwtSecret"
            value={config.jwtSecret}
            onChange={(e) => updateConfig('jwtSecret', e.target.value)}
            type="password"
            placeholder="Enter JWT Secret"
            className="font-mono border-orange-200 focus:border-orange-400"
            required
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
          <Label htmlFor="digitalMessagingUrl" className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Digital Messaging URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="digitalMessagingUrl"
            value={config.digitalMessagingUrl}
            onChange={(e) => updateConfig('digitalMessagingUrl', e.target.value)}
            placeholder="https://your-pega-instance.com/prweb/api/v1/channels/client"
            className="text-xs border-orange-200 focus:border-orange-400"
            required
          />
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={handleSaveConfig}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            Save Config
          </Button>
          <Button 
            onClick={handleTestConnection}
            variant="outline"
            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              'Connect to DMS'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

