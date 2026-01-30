/**
 * Share Document Modal - ClickUp Style
 *
 * Clean, modern document sharing modal with:
 * - Public link toggle
 * - Export dropdown
 * - User search with inline permissions
 * - Owner and shared users sections
 */

import { useState, useEffect, useRef, useDeferredValue, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
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
import {
  Users,
  Search,
  Trash2,
  Check,
  Loader2,
  Globe,
  Copy,
  Download,
  FileText,
  FileCode,
  FileType,
  FileSpreadsheet,
  File,
  ChevronDown,
  X,
} from "lucide-react";
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

interface PublicLinkResponse {
  publicLinkEnabled: boolean;
  publicLinkToken: string | null;
  publicLinkExpiresAt: string | null;
  publicLinkCreatedAt: string | null;
  publicLinkUrl: string | null;
}

const PERMISSION_CONFIG: Record<PermissionType, { label: string; shortLabel: string }> = {
  view: { label: "Can view", shortLabel: "Can view" },
  edit: { label: "Can edit", shortLabel: "Can edit" },
  comment: { label: "Can comment", shortLabel: "Can comment" },
  edit_comment: { label: "Edit & comment", shortLabel: "Edit & comment" },
};

// Avatar colors for users without profile pictures
const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
];

function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function ShareDocumentModal({ isOpen, onClose, document: doc }: ShareDocumentModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [permission, setPermission] = useState<PermissionType>("view");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Search users
  const { data: searchResults = [], isLoading: isSearching } = useQuery<UserSearchResult[]>({
    queryKey: ["/api/users/search", deferredSearchQuery],
    queryFn: async () => {
      if (deferredSearchQuery.length < 2) return [];
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(deferredSearchQuery)}`, {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to search users");
      return response.json();
    },
    enabled: deferredSearchQuery.length >= 2,
    staleTime: 30_000,
  });

  // Get existing shares
  const { data: shares = [], isLoading: isLoadingShares } = useQuery<DocumentShare[]>({
    queryKey: [`/api/docs/${doc.id}/shares`],
    enabled: isOpen,
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async (data: { userId: string; permission: string }) => {
      return apiRequest("POST", `/api/docs/${doc.id}/shares`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${doc.id}/shares`] });
      queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
      setSearchQuery("");
      setShowSearchResults(false);
      toast({ title: "Shared successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to share", description: error.message, variant: "destructive" });
    },
  });

  // Update permission
  const updatePermissionMutation = useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: string }) => {
      return apiRequest("PATCH", `/api/docs/${doc.id}/shares/${userId}`, { permission });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${doc.id}/shares`] });
      toast({ title: "Permission updated" });
    },
  });

  // Remove share
  const removeShareMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest("DELETE", `/api/docs/${doc.id}/shares/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/docs/${doc.id}/shares`] });
      queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
      toast({ title: "Access removed" });
    },
  });

  // Public link state
  const [publicLinkEnabled, setPublicLinkEnabled] = useState(doc.publicLinkEnabled || false);
  const [publicLinkToken, setPublicLinkToken] = useState(doc.publicLinkToken || "");

  useEffect(() => {
    setPublicLinkEnabled(doc.publicLinkEnabled || false);
    setPublicLinkToken(doc.publicLinkToken || "");
  }, [doc.publicLinkEnabled, doc.publicLinkToken]);

  // Toggle public link
  const togglePublicLinkMutation = useMutation({
    mutationFn: async (enabled: boolean): Promise<PublicLinkResponse> => {
      const response = await apiRequest("PATCH", `/api/docs/${doc.id}/public-link`, { enabled });
      return response.json();
    },
    onSuccess: (data) => {
      setPublicLinkEnabled(data.publicLinkEnabled);
      setPublicLinkToken(data.publicLinkToken || "");
      queryClient.invalidateQueries({ queryKey: ['docs', 'list'] });
      toast({
        title: data.publicLinkEnabled ? "Public link enabled" : "Public link disabled",
      });
    },
  });

  const publicLink = publicLinkToken ? `${window.location.origin}/public/docs/${publicLinkToken}` : "";

  const copyPublicLink = () => {
    navigator.clipboard.writeText(publicLink);
    setLinkCopied(true);
    toast({ title: "Link copied!" });
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Export
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      let content = doc.content || "";
      if (!content) {
        const response = await fetch(`/api/docs/${doc.id}`, { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch document");
        const fullDoc = await response.json();
        content = fullDoc.content || "";
      }
      exportDocument(format, doc.title || "Untitled", content, {
        author: doc.owner?.displayName,
        createdAt: doc.createdAt?.toString(),
      });
      toast({ title: `Exported as ${format.toUpperCase()}` });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Filter users
  const alreadySharedIds = shares.map(s => s.userId);
  const availableUsers = searchResults.filter(
    user => !alreadySharedIds.includes(user.id) && user.id !== doc.owner?.id
  );

  // Handle user selection
  const handleSelectUser = (user: UserSearchResult) => {
    shareMutation.mutate({ userId: user.id, permission });
  };

  // Keyboard navigation
  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchResults || availableUsers.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex(prev => prev < availableUsers.length - 1 ? prev + 1 : 0);
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : availableUsers.length - 1);
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && availableUsers[highlightedIndex]) {
          handleSelectUser(availableUsers[highlightedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setShowSearchResults(false);
        break;
    }
  }, [showSearchResults, availableUsers, highlightedIndex, permission]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [searchResults]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    if (showSearchResults || exportDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSearchResults, exportDropdownOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
      setShowSearchResults(false);
      setLinkCopied(false);
      setHighlightedIndex(-1);
      setExportDropdownOpen(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[440px] max-w-[calc(100vw-2rem)] p-0 gap-0 overflow-hidden bg-[#1e1e1e] border-[#333] rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-[15px] font-semibold text-white">
              Share "{doc.title}"
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#333] rounded-md transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Public Link Toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-[#2a2a2a] rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-white">Public link</span>
            </div>
            <Switch
              checked={publicLinkEnabled}
              onCheckedChange={(checked) => togglePublicLinkMutation.mutate(checked)}
              disabled={togglePublicLinkMutation.isPending}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          {/* Public Link URL (shown when enabled) */}
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

          {/* Export Button */}
          <div className="flex justify-end relative" ref={exportDropdownRef}>
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              disabled={isExporting}
              className="flex items-center gap-2 h-9 px-3 text-sm bg-[#2a2a2a] border border-[#444] text-white rounded-md hover:bg-[#333] disabled:opacity-50 transition-colors"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
              <ChevronDown className={`h-3 w-3 transition-transform ${exportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportDropdownOpen && (
              <div className="absolute top-full right-0 mt-1.5 w-48 bg-[#252525] border border-[#3a3a3a] rounded-lg shadow-xl z-50" style={{ maxHeight: '96px', overflowY: 'auto' }}>
                {[
                  { format: "docx" as ExportFormat, label: "Word Document", ext: ".docx", Icon: FileSpreadsheet, color: "text-blue-400" },
                  { format: "docm" as ExportFormat, label: "Word Macro Doc", ext: ".docm", Icon: FileSpreadsheet, color: "text-blue-400" },
                  { format: "word" as ExportFormat, label: "Word 97-2003", ext: ".doc", Icon: FileSpreadsheet, color: "text-blue-400" },
                  { format: "dotm" as ExportFormat, label: "Word Macro Tmpl", ext: ".dotm", Icon: FileSpreadsheet, color: "text-blue-400" },
                  { format: "dotx" as ExportFormat, label: "Word Template", ext: ".dotx", Icon: FileSpreadsheet, color: "text-blue-400" },
                  { format: "dot" as ExportFormat, label: "Word 97-2003 Tmpl", ext: ".dot", Icon: FileSpreadsheet, color: "text-blue-400" },
                  { format: "pdf" as ExportFormat, label: "PDF Document", ext: ".pdf", Icon: FileText, color: "text-red-400" },
                  { format: "xps" as ExportFormat, label: "XPS Document", ext: ".xps", Icon: FileText, color: "text-indigo-400" },
                  { format: "mht" as ExportFormat, label: "Single File Web", ext: ".mht", Icon: FileCode, color: "text-orange-400" },
                  { format: "html" as ExportFormat, label: "Web Page", ext: ".htm", Icon: FileCode, color: "text-orange-400" },
                  { format: "rtf" as ExportFormat, label: "Rich Text Format", ext: ".rtf", Icon: FileType, color: "text-purple-400" },
                  { format: "text" as ExportFormat, label: "Plain Text", ext: ".txt", Icon: File, color: "text-gray-400" },
                  { format: "wordxml" as ExportFormat, label: "Word XML", ext: ".xml", Icon: FileCode, color: "text-green-400" },
                  { format: "strict" as ExportFormat, label: "Strict Open XML", ext: ".docx", Icon: FileSpreadsheet, color: "text-blue-400" },
                  { format: "odt" as ExportFormat, label: "OpenDocument", ext: ".odt", Icon: FileSpreadsheet, color: "text-emerald-400" },
                ].map((item) => (
                  <button
                    key={item.format}
                    onClick={() => { handleExport(item.format); setExportDropdownOpen(false); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1 text-left hover:bg-[#333] transition-colors"
                  >
                    <item.Icon className={`h-3 w-3 ${item.color} flex-shrink-0`} />
                    <span className="text-[11px] text-gray-300 truncate flex-1">{item.label}</span>
                    <span className="text-[9px] text-gray-600 flex-shrink-0">{item.ext}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share with People Section */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Share with people
            </p>

            {/* Search Input with Permission Dropdown */}
            <div className="flex gap-2" ref={searchDropdownRef}>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9 h-10 bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchQuery.length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-3 text-center text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Searching...
                      </div>
                    ) : availableUsers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-400">
                        No users found
                      </div>
                    ) : (
                      availableUsers.map((user, index) => (
                        <button
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                            highlightedIndex === index ? "bg-[#333]" : "hover:bg-[#333]"
                          }`}
                        >
                          {user.profilePicture ? (
                            <img src={user.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full ${getAvatarColor(user.displayName)} flex items-center justify-center text-white text-sm font-medium`}>
                              {user.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user.displayName}</p>
                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Select value={permission} onValueChange={(val: PermissionType) => setPermission(val)}>
                <SelectTrigger className="w-[120px] h-10 bg-[#2a2a2a] border-[#444] text-white">
                  <SelectValue>{PERMISSION_CONFIG[permission].shortLabel}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#2a2a2a] border-[#444]">
                  {(Object.entries(PERMISSION_CONFIG) as [PermissionType, { label: string; shortLabel: string }][]).map(
                    ([value, { label }]) => (
                      <SelectItem key={value} value={value} className="text-white hover:bg-[#333] cursor-pointer">
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  if (availableUsers.length > 0) {
                    // If a result is highlighted, use that; otherwise use the first result
                    const userToSelect = highlightedIndex >= 0
                      ? availableUsers[highlightedIndex]
                      : availableUsers[0];
                    handleSelectUser(userToSelect);
                  }
                }}
                disabled={shareMutation.isPending || searchQuery.length < 2 || availableUsers.length === 0}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {shareMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Invite"
                )}
              </Button>
            </div>
          </div>

          {/* Owner Section */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Owner</p>
            <div className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg">
              {doc.owner?.profilePicture ? (
                <img src={doc.owner.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className={`w-9 h-9 rounded-full ${getAvatarColor(doc.owner?.displayName || 'U')} flex items-center justify-center text-white text-sm font-medium`}>
                  {doc.owner?.displayName?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{doc.owner?.displayName || 'Unknown'}</p>
              </div>
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
                Owner
              </span>
            </div>
          </div>

          {/* Shared With Section */}
          {isLoadingShares ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Shared with</p>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-[#444]" />
                    <div className="flex-1">
                      <div className="h-4 bg-[#444] rounded w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Shared with ({shares.length})
              </p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center gap-3 p-3 bg-[#2a2a2a] rounded-lg group"
                  >
                    {share.user?.profilePicture ? (
                      <img src={share.user.profilePicture} alt="" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className={`w-9 h-9 rounded-full ${getAvatarColor(share.user?.displayName || 'U')} flex items-center justify-center text-white text-sm font-medium`}>
                        {share.user?.displayName?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{share.user?.displayName || 'Unknown'}</p>
                    </div>
                    <Select
                      value={share.permission}
                      onValueChange={(val: PermissionType) => {
                        updatePermissionMutation.mutate({ userId: share.userId, permission: val });
                      }}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs bg-transparent border-[#444] text-gray-300 hover:border-[#555]">
                        <SelectValue>{PERMISSION_CONFIG[share.permission].shortLabel}</SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-[#2a2a2a] border-[#444]">
                        {(Object.entries(PERMISSION_CONFIG) as [PermissionType, { label: string; shortLabel: string }][]).map(
                          ([value, { label }]) => (
                            <SelectItem key={value} value={value} className="text-white hover:bg-[#333] cursor-pointer text-xs">
                              {label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => removeShareMutation.mutate(share.userId)}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
