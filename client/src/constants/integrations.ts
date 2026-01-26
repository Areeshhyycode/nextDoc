import { Cloud } from "lucide-react";
import { SiBox, SiDropbox, SiGoogledrive, SiJira, SiSalesforce, SiSlack, SiZapier, SiZoom } from "react-icons/si";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  enabled: boolean;
}

export const INTEGRATIONS: Integration[] = [
  { id: "box", name: "Box", description: "Access your Box files directly.", icon: SiBox, color: "#0061D5", enabled: false },
  { id: "dropbox", name: "Dropbox", description: "Connect and manage Dropbox files.", icon: SiDropbox, color: "#0061FF", enabled: false },
  { id: "google-drive", name: "Google Drive", description: "Sync and open Google Drive content.", icon: SiGoogledrive, color: "#4285F4", enabled: false },
  { id: "jira", name: "Jira", description: "Create and track Jira issues within the workspace.", icon: SiJira, color: "#0052CC", enabled: false },
  { id: "onedrive", name: "OneDrive", description: "Access and manage your OneDrive files.", icon: Cloud, color: "#0078D4", enabled: false },
  { id: "salesforce", name: "Salesforce", description: "Connect your Salesforce data and workflows.", icon: SiSalesforce, color: "#00A1E0", enabled: false },
  { id: "slack", name: "Slack", description: "Integrate Slack for messages and task actions.", icon: SiSlack, color: "#4A154B", enabled: false },
  { id: "zapier", name: "Zapier", description: "Automate tasks using Zapier integrations.", icon: SiZapier, color: "#FF4A00", enabled: false },
  { id: "zoom", name: "Zoom", description: "Join and manage Zoom meetings directly.", icon: SiZoom, color: "#2D8CFF", enabled: false },
];
