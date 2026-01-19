import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { X, ChevronDown, FileText, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InviteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteModal({ open, onOpenChange }: InviteModalProps) {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [showPaperPlane, setShowPaperPlane] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setShowPaperPlane(false);
      const timer = setTimeout(() => {
        setShowPaperPlane(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const emailChips = useMemo(() => {
    if (!emails.trim()) return [];
    return emails
      .split(/[,\s]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }, [emails]);

  const inviteMutation = useMutation({
    mutationFn: async (data: { emails: string; role: string }) => {
      return await apiRequest("/api/invites", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Invitations sent",
        description: "Team members will receive their invitations via email.",
      });
      setEmails("");
      setRole("user");
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitations",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!emails.trim()) {
      toast({
        title: "Email required",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }

    inviteMutation.mutate({ emails, role });
  };

  const removeEmail = (emailToRemove: string) => {
    const updatedEmails = emailChips
      .filter(email => email !== emailToRemove)
      .join(", ");
    setEmails(updatedEmails);
  };

  const roleOptions = [
    {
      value: "user",
      label: "Member",
      description: "Can access all public items in your Workspace.",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Can manage Spaces, People, Billing and other Workspace settings.",
    },
  ];

  const selectedRoleLabel = roleOptions.find(opt => opt.value === role)?.label || "Member";

  const floatingShapes = [
    { id: 1, shape: "circle", color: "bg-blue-400", size: "w-2 h-2", x: "10%", y: "20%", delay: 0 },
    { id: 2, shape: "square", color: "bg-blue-400", size: "w-2 h-2", x: "85%", y: "30%", delay: 0.2 },
    { id: 3, shape: "triangle", color: "bg-blue-300", size: "w-2 h-2", x: "15%", y: "70%", delay: 0.4 },
    { id: 4, shape: "circle", color: "bg-gray-300", size: "w-1.5 h-1.5", x: "80%", y: "60%", delay: 0.1 },
    { id: 5, shape: "square", color: "bg-blue-300", size: "w-1.5 h-1.5", x: "90%", y: "85%", delay: 0.3 },
    { id: 6, shape: "circle", color: "bg-blue-200", size: "w-1 h-1", x: "25%", y: "15%", delay: 0.5 },
    { id: 7, shape: "star", color: "bg-gray-400", size: "w-1.5 h-1.5", x: "70%", y: "25%", delay: 0.15 },
    { id: 8, shape: "square", color: "bg-blue-200", size: "w-1 h-1", x: "35%", y: "80%", delay: 0.35 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-white border-gray-200 p-0">
        {/* Animated Header Section */}
        <div className="relative px-6 pt-8 pb-6 overflow-hidden">
          {/* Floating Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none">
            {floatingShapes.map((shape) => (
              <motion.div
                key={shape.id}
                className={`absolute ${shape.size} ${shape.color} ${
                  shape.shape === "circle" ? "rounded-full" : ""
                } ${
                  shape.shape === "square" ? "rounded-sm rotate-45" : ""
                } ${
                  shape.shape === "triangle" ? "rounded-sm rotate-12" : ""
                } ${
                  shape.shape === "star" ? "rounded-sm" : ""
                }`}
                style={{
                  left: shape.x,
                  top: shape.y,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.6, 0.4],
                  scale: [0, 1.2, 1],
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  delay: shape.delay,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Icon Animation Container */}
          <div className="relative flex justify-center items-center h-24 mb-4">
            <AnimatePresence mode="wait">
              {!showPaperPlane ? (
                <motion.div
                  key="document"
                  initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg border-2 border-dashed border-blue-300">
                    <FileText className="w-10 h-10 text-white" strokeWidth={2.5} />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="plane"
                  initial={{ opacity: 0, scale: 0.5, x: -50, y: 50 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: 0, 
                    y: 0,
                    rotate: [0, -5, 5, 0],
                  }}
                  transition={{ 
                    duration: 0.6,
                    rotate: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
                  }}
                  className="relative"
                >
                  <Send className="w-16 h-16 text-blue-500" strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title */}
          <DialogTitle className="text-xl font-semibold text-gray-900 text-center">
            Invite new teammates
          </DialogTitle>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="emails" className="text-sm font-medium text-gray-700">
              Invite by email
            </Label>
            <div className="space-y-2">
              <Input
                id="emails"
                placeholder="Email, comma or space separated"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                data-testid="input-invite-emails"
              />
              
              {/* Email Chips */}
              {emailChips.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {emailChips.map((email, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-200"
                      data-testid={`chip-email-${index}`}
                    >
                      <span>{email}</span>
                      <button
                        onClick={() => removeEmail(email)}
                        className="hover:bg-blue-100 rounded p-0.5 transition-colors"
                        data-testid={`button-remove-email-${index}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Invite as</Label>
            <Select value={role} onValueChange={(value: "user" | "admin") => setRole(value)}>
              <SelectTrigger 
                className="w-full bg-white border-gray-300 text-gray-900 hover:bg-gray-50 focus:border-blue-500 focus:ring-blue-500 h-auto py-3"
                data-testid="select-invite-role"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{selectedRoleLabel}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {roleOptions.find(opt => opt.value === role)?.description}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 ml-2 flex-shrink-0" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                {roleOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value} 
                    className="text-gray-900 focus:bg-gray-50 cursor-pointer py-3"
                  >
                    <div className="flex flex-col">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              data-testid="button-cancel-invite"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={inviteMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700 px-6"
              data-testid="button-send-invite"
            >
              {inviteMutation.isPending ? "Sending..." : "Send invite"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
