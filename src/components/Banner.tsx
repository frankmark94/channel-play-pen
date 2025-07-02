
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, ExternalLink } from 'lucide-react';

export const Banner = () => {
  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              🎉 Use Your Own Credentials!
            </p>
            <p className="text-xs text-green-700">
              Enter your Pega DMS credentials in the Configuration panel to test with real data
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-green-200 text-green-700 hover:bg-green-100"
        >
          Learn More
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
      </div>
    </Card>
  );
};

