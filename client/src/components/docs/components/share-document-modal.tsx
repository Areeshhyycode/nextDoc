import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Search, Trash2, Check, Loader2, Globe, Copy, Download, FileText, FileCode, FileType, File, FileJson, FileSpreadsheet, ChevronDown, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import type { DocumentWithOwner } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { exportDocument, type ExportFormat } from "../utils/export-utils";

interface ShareDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentWithOwner;
}

interface UserSearchResult {
  id: string;
  displayName: string;
  email: string;
  profilePicture: string | null;
}

type PermissionType = "view" | "edit" | "comment" | "edit_comment";

interface DocumentShare {
  id: string;
  documentId: string;
  userId: string;
  permission: PermissionType;
  sharedBy: string;
  sharedAt: string;
  user: {
    id: string;
    displayName: string;
    email: string;
    profilePicture: string | null;
  };
}

export function ShareDocumentModal({ isOpen, onClose, document }: ShareDocumentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [permission, setPermission] = useState<PermissionType>("view");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Search users
  const { data: searchResults = [], isLoading: isSearching } = useQuery<UserSearchResult[]>({
    queryKey: ["/api/users/search", searchQuery],
    queryFn: async () => {
      if (searchQuery.length < 2) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to search users");
      return response.json();
    },
    enabled: searchQuery.length >= 2,
    staleTime: 0,
    gcTime: 0,
  });

  // Get existing shares
  const { data: shares = [], isLoading: isLoadingShares } = useQuery<DocumentShare[]>({
    queryKey: [`/api/docs/${document.id}/shares`],
    enabled: isOpen,
  });

  // Share document mutation
  const shareMutation = useMutation({
    mutationFn: async (data: { userEmail: string; permission: string }) => {
      return apiRequest("POST", `/api/docs/${document.id}/shares`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${document.id}/shares`] });
      queryClient.invalidateQueries({ queryKey: ["/api/docs"] });
      setSelectedUser(null);
      setSearchQuery("");
      toast({ title: "Document shared", description: "User has been added to the document." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to share", description: error.message || "Could not share the document.", variant: "destructive" });
    },
  });

  // Update permission mutation
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: string }) => {
      return apiRequest("PATCH", `/api/docs/${document.id}/shares/${userId}`, { permission });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${document.id}/shares`] });
      toast({ title: "Permission updated", description: "User permission has been updated." });
    },
  });

  // Remove share mutation
  const removeShareMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/docs/${document.id}/shares/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${document.id}/shares`] });
      queryClient.invalidateQueries({ queryKey: ["/api/docs"] });
      toast({ title: "Access removed", description: "User no longer has access to this document." });
    },
  });

  // Public link state
  const [publicLinkEnabled, setPublicLinkEnabled] = useState(document.publicLinkEnabled || false);
  const [publicLinkToken, setPublicLinkToken] = useState(document.publicLinkToken || "");

  useEffect(() => {
    setPublicLinkEnabled(document.publicLinkEnabled || false);
    setPublicLinkToken(document.publicLinkToken || "");
  }, [document.publicLinkEnabled, document.publicLinkToken]);

  // Toggle public link mutation
  const togglePublicLinkMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await apiRequest("PATCH", `/api/docs/${document.id}/public-link`, { enabled });
      return response.json();
    },
    onSuccess: (data) => {
      setPublicLinkEnabled(data.publicLinkEnabled);
      setPublicLinkToken(data.publicLinkToken || "");
      queryClient.invalidateQueries({ queryKey: ["/api/docs"] });
      toast({
        title: data.publicLinkEnabled ? "Public link enabled" : "Public link disabled",
        description: data.publicLinkEnabled ? "Anyone with the link can now view this document." : "The public link has been disabled.",
      });
    },
    onError: () => {
      toast({ title: "Failed to update public link", variant: "destructive" });
    },
  });

  const publicLink = publicLinkToken ? `${window.location.origin}/public/docs/${publicLinkToken}` : "";

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink);
    setLinkCopied(true);
    toast({ title: "Link copied", description: "Public link copied to clipboard." });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShare = () => {
    if (selectedUser) {
      shareMutation.mutate({ userEmail: selectedUser.email, permission });
    }
  };

  const handleSelectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchQuery(user.email);
    setShowSearchResults(false);
  };

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      let content = document.content || "";
      if (!content) {
        const response = await fetch(`/api/docs/${document.id}`, { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch document");
        const fullDoc = await response.json();
        content = fullDoc.content || "";
      }
      exportDocument(format, document.title || "Untitled", content, {
        author: document.owner?.displayName,
        createdAt: document.createdAt?.toString(),
      });
      toast({
        title: "Export started",
        description: format === "pdf" ? "Your PDF will open in a new window for printing/saving." : `Document exported as ${format.toUpperCase()}.`,
      });
    } catch {
      toast({ title: "Export failed", description: "Could not export the document. Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscapeKey);
      };
    }
  }, [showSearchResults]);

  // Keyboard navigation for selected user
  useEffect(() => {
    const handleEnterKey = (event: KeyboardEvent) => {
      if (event.key === "Enter" && selectedUser && !shareMutation.isPending) {
        handleShare();
      }
    };

    if (selectedUser) {
      document.addEventListener("keydown", handleEnterKey);
      return () => {
        document.removeEventListener("keydown", handleEnterKey);
      };
    }
  }, [selectedUser, shareMutation.isPending, handleShare]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedUser(null);
      setShowSearchResults(false);
      setLinkCopied(false);
    }
  }, [isOpen]);

  // Filter out already shared users and owner
  const alreadySharedIds = shares.map(s => s.userId);
  const availableUsers = searchResults.filter(
    user => !alreadySharedIds.includes(user.id) && user.id !== document.owner?.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-[420px] p-4 sm:p-4 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-3 sm:pb-2 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2.5 sm:gap-2 text-base sm:text-base">
            <Users className="h-5 w-5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
            <span className="truncate">Share "{document.title}"</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 overflow-y-auto flex-1 pr-1">
          {/* Public Link & Export Row - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2">
            <div className="flex-1 flex items-center justify-between p-3 sm:p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[48px] sm:min-h-0">
              <div className="flex items-center gap-2.5 sm:gap-2">
                <Globe className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-[15px] sm:text-xs font-medium text-gray-900 dark:text-white">Public link</span>
              </div>
              <Switch
                checked={publicLinkEnabled}
                onCheckedChange={(checked) => togglePublicLinkMutation.mutate(checked)}
                disabled={togglePublicLinkMutation.isPending}
                className="scale-90 sm:scale-75"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-12 sm:h-8 gap-2 sm:gap-1 text-[15px] sm:text-xs w-full sm:w-auto justify-center font-medium"
                  disabled={isExporting}
                >
                  {isExporting ? <Loader2 className="h-4 w-4 sm:h-3 sm:w-3 animate-spin" /> : <Download className="h-4 w-4 sm:h-3 sm:w-3" />}
                  Export
                  <ChevronDown className="h-3.5 w-3.5 sm:h-2.5 sm:w-2.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 sm:w-36">
                <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2.5 sm:gap-2 text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                  <FileText className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-red-500 flex-shrink-0" /> PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("word")} className="gap-2.5 sm:gap-2 text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                  <FileSpreadsheet className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-blue-600 flex-shrink-0" /> Word
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("rtf")} className="gap-2.5 sm:gap-2 text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                  <FileType className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-purple-500 flex-shrink-0" /> RTF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("html")} className="gap-2.5 sm:gap-2 text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                  <FileCode className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-orange-500 flex-shrink-0" /> HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("markdown")} className="gap-2.5 sm:gap-2 text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                  <FileCode className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-teal-500 flex-shrink-0" /> Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("text")} className="gap-2.5 sm:gap-2 text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                  <File className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-gray-500 flex-shrink-0" /> Text
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("json")} className="gap-2.5 sm:gap-2 text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                  <FileJson className="h-5 w-5 sm:h-3.5 sm:w-3.5 text-yellow-600 flex-shrink-0" /> JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Public link URL */}
          {publicLinkEnabled && publicLink && (
            <div className="flex items-center gap-2">
              <Input
                value={publicLink}
                readOnly
                className="text-xs sm:text-xs h-11 sm:h-7 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400"
              />
              <Button
                size="sm"
                variant={linkCopied ? "default" : "outline"}
                onClick={copyPublicLink}
                className={`h-11 sm:h-7 px-3 sm:px-2 flex-shrink-0 transition-all ${linkCopied ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
              >
                {linkCopied ? (
                  <>
                    <Check className="h-4 w-4 sm:h-3 sm:w-3 sm:mr-1" />
                    <span className="hidden sm:inline text-xs">Copied!</span>
                  </>
                ) : (
                  <Copy className="h-4 w-4 sm:h-3 sm:w-3" />
                )}
              </Button>
            </div>
          )}

          {/* Search section */}
          <div className="space-y-2.5 sm:space-y-2">
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-1.5">
              <div className="relative flex-1 order-1 sm:order-1" ref={searchDropdownRef}>
                <Search className="absolute left-3 sm:left-2 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-3 sm:w-3 text-gray-400 pointer-events-none z-10" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedUser(null);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="pl-10 sm:pl-7 pr-10 sm:pr-7 h-12 sm:h-7 text-[15px] sm:text-xs"
                />
                {/* Clear button */}
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedUser(null);
                      setShowSearchResults(false);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 sm:right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  >
                    <X className="h-3.5 w-3.5 sm:h-3 sm:w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                )}

                {/* Search results dropdown */}
                {showSearchResults && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-md shadow-lg z-50 max-h-48 sm:max-h-32 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 sm:p-2 text-center text-sm sm:text-xs text-gray-500">
                        <Loader2 className="h-4 w-4 sm:h-3 sm:w-3 animate-spin inline mr-1" />
                        Searching...
                      </div>
                    ) : availableUsers.length === 0 ? (
                      <div className="p-4 sm:p-3 text-center">
                        <p className="text-sm sm:text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {searchResults.length > 0 ? "All users already have access" : "No users found"}
                        </p>
                        {searchResults.length === 0 && (
                          <p className="text-xs sm:text-[10px] text-gray-400 dark:text-gray-500">
                            Try searching by name or email
                          </p>
                        )}
                      </div>
                    ) : (
                      availableUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          className="w-full flex items-center gap-2.5 sm:gap-2 p-3 sm:p-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-left active:bg-gray-100 dark:active:bg-gray-600"
                        >
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt={user.displayName} className="w-8 h-8 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm sm:text-xs flex-shrink-0">
                              {user.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-xs font-medium text-gray-900 dark:text-white truncate">{user.displayName}</p>
                            <p className="text-xs sm:text-[10px] text-gray-500 truncate">{user.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Select value={permission} onValueChange={(val: PermissionType) => setPermission(val)}>
                <SelectTrigger className="w-full sm:w-[100px] h-12 sm:h-7 text-[15px] sm:text-xs order-2 sm:order-2 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end" className="min-w-[160px] sm:min-w-[140px]">
                  <SelectItem value="view" className="text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                    Can view
                  </SelectItem>
                  <SelectItem value="edit" className="text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                    Can edit
                  </SelectItem>
                  <SelectItem value="comment" className="text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                    Can comment
                  </SelectItem>
                  <SelectItem value="edit_comment" className="text-[15px] sm:text-xs py-3 sm:py-2 cursor-pointer">
                    Edit & comment
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selected user preview */}
            {selectedUser && (
              <div className="flex items-center justify-between p-3 sm:p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg sm:rounded-md">
                <div className="flex items-center gap-2.5 sm:gap-1.5 flex-1 min-w-0 mr-2">
                  {selectedUser.profilePicture ? (
                    <img src={selectedUser.profilePicture} alt={selectedUser.displayName} className="w-8 h-8 sm:w-5 sm:h-5 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 sm:w-5 sm:h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm sm:text-[10px] flex-shrink-0">
                      {selectedUser.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[15px] sm:text-xs font-medium text-gray-900 dark:text-white truncate">{selectedUser.displayName}</span>
                </div>
                <Button size="sm" onClick={handleShare} disabled={shareMutation.isPending} className="h-10 sm:h-6 text-[15px] sm:text-xs px-4 sm:px-2 flex-shrink-0 font-medium">
                  {shareMutation.isPending ? <Loader2 className="h-4 w-4 sm:h-3 sm:w-3 animate-spin" /> : <><Check className="h-4 w-4 sm:h-3 sm:w-3 mr-1.5 sm:mr-0.5" />Share</>}
                </Button>
              </div>
            )}
          </div>

          {/* Owner section */}
          <div>
            <p className="text-xs sm:text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-1 font-medium uppercase tracking-wide">Owner</p>
            <div className="flex items-center gap-2.5 sm:gap-2 p-2.5 sm:p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-md">
              {document.owner?.profilePicture ? (
                <img src={document.owner.profilePicture} alt={document.owner.displayName} className="w-8 h-8 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm sm:text-xs flex-shrink-0">
                  {document.owner?.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-xs font-medium text-gray-900 dark:text-white truncate">{document.owner?.displayName || 'Unknown'}</p>
              </div>
              <span className="text-xs sm:text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 sm:px-1.5 py-1 sm:py-0.5 rounded font-medium flex-shrink-0">Owner</span>
            </div>
          </div>

          {/* Shared with section */}
          {isLoadingShares ? (
            <div>
              <p className="text-xs sm:text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-1 font-medium uppercase tracking-wide">Shared with</p>
              <div className="space-y-1.5 sm:space-y-1">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 sm:gap-2 p-2.5 sm:p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-md animate-pulse">
                    <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="h-3 sm:h-2.5 bg-gray-200 dark:bg-gray-600 rounded w-24" />
                    </div>
                    <div className="w-20 sm:w-[80px] h-8 sm:h-6 bg-gray-200 dark:bg-gray-600 rounded flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ) : shares.length > 0 ? (
            <div>
              <p className="text-xs sm:text-[10px] text-gray-500 dark:text-gray-400 mb-1.5 sm:mb-1 font-medium uppercase tracking-wide">Shared with ({shares.length})</p>
              <div className="space-y-1.5 sm:space-y-1 max-h-40 sm:max-h-28 overflow-y-auto">
                {shares.map((share, index) => (
                  <div
                    key={share.id}
                    className="flex items-center gap-2.5 sm:gap-2 p-2.5 sm:p-1.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-md group animate-in fade-in slide-in-from-top-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {share.user?.profilePicture ? (
                      <img src={share.user.profilePicture} alt={share.user.displayName} className="w-8 h-8 sm:w-6 sm:h-6 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-sm sm:text-xs flex-shrink-0">
                        {share.user?.displayName?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-xs font-medium text-gray-900 dark:text-white truncate">{share.user?.displayName || 'Unknown'}</p>
                    </div>
                    <Select
                      value={share.permission}
                      onValueChange={(val: PermissionType) => {
                        updatePermissionMutation.mutate({ userId: share.userId, permission: val });
                      }}
                    >
                      <SelectTrigger className="w-24 sm:w-20 h-9 sm:h-7 text-xs flex-shrink-0 transition-all hover:border-blue-400 dark:hover:border-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end" className="min-w-[140px]">
                        <SelectItem value="view" className="text-sm sm:text-xs py-2.5 sm:py-2 cursor-pointer">
                          Can view
                        </SelectItem>
                        <SelectItem value="edit" className="text-sm sm:text-xs py-2.5 sm:py-2 cursor-pointer">
                          Can edit
                        </SelectItem>
                        <SelectItem value="comment" className="text-sm sm:text-xs py-2.5 sm:py-2 cursor-pointer">
                          Can comment
                        </SelectItem>
                        <SelectItem value="edit_comment" className="text-sm sm:text-xs py-2.5 sm:py-2 cursor-pointer">
                          Edit & comment
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => removeShareMutation.mutate(share.userId)}
                      className="p-1.5 sm:p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 sm:py-2 text-sm sm:text-xs text-gray-500 dark:text-gray-400">
              Not shared with anyone yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
