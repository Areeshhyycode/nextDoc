import { useState } from "react";
import { Search, Cloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  SiBox,
  SiDropbox,
  SiGoogledrive,
  SiJira,
  SiSalesforce,
  SiSlack,
  SiZapier,
  SiZoom,
} from "react-icons/si";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
}

const integrations: Integration[] = [
  {
    id: "box",
    name: "Box",
    description: "Access your Box files directly.",
    icon: SiBox,
    color: "#0061D5",
    enabled: false,
  },
  {
    id: "dropbox",
    name: "Dropbox",
    description: "Connect and manage Dropbox files.",
    icon: SiDropbox,
    color: "#0061FF",
    enabled: false,
  },
  {
    id: "google-drive",
    name: "Google Drive",
    description: "Sync and open Google Drive content.",
    icon: SiGoogledrive,
    color: "#4285F4",
    enabled: false,
  },
  {
    id: "jira",
    name: "Jira",
    description: "Create and track Jira issues within the workspace.",
    icon: SiJira,
    color: "#0052CC",
    enabled: false,
  },
  {
    id: "onedrive",
    name: "OneDrive",
    description: "Access and manage your OneDrive files.",
    icon: Cloud,
    color: "#0078D4",
    enabled: false,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Connect your Salesforce data and workflows.",
    icon: SiSalesforce,
    color: "#00A1E0",
    enabled: false,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Integrate Slack for messages and task actions.",
    icon: SiSlack,
    color: "#4A154B",
    enabled: false,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automate tasks using Zapier integrations.",
    icon: SiZapier,
    color: "#FF4A00",
    enabled: false,
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Join and manage Zoom meetings directly.",
    icon: SiZoom,
    color: "#2D8CFF",
    enabled: false,
  },
];

export default function AppsIntegrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appStates, setAppStates] = useState<Record<string, boolean>>(
    integrations.reduce((acc, app) => ({ ...acc, [app.id]: app.enabled }), {})
  );

  const filteredIntegrations = integrations.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (appId: string) => {
    setAppStates((prev) => ({ ...prev, [appId]: !prev[appId] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground" data-testid="heading-apps-integrations">
            Apps & Integrations
          </h1>
          <p className="mt-2 text-sm text-muted-foreground" data-testid="text-apps-subtext">
            Connect your favorite tools to streamline workflows and boost productivity.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-apps"
            />
          </div>
        </div>

        {/* Integration Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map((app) => {
            const Icon = app.icon;
            return (
              <Card
                key={app.id}
                className="group p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                data-testid={`card-integration-${app.id}`}
              >
                <div className="flex items-start gap-4">
                  {/* App Icon */}
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${app.color}15` }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: app.color }}
                      data-testid={`icon-${app.id}`}
                    />
                  </div>

                  {/* App Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-foreground" data-testid={`text-app-name-${app.id}`}>
                        {app.name}
                      </h3>
                      <Switch
                        checked={appStates[app.id]}
                        onCheckedChange={() => handleToggle(app.id)}
                        data-testid={`switch-${app.id}`}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4" data-testid={`text-description-${app.id}`}>
                      {app.description}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      data-testid={`button-open-${app.id}`}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12" data-testid="empty-state-no-results">
            <p className="text-muted-foreground">
              No apps found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
