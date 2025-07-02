
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Trash2, Bot, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import dmsApi, { SendMessageRequest } from '@/lib/api';

interface Message {
  id: string;
  type: 'user' | 'csr' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatSessionProps {
  messages: Message[];
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  customerId: string;
  onAddMessage: (message: Message) => void;
  onClearChat: () => void;
  onEndSession: () => void;
}

export const ChatSession = ({
  messages,
  connectionStatus,
  customerId,
  onAddMessage,
  onClearChat,
  onEndSession
}: ChatSessionProps) => {
  const { toast } = useToast();
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('Text Message');

  const handleSend = async () => {
    if (!messageText.trim()) return;
    
    if (connectionStatus !== 'connected') {
      toast({
        title: "Not Connected",
        description: "Please connect to DMS before sending messages",
        variant: "destructive"
      });
      return;
    }

    if (!customerId.trim()) {
      toast({
        title: "Customer ID Required",
        description: "Please set a Customer ID in the configuration",
        variant: "destructive"
      });
      return;
    }

    // Add user message to chat immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    };
    
    onAddMessage(userMessage);
    const messageToSend = messageText;
    setMessageText('');

    try {
      const request: SendMessageRequest = {
        customer_id: customerId,
        message: messageToSend,
        message_type: messageType === 'Rich + Content Data' ? 'rich_content' : 'text',
        metadata: {
          messageType,
          timestamp: new Date().toISOString()
        }
      };

      const response = await dmsApi.sendMessage(request);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }

      toast({
        title: "Message Sent",
        description: "Your message has been sent to DMS",
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Send Failed",
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: "destructive"
      });

      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      onAddMessage(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-600 text-white ml-8 rounded-2xl rounded-br-md';
      case 'csr':
        return 'bg-gray-100 text-gray-900 mr-8 rounded-2xl rounded-bl-md border border-gray-200';
      case 'system':
        return 'bg-blue-50 text-blue-800 mx-8 text-center rounded-lg border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge className="bg-green-500 text-white hover:bg-green-500">● Connected</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-500">● Connecting</Badge>;
      default:
        return <Badge className="bg-red-500 text-white hover:bg-red-500">● Disconnected</Badge>;
    }
  };

  return (
    <Card className="shadow-lg border border-gray-200 bg-white h-[650px] flex flex-col">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Chat Session</CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-blue-100 text-sm">
          Chat session started. Send a message to begin.
        </p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation to see messages here</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 max-w-xs ${getMessageStyle(message.type)} ${
                    message.type === 'user' ? 'ml-auto' : message.type === 'csr' ? 'mr-auto' : 'mx-auto'
                  }`}
                >
                  <div className="text-sm leading-relaxed">{message.content}</div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area - Rearranged */}
        <div className="p-4 bg-white space-y-4">
          {/* Main Message Input - Now at the top */}
          <div className="space-y-2">
            <label htmlFor="message-input" className="block text-sm font-medium text-gray-700">
              Type your message
            </label>
            <div className="flex gap-2">
              <Input
                id="message-input"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Start typing your message here..."
                className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-base h-12"
              />
              <Button 
                onClick={handleSend}
                disabled={!messageText.trim() || connectionStatus !== 'connected'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-12 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
          
          {/* Message Type Selector - Now below the input */}
          <div className="space-y-2">
            <label htmlFor="message-type" className="block text-sm font-medium text-gray-700">
              Message type
            </label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger className="w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Text Message">Text Message</SelectItem>
                <SelectItem value="Rich + Content Data">Rich + Content Data</SelectItem>
                <SelectItem value="Menu Selection">Menu Selection (Postback)</SelectItem>
                <SelectItem value="Typing Indicator">Typing Indicator</SelectItem>
                <SelectItem value="End Session">End Session</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={onClearChat}
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear Chat
            </Button>
            <Button
              onClick={onEndSession}
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
              disabled={connectionStatus !== 'connected'}
            >
              <PhoneOff className="w-4 h-4 mr-1" />
              End Session
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
