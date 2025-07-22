import { Card } from "@/components/ui/card";
import { Loader2, MessageSquare, AlertCircle } from "lucide-react";
import { useLatestMessage } from "@/hooks/useLatestMessage";
import { Button } from "@/components/ui/button";

export const LatestUpdateCard = () => {
  const { message, loading, error, refetch } = useLatestMessage();

  if (loading) {
    return (
      <Card className="p-4 border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">📢 Latest Update</h2>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span>Loading latest update...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4 border shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">📢 Latest Update</h2>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={16} />
            <span className="text-sm">Failed to load update</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 border shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare size={20} className="text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">📢 Latest Update</h2>
      </div>
      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
        {message || 'No updates available'}
      </p>
    </Card>
  );
};