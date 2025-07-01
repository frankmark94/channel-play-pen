
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, ExternalLink } from 'lucide-react';

export const Banner = () => {
  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wrench className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Currently using a test server
            </p>
            <p className="text-xs text-amber-700">
              Click here to learn how to host your own
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-amber-200 text-amber-700 hover:bg-amber-100"
        >
          Learn More
          <ExternalLink className="w-3 h-3 ml-2" />
        </Button>
      </div>
    </Card>
  );
};

