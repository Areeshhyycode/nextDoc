import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface IntegrationCardProps {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
  onToggle: () => void;
}

export function IntegrationCard({ id, name, description, icon: Icon, color, enabled, onToggle }: IntegrationCardProps) {
  return (
    <Card className="group p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg" data-testid={`card-integration-${id}`}>
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <Icon className="h-6 w-6" style={{ color }} data-testid={`icon-${id}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground" data-testid={`text-app-name-${id}`}>{name}</h3>
            <Switch checked={enabled} onCheckedChange={onToggle} data-testid={`switch-${id}`} />
          </div>
          <p className="text-sm text-muted-foreground mb-4" data-testid={`text-description-${id}`}>{description}</p>
          <Button variant="outline" size="sm" className="w-full" data-testid={`button-open-${id}`}>Open</Button>
        </div>
      </div>
    </Card>
  );
}
