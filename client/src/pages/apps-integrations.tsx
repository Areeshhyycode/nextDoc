import { useState } from "react";
import { INTEGRATIONS } from "@/constants/integrations";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { IntegrationCard } from "@/components/ui/integration-card";
import { EmptyState } from "@/components/ui/empty-state";

export default function AppsIntegrations() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appStates, setAppStates] = useState<Record<string, boolean>>(
    INTEGRATIONS.reduce((acc, app) => ({ ...acc, [app.id]: app.enabled }), {})
  );

  const filteredIntegrations = INTEGRATIONS.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (appId: string) => {
    setAppStates((prev) => ({ ...prev, [appId]: !prev[appId] }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="Apps & Integrations"
          description="Connect your favorite tools to streamline workflows and boost productivity."
          titleTestId="heading-apps-integrations"
          descriptionTestId="text-apps-subtext"
        />

        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search apps..."
          data-testid="input-search-apps"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map((app) => (
            <IntegrationCard
              key={app.id}
              {...app}
              enabled={appStates[app.id]}
              onToggle={() => handleToggle(app.id)}
            />
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <EmptyState
            message={`No apps found matching "${searchQuery}"`}
            data-testid="empty-state-no-results"
          />
        )}
      </div>
    </div>
  );
}
