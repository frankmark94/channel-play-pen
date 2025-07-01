
import { useState } from 'react';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ChatSession } from '@/components/ChatSession';
import { ActivityPanel } from '@/components/ActivityPanel';
import { DebugTools } from '@/components/DebugTools';
import { VersionTable } from '@/components/VersionTable';
import { Banner } from '@/components/Banner';
import { SDKViewer } from '@/components/SDKViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/lovable-uploads/bfc75f5d-b261-4e11-8b55-8116fa6b2e50.png" 
              alt="Pega API" 
              className="w-12 h-12"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Client Channel API Playground
              </h1>
              <p className="text-gray-600 mt-1">
                Test and debug your client channel integrations in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Tabbed Interface */}
        <Tabs defaultValue="playground" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="playground">API Playground</TabsTrigger>
            <TabsTrigger value="sdk">SDK Reference</TabsTrigger>
          </TabsList>
          
          <TabsContent value="playground" className="space-y-6">
            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
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
              <div className="lg:col-span-2 space-y-4">
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
            <div className="mb-6">
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
