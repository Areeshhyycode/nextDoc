import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OnboardingModalProps {
  open: boolean;
  userName: string;
}

export function OnboardingModal({ open, userName }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  
  // Step 1: Use case
  const [useCase, setUseCase] = useState<string>("");
  
  // Step 2: Management area
  const [managementArea, setManagementArea] = useState<string>("");
  
  // Step 3: How they heard
  const [heardFrom, setHeardFrom] = useState<string>("");
  
  // Step 4: Invite emails
  const [inviteEmails, setInviteEmails] = useState<string[]>([]);
  const [inviteInput, setInviteInput] = useState("");
  const [inviteRole, setInviteRole] = useState<"user" | "admin">("user");
  
  // Step 5: Features
  const [features, setFeatures] = useState<string[]>([]);
  
  // Step 6: Workspace name
  const [workspaceName, setWorkspaceName] = useState("");

  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/onboarding/complete", data);
    },
    onSuccess: async () => {
      // Wait for query invalidation and refetch to complete before redirecting
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });

      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use hard redirect to ensure clean state
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive",
      });
    },
  });

  const skipOnboardingMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/onboarding/skip", {});
    },
    onSuccess: async () => {
      // Wait for query invalidation and refetch to complete before redirecting
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });

      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Use hard redirect to ensure clean state
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to skip onboarding",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      // Final step - submit
      completeOnboardingMutation.mutate({
        useCase,
        managementArea,
        heardFrom,
        workspaceName,
        features,
        inviteEmails: inviteEmails.map(email => ({ email, role: inviteRole })),
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const addEmail = () => {
    if (inviteInput && inviteInput.includes("@")) {
      setInviteEmails([...inviteEmails, inviteInput]);
      setInviteInput("");
    }
  };

  const removeEmail = (index: number) => {
    setInviteEmails(inviteEmails.filter((_, i) => i !== index));
  };

  const toggleFeature = (feature: string) => {
    if (features.includes(feature)) {
      setFeatures(features.filter(f => f !== feature));
    } else {
      setFeatures([...features, feature]);
    }
  };

  const canProceed = () => {
    if (step === 1) return useCase !== "";
    if (step === 2) return managementArea !== "";
    if (step === 3) return heardFrom !== "";
    if (step === 4) return true; // Optional
    if (step === 5) return true; // Optional
    if (step === 6) return workspaceName !== "";
    return false;
  };

  const handleClose = (isOpen: boolean) => {
    // Prevent closing during mutation
    if (!isOpen && !completeOnboardingMutation.isPending && !skipOnboardingMutation.isPending) {
      skipOnboardingMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="onboarding-modal">
        <div className="py-8">
          <div className="mb-8 flex items-center justify-between">
            <span className="text-xl font-bold text-primary">Cyberbay PMO</span>
            <span className="text-sm text-muted-foreground">Welcome, {userName}!</span>
          </div>

          {/* Step 1: Use Case */}
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground text-center">
                What would you like to use Cyberbay PMO for?
              </h2>
              <div className="flex gap-4 justify-center">
                {["Work", "Personal", "School"].map((option) => (
                  <Button
                    key={option}
                    variant={useCase === option ? "default" : "outline"}
                    onClick={() => setUseCase(option)}
                    className="px-8"
                    data-testid={`use-case-${option.toLowerCase()}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="h-1 bg-border rounded">
                <div className="h-full bg-primary rounded" style={{ width: "16.67%" }} />
              </div>
            </div>
          )}

          {/* Step 2: Management Area */}
          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground text-center">
                What would you like to manage?
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "IT", "Professional Services", "HR & Recruiting", "Startup", "PMO",
                  "Finance & Accounting", "Creative & Design", "Software Development", "Operations",
                  "Sales & CRM", "Support", "Marketing", "Personal Use", "Other"
                ].map((option) => (
                  <Button
                    key={option}
                    variant={managementArea === option ? "default" : "outline"}
                    onClick={() => setManagementArea(option)}
                    className="px-6"
                    data-testid={`management-${option.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Don't worry, you can always add more in the future.
              </p>
              <div className="h-1 bg-border rounded">
                <div className="h-full bg-primary rounded" style={{ width: "33.33%" }} />
              </div>
            </div>
          )}

          {/* Step 3: How they heard */}
          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground text-center">
                How did you hear about us?
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "YouTube", "AI Tools (ChatGPT, Perplexity, etc.)", "Search Engine (Google, Bing, etc.)",
                  "Facebook / Instagram", "Reddit", "TikTok", "Software Review Sites",
                  "TV / Streaming (Hulu, NBC, etc.)", "Friend / Colleague", "LinkedIn", "Other"
                ].map((option) => (
                  <Button
                    key={option}
                    variant={heardFrom === option ? "default" : "outline"}
                    onClick={() => setHeardFrom(option)}
                    className="px-4 text-sm"
                    data-testid={`heard-${option.toLowerCase().split(' ')[0]}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <div className="h-1 bg-border rounded">
                <div className="h-full bg-primary rounded" style={{ width: "50%" }} />
              </div>
            </div>
          )}

          {/* Step 4: Invite people */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground text-center">
                Invite people to your Workspace:
              </h2>
              <div className="max-w-md mx-auto space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email addresses (or paste multiple)"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addEmail();
                      }
                    }}
                    className="flex-1"
                    data-testid="invite-email-input"
                  />
                  <Select value={inviteRole} onValueChange={(value: "user" | "admin") => setInviteRole(value)}>
                    <SelectTrigger className="w-32" data-testid="invite-role-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {inviteEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                    <span className="flex-1 text-sm">{email}</span>
                    <button
                      onClick={() => removeEmail(index)}
                      className="text-muted-foreground hover:text-foreground"
                      data-testid={`remove-email-${index}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                {inviteInput && (
                  <button
                    onClick={addEmail}
                    className="text-sm text-primary hover:underline"
                    data-testid="add-email-button"
                  >
                    + Add {inviteInput}
                  </button>
                )}
                
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Don't do it alone - Invite your team to get started 200% faster.
                </p>
              </div>
              <div className="h-1 bg-border rounded">
                <div className="h-full bg-primary rounded" style={{ width: "66.67%" }} />
              </div>
            </div>
          )}

          {/* Step 5: Features */}
          {step === 5 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground text-center">
                Which features are you interested in trying?
              </h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  "Tasks & Projects", "Gantt Charts", "Dashboards", "Calendar",
                  "Scheduling", "Goals & OKRs", "Time Tracking", "Kanban Boards",
                  "Sprints", "Reports & Analytics"
                ].map((option) => (
                  <Button
                    key={option}
                    variant={features.includes(option) ? "default" : "outline"}
                    onClick={() => toggleFeature(option)}
                    className="px-4"
                    data-testid={`feature-${option.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Don't worry, you'll have access to all of these in your Workspace.
              </p>
              <div className="h-1 bg-border rounded">
                <div className="h-full bg-primary rounded" style={{ width: "83.33%" }} />
              </div>
            </div>
          )}

          {/* Step 6: Workspace Name */}
          {step === 6 && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-foreground text-center">
                Lastly, what would you like to name your Workspace?
              </h2>
              <div className="max-w-md mx-auto space-y-2">
                <Input
                  placeholder="Purevpn"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="text-center"
                  data-testid="workspace-name-input"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Try the name of your company or organization.
                </p>
              </div>
              <div className="h-1 bg-border rounded">
                <div className="h-full bg-primary rounded" style={{ width: "100%" }} />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1 || completeOnboardingMutation.isPending}
              className="flex items-center gap-2"
              data-testid="onboarding-back"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || completeOnboardingMutation.isPending}
              className="px-8"
              data-testid="onboarding-next"
            >
              {completeOnboardingMutation.isPending ? "Saving..." : step === 6 ? "Finish" : "Next"} →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
