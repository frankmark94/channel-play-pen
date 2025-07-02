
import { useState } from 'react';
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

const Index = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'csr' | 'system';
    content: string;
    timestamp: Date;
  }>>([]);
  const [logs, setLogs] = useState<Array<{
    id: string;
    type: 'sent' | 'received';
    content: string;
    timestamp: Date;
  }>>([]);
  const [config, setConfig] = useState({
    customerId: '',
    connectionId: '4ff965fe-aaff-4c33-a727-29e928833417',
    jwtSecret: '••••••••••••••••••••••••••••',
    clientWebhookUrl: 'https://clientchannelexamplev3.onrender.com',
    digitalMessagingUrl: 'https://incoming.artemis-pega.digital/messaging'
  });
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);
  const { toast } = useToast();

  const handleSaveConfig = () => {
    if (!config.customerId.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer ID is required",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Configuration Saved",
      description: "Your settings have been updated successfully",
    });
  };

  const handleTestConnection = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: 'Connection test successful',
        timestamp: new Date()
      }]);
      toast({
        title: "Connection Successful",
        description: "API endpoint is responding correctly",
      });
    }, 2000);
  };

  const handleSendMessage = (content: string, messageType: string) => {
    const newMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: `${messageType}: ${content}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Add to logs
    setLogs(prev => [...prev, {
      id: Date.now().toString(),
      type: 'sent',
      content: `Sent ${messageType} message: ${content}`,
      timestamp: new Date()
    }]);
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "All messages have been removed",
    });
  };

  const handleSimulateCSR = () => {
    const csrMessage = {
      id: Date.now().toString(),
      type: 'csr' as const,
      content: 'Thank you for contacting us. How can I assist you today?',
      timestamp: new Date()
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, csrMessage]);
      setLogs(prev => [...prev, {
        id: Date.now().toString(),
        type: 'received',
        content: 'Received CSR response: Thank you for contacting us. How can I assist you today?',
        timestamp: new Date()
      }]);
    }, 1000);
  };

  const handleEndSession = () => {
    setConnectionStatus('disconnected');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'system',
      content: 'Chat session ended',
      timestamp: new Date()
    }]);
    toast({
      title: "Session Ended",
      description: "Chat session has been terminated",
    });
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
                  onSaveConfig={handleSaveConfig}
                  onTestConnection={handleTestConnection}
                  connectionStatus={connectionStatus}
                />
              </div>

              {/* Center Panel - Chat Session */}
              <div className="lg:col-span-2 space-y-6">
                <Banner />
                <ChatSession
                  messages={messages}
                  connectionStatus={connectionStatus}
                  onSendMessage={handleSendMessage}
                  onClearChat={handleClearChat}
                  onSimulateCSR={handleSimulateCSR}
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
              <DebugTools />
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
