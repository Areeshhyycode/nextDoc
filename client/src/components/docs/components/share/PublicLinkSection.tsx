import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Globe, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PublicLinkSectionProps {
  publicLinkEnabled: boolean;
  publicLink: string;
  onToggle: (enabled: boolean) => void;
  isToggling: boolean;
}

export function PublicLinkSection({
  publicLinkEnabled,
  publicLink,
  onToggle,
  isToggling,
}: PublicLinkSectionProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const { toast } = useToast();

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink);
    setLinkCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center justify-between py-2 px-3 bg-[#2a2a2a] rounded-lg">
        <div className="flex items-center gap-3">
          <Globe className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-white">Public link</span>
        </div>
        <Switch
          checked={publicLinkEnabled}
          onCheckedChange={onToggle}
          disabled={isToggling}
          className="data-[state=checked]:bg-blue-500"
        />
      </div>

      {publicLinkEnabled && publicLink && (
        <div className="flex items-center gap-2">
          <Input
            value={publicLink}
            readOnly
            className="flex-1 h-9 text-xs bg-[#2a2a2a] border-[#444] text-gray-300 font-mono"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={copyPublicLink}
            className={`h-9 px-3 border-[#444] ${linkCopied ? 'bg-green-600 border-green-600 text-white' : 'bg-[#2a2a2a] text-white hover:bg-[#333]'}`}
          >
            {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </>
  );
}
