import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Package, Palette, Code, Megaphone, Shield, Target, Calendar,
  Briefcase, TrendingUp, Award, Zap, Rocket, Heart, Star, Coffee,
  CheckCircle, Circle
} from "lucide-react";
import { COLOR_PRESETS, DEFAULT_COLOR } from "@/constants/color-presets";

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_ICONS = [
  { name: "Users", Icon: Users },
  { name: "Package", Icon: Package },
  { name: "Palette", Icon: Palette },
  { name: "Code", Icon: Code },
  { name: "Megaphone", Icon: Megaphone },
  { name: "Shield", Icon: Shield },
  { name: "Target", Icon: Target },
  { name: "Calendar", Icon: Calendar },
  { name: "Briefcase", Icon: Briefcase },
  { name: "TrendingUp", Icon: TrendingUp },
  { name: "Award", Icon: Award },
  { name: "Zap", Icon: Zap },
  { name: "Rocket", Icon: Rocket },
  { name: "Heart", Icon: Heart },
  { name: "Star", Icon: Star },
  { name: "Coffee", Icon: Coffee },
];

export function CreateTeamModal({ open, onOpenChange }: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Users");
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLOR);
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string; color: string; description?: string }) => {
      return await apiRequest("/api/teams", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create team",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setName("");
    setSelectedIcon("Users");
    setSelectedColor(DEFAULT_COLOR);
    setDescription("");
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      toast({
        title: "Team name required",
        description: "Please enter a name for your team.",
        variant: "destructive",
      });
      return;
    }

    createTeamMutation.mutate({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      description: description.trim() || undefined,
    });
  };

  const selectedIconObj = AVAILABLE_ICONS.find(icon => icon.name === selectedIcon);
  const SelectedIconComponent = selectedIconObj ? selectedIconObj.Icon : Users;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-white border-gray-200 p-0 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Create team
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            A team represents teams, departments, or groups, each with its own workflows and settings.
          </p>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5 overflow-y-auto flex-1">
          {/* Icon & Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Icon & name</Label>
            <div className="flex gap-3">
              <button
                type="button"
                className="w-12 h-12 rounded-lg flex items-center justify-center transition-all border-2"
                style={{ 
                  backgroundColor: selectedColor + '20',
                  borderColor: selectedColor,
                  color: selectedColor
                }}
                data-testid="button-icon-preview"
              >
                <SelectedIconComponent className="w-6 h-6" />
              </button>
              <Input
                placeholder="e.g. Marketing, Engineering, HR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                data-testid="input-team-name"
              />
            </div>
          </div>

          {/* Icon Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Select icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {AVAILABLE_ICONS.map(({ name: iconName, Icon }) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setSelectedIcon(iconName)}
                  className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all border-2 hover:border-gray-400 ${
                    selectedIcon === iconName
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                  data-testid={`button-icon-${iconName.toLowerCase()}`}
                >
                  <Icon className={`w-5 h-5 ${
                    selectedIcon === iconName ? 'text-blue-600' : 'text-gray-600'
                  }`} />
                  {selectedIcon === iconName && (
                    <CheckCircle className="w-3 h-3 text-blue-600 absolute -top-1 -right-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Team color</Label>
            <div className="grid grid-cols-10 gap-2">
              {COLOR_PRESETS.map(({ name: colorName, value }) => (
                <button
                  key={colorName}
                  type="button"
                  onClick={() => setSelectedColor(value)}
                  className="w-full aspect-square rounded-lg transition-all border-2 hover:scale-110 relative"
                  style={{ 
                    backgroundColor: value,
                    borderColor: selectedColor === value ? '#1F2937' : 'transparent'
                  }}
                  title={colorName}
                  data-testid={`button-color-${colorName.toLowerCase()}`}
                >
                  {selectedColor === value && (
                    <CheckCircle className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="What is this team working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
              data-testid="textarea-team-description"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              data-testid="button-cancel-team"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createTeamMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6"
              data-testid="button-create-team"
            >
              {createTeamMutation.isPending ? "Creating..." : "Create team"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
