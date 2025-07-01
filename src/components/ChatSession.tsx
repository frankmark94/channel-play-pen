
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Trash2, Bot, PhoneOff } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'csr' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatSessionProps {
  messages: Message[];
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  onSendMessage: (content: string, messageType: string) => void;
  onClearChat: () => void;
  onSimulateCSR: () => void;
  onEndSession: () => void;
}

export const ChatSession = ({
  messages,
  connectionStatus,
  onSendMessage,
  onClearChat,
  onSimulateCSR,
  onEndSession
}: ChatSessionProps) => {
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState('Text Message');

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText, messageType);
      setMessageText('');
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
        return 'bg-blue-100 text-blue-900 ml-8';
      case 'csr':
        return 'bg-green-100 text-green-900 mr-8';
      case 'system':
        return 'bg-gray-100 text-gray-700 mx-4 text-center';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusBadge = () => {
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
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Chat Session</CardTitle>
          {getStatusBadge()}
        </div>
        <p className="text-sm text-gray-600">Chat session started. Send a message to begin.</p>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Messages Area */}
        <ScrollArea className="flex-1 rounded-lg border bg-gray-50/50 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${getMessageStyle(message.type)}`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger className="w-48">
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
          
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              className="flex-1"
            />
            <Button 
              onClick={handleSend}
              disabled={!messageText.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
            <Button
              onClick={onSimulateCSR}
              variant="outline"
              className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
            >
              <Bot className="w-4 h-4 mr-2" />
              Simulate CSR Response
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={onClearChat}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Chat
            </Button>
            <Button
              onClick={onEndSession}
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

