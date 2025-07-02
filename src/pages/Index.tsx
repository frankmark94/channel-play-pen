
import { useState, useEffect, useCallback } from 'react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ChatSession } from '@/components/ChatSession';
import { ActivityPanel } from '@/components/ActivityPanel';
import { DebugTools } from '@/components/DebugTools';
import { VersionTable } from '@/components/VersionTable';
import { Banner } from '@/components/Banner';
import { SDKViewer } from '@/components/SDKViewer';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';
import dmsApi, { ActivityLog, DMSMessage } from '@/lib/api';

const Index = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'csr' | 'system';
    content: string;
    timestamp: Date;
  }>>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [config, setConfig] = useState({
    customerId: 'test-customer-123',
    channelId: '',
    jwtSecret: '',
    clientWebhookUrl: 'http://localhost:3001/dms',
    digitalMessagingUrl: 'https://your-pega-instance.com/prweb/api/v1/channels/client'
  });
  
  const [debugData, setDebugData] = useState<any>({});
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const { toast } = useToast();

  // Set up WebSocket connection and event listeners
  useEffect(() => {
    dmsApi.connectWebSocket();
    
    // Listen for DMS messages
    const handleMessage = (message: DMSMessage) => {
      const chatMessage = {
        id: message.id,
        type: message.message_type === 'system' ? 'system' as const : 'csr' as const,
        content: message.content,
        timestamp: new Date(message.timestamp)
      };
      setMessages(prev => [...prev, chatMessage]);
    };
    
    // Listen for activity logs
    const handleActivity = (activity: ActivityLog) => {
      setLogs(prev => [...prev, activity]);
    };
    
    // Listen for status changes
    const handleStatus = (status: any) => {
      setDebugData(prev => ({ ...prev, dmsStatus: status }));
      if (status.connected !== undefined) {
        setConnectionStatus(status.connected ? 'connected' : 'disconnected');
      }
    };
    
    dmsApi.on('message', handleMessage);
    dmsApi.on('activity', handleActivity);
    dmsApi.on('status', handleStatus);
    
    // Load initial activity logs
    loadActivityLogs();
    
    return () => {
      dmsApi.off('message', handleMessage);
      dmsApi.off('activity', handleActivity);
      dmsApi.off('status', handleStatus);
      dmsApi.disconnectWebSocket();
    };
  }, []);
  
  const loadActivityLogs = async () => {
    try {
      const response = await dmsApi.getActivity(50);
      if (response.success && response.data) {
        setLogs(response.data.logs);
      }
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    }
  };
  
  const handleConnectionStatusChange = useCallback((status: 'connected' | 'disconnected' | 'connecting') => {
    setConnectionStatus(status);
    
    if (status === 'connected') {
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system' as const,
        content: 'Connected to Pega DMS successfully',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
      
      // Load debug data
      loadDebugData();
    } else if (status === 'disconnected') {
      const systemMessage = {
        id: Date.now().toString(),
        type: 'system' as const,
        content: 'Disconnected from Pega DMS',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, systemMessage]);
    }
  }, []);
  
  const loadDebugData = async () => {
    try {
      const [statusResponse, sessionsResponse] = await Promise.all([
        dmsApi.getStatus(),
        dmsApi.getSessions()
      ]);
      
      setDebugData({
        status: statusResponse.data,
        sessions: sessionsResponse.data
      });
    } catch (error) {
      console.error('Failed to load debug data:', error);
    }
  };
  
  const handleAddMessage = useCallback((message: { id: string; type: 'user' | 'csr' | 'system'; content: string; timestamp: Date }) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "All messages have been removed",
    });
  };

  const handleEndSession = async () => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Not Connected",
        description: "Cannot end session - not connected to DMS",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await dmsApi.endSession(config.customerId, 'User requested session end');
      
      if (response.success) {
        setConnectionStatus('disconnected');
        const systemMessage = {
          id: Date.now().toString(),
          type: 'system' as const,
          content: 'Chat session ended successfully',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);
        
        toast({
          title: "Session Ended",
          description: "Chat session has been terminated",
        });
      } else {
        throw new Error(response.error || 'Failed to end session');
      }
    } catch (error) {
      console.error('Failed to end session:', error);
      toast({
        title: "End Session Failed",
        description: error instanceof Error ? error.message : 'Failed to end session',
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <img 
                src="/lovable-uploads/bfc75f5d-b261-4e11-8b55-8116fa6b2e50.png" 
                alt="Pega API" 
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                  Client Channel API Playground
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Test and debug your client channel integrations in real-time
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThemeCustomizer(!showThemeCustomizer)}
              className="gap-2"
              aria-label="Customize theme"
            >
              <Settings className="w-4 h-4" />
              Theme
            </Button>
          </div>

          {/* Theme Customizer */}
          {showThemeCustomizer && (
            <div className="mb-6">
              <ThemeCustomizer />
            </div>
          )}
        </header>

        {/* Tabbed Interface */}
        <Tabs defaultValue="playground" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/30 p-1 h-12">
            <TabsTrigger 
              value="playground" 
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              API Playground
            </TabsTrigger>
            <TabsTrigger 
              value="sdk"
              className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-medium"
            >
              SDK Reference
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="playground" className="space-y-8">
            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Left Panel - Configuration */}
              <div className="lg:col-span-1">
                <ConfigPanel
                  config={config}
                  setConfig={setConfig}
                  connectionStatus={connectionStatus}
                  onConnectionStatusChange={handleConnectionStatusChange}
                />
              </div>

              {/* Center Panel - Chat Session */}
              <div className="lg:col-span-2 space-y-6">
                <Banner />
                <ChatSession
                  messages={messages}
                  connectionStatus={connectionStatus}
                  customerId={config.customerId}
                  onAddMessage={handleAddMessage}
                  onClearChat={handleClearChat}
                  onEndSession={handleEndSession}
                />
              </div>

              {/* Right Panel - Activity */}
              <div className="lg:col-span-1">
                <ActivityPanel logs={logs} />
              </div>
            </div>

            {/* Debug Tools */}
            <div className="mb-8">
              <DebugTools debugData={debugData} connectionStatus={connectionStatus} />
            </div>

            {/* Version Table */}
            <VersionTable />
          </TabsContent>

          <TabsContent value="sdk" className="space-y-6">
            <SDKViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
