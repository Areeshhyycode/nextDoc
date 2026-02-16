import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Check, X, RotateCcw, ChevronDown, Edit2, Trash2, Send, MoreHorizontal, AtSign } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DocumentComment, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";
import { MentionDropdown } from "./mention-dropdown";

interface CommentsPanelProps {
  documentId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSaveDocument?: () => Promise<string>;
  userPermission?: "owner" | "view" | "edit" | "comment" | "edit_comment" | null;
}

export function CommentsPanel({ documentId, isOpen, onToggle, onSaveDocument, userPermission }: CommentsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<'open' | 'assigned' | 'resolved'>('open');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedActions, setExpandedActions] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_COMMENT_LENGTH = 5000;

  // Permission: can the user add/interact with comments?
  // Only owner, comment, and edit_comment can add comments.
  // "view" and "edit" only users can only read comments.
  const canComment = !userPermission || userPermission === "owner" || userPermission === "comment" || userPermission === "edit_comment";
  const isViewOnly = userPermission === "view";
  const isEditOnly = userPermission === "edit";

  const { data: comments = [] } = useQuery<DocumentComment[]>({
    queryKey: ["/api/docs", documentId, "comments"],
    enabled: !!documentId,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const [isAddingComment, setIsAddingComment] = useState(false);

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, status }: { commentId: string; status: 'open' | 'resolved' }) => {
      return await apiRequest("PUT", `/api/docs/${documentId}/comments/${commentId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs", documentId, "comments"] });
      toast({ title: "Comment updated" });
    },
    onError: () => {
      toast({ title: "Failed to update comment", variant: "destructive" });
    },
  });

  const editCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      return await apiRequest("PUT", `/api/docs/${documentId}/comments/${commentId}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs", documentId, "comments"] });
      setEditingCommentId(null);
      setEditContent("");
      toast({ title: "Comment updated successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update comment",
        description: error?.message || "Please try again",
        variant: "destructive"
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiRequest("DELETE", `/api/docs/${documentId}/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs", documentId, "comments"] });
      toast({ title: "Comment deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    },
  });

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newComment]);

  useEffect(() => {
    if (editTextareaRef.current) {
      editTextareaRef.current.style.height = 'auto';
      editTextareaRef.current.style.height = editTextareaRef.current.scrollHeight + 'px';
    }
  }, [editContent]);

  // Close expanded actions when clicking outside
  useEffect(() => {
    if (!expandedActions) return;
    const handleClick = () => setExpandedActions(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [expandedActions]);

  const handleEditComment = (comment: DocumentComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content || "");
    setExpandedActions(null);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim() || editContent.length > MAX_COMMENT_LENGTH) return;
    editCommentMutation.mutate({ commentId, content: editContent });
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
    setExpandedActions(null);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsAddingComment(true);
    let targetDocId = documentId;

    if (!documentId && onSaveDocument) {
      try {
        targetDocId = await onSaveDocument();
      } catch (error) {
        toast({ title: "Failed to save document", variant: "destructive" });
        setIsAddingComment(false);
        return;
      }
    }

    if (!targetDocId) {
      setIsAddingComment(false);
      return;
    }

    const mentionedUserIds: string[] = [];
    const mentionMatches = newComment.match(/@(\w+)/g);
    if (mentionMatches) {
      mentionMatches.forEach(match => {
        const username = match.substring(1);
        const mentionedUser = users.find(u =>
          u.displayName.toLowerCase().includes(username.toLowerCase()) ||
          u.email.toLowerCase().includes(username.toLowerCase())
        );
        if (mentionedUser) mentionedUserIds.push(mentionedUser.id);
      });
    }

    try {
      await apiRequest("POST", `/api/docs/${targetDocId}/comments`, {
        content: newComment,
        mentionedUserIds,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/docs", targetDocId, "comments"] });
      setNewComment("");
      toast({ title: "Comment added" });
    } catch (error) {
      toast({ title: "Failed to add comment", variant: "destructive" });
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setNewComment(value);

    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);

      if (!textAfterAt.includes(" ") && textAfterAt.length <= 30) {
        setMentionSearchQuery(textAfterAt);
        setMentionStartIndex(lastAtIndex);
        setShowMentionDropdown(true);

        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const textAreaRect = textarea.getBoundingClientRect();

          const dropdownHeight = 250;
          const spaceBelow = window.innerHeight - textAreaRect.bottom;
          const spaceAbove = textAreaRect.top;

          let topPosition: number;
          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            topPosition = textAreaRect.top - dropdownHeight - 10;
          } else {
            topPosition = textAreaRect.bottom + 5;
          }

          const leftPosition = textAreaRect.left + 10;

          setMentionPosition({
            top: Math.max(10, topPosition),
            left: leftPosition,
          });
        }
      } else {
        setShowMentionDropdown(false);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  const handleMentionSelect = (selectedUser: User) => {
    const beforeMention = newComment.slice(0, mentionStartIndex);
    const afterMention = newComment.slice(mentionStartIndex + mentionSearchQuery.length + 1);
    const mention = `@${selectedUser.displayName}`;

    setNewComment(beforeMention + mention + " " + afterMention);
    setShowMentionDropdown(false);

    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + mention.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Smart date formatting
  const formatCommentDate = (date: Date) => {
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  // Filter comments based on active tab
  const filteredComments = comments.filter(comment => {
    if (activeTab === 'open') return comment.status === 'open';
    if (activeTab === 'resolved') return comment.status === 'resolved';
    if (activeTab === 'assigned') {
      return comment.mentionedUserIds?.includes(user?.id || '') && comment.status === 'open';
    }
    return true;
  });

  // Close panel on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onToggle();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onToggle]);

  const openCount = comments.filter(c => c.status === 'open').length;
  const assignedCount = comments.filter(c => c.mentionedUserIds?.includes(user?.id || '') && c.status === 'open').length;
  const resolvedCount = comments.filter(c => c.status === 'resolved').length;

  // Avatar color palette — refined, muted tones
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
      'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-teal-500',
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const tabs = [
    { key: 'open' as const, label: 'Open', count: openCount },
    { key: 'assigned' as const, label: 'Assigned', labelFull: 'Assigned to me', count: assignedCount },
    { key: 'resolved' as const, label: 'Resolved', count: resolvedCount },
  ];

  const CommentItem = ({ comment }: { comment: DocumentComment }) => {
    const commentUser = getUserById(comment.userId);
    const isResolved = comment.status === 'resolved';
    const isEditing = editingCommentId === comment.id;
    const isOwner = comment.userId === user?.id;
    const showActions = expandedActions === comment.id;

    return (
      <div
        className={cn(
          "group relative rounded-xl transition-all duration-200",
          isResolved
            ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30'
            : 'bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600/60 hover:shadow-sm'
        )}
        data-testid={`comment-${comment.id}`}
      >
        {/* Comment header */}
        <div className="flex items-center gap-2.5 px-3.5 pt-3.5 sm:px-4 sm:pt-4">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm",
            getAvatarColor(comment.userId)
          )}>
            {commentUser?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate">
                {commentUser?.displayName || 'Unknown'}
              </span>
              {isOwner && (
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">you</span>
              )}
              {isResolved && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-md">
                  <Check className="h-2.5 w-2.5" />
                  Resolved
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
              {comment.createdAt ? formatCommentDate(new Date(comment.createdAt)) : 'Just now'}
              {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                <span className="ml-1 italic">edited</span>
              )}
            </p>
          </div>

          {/* Actions — hover-reveal on desktop, 3-dot menu on mobile */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {isResolved ? (
              canComment && (
                <button
                  onClick={() => updateCommentMutation.mutate({ commentId: comment.id, status: 'open' })}
                  className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Reopen"
                  data-testid={`button-reopen-${comment.id}`}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              )
            ) : (
              <>
                {canComment && (
                  <button
                    onClick={() => updateCommentMutation.mutate({ commentId: comment.id, status: 'resolved' })}
                    className="p-1.5 rounded-md text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Resolve"
                    data-testid={`button-resolve-${comment.id}`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                {isOwner && (
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpandedActions(showActions ? null : comment.id); }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </button>
                    {/* Dropdown menu */}
                    {showActions && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                          data-testid={`button-edit-${comment.id}`}
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          data-testid={`button-delete-${comment.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Comment body */}
        <div className="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] resize-none text-[13px] rounded-lg border-gray-200 dark:border-gray-600 focus:border-teal-400"
                maxLength={MAX_COMMENT_LENGTH}
              />
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[10px] tabular-nums",
                  editContent.length > MAX_COMMENT_LENGTH * 0.9
                    ? "text-red-500"
                    : "text-gray-400"
                )}>
                  {editContent.length}/{MAX_COMMENT_LENGTH}
                </span>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={editCommentMutation.isPending}
                    className="h-7 text-xs px-2.5 text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(comment.id)}
                    disabled={!editContent.trim() || editContent.length > MAX_COMMENT_LENGTH || editCommentMutation.isPending}
                    className="h-7 text-xs px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-md"
                  >
                    {editCommentMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words leading-[1.6]">
                {comment.content}
              </p>
              {comment.mentionedUserIds && comment.mentionedUserIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {comment.mentionedUserIds.map(userId => {
                    const mentionedUser = getUserById(userId);
                    return mentionedUser ? (
                      <span
                        key={userId}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-50 dark:bg-teal-900/25 text-teal-600 dark:text-teal-400 text-[11px] font-medium rounded-md"
                      >
                        <AtSign className="h-2.5 w-2.5" />
                        {mentionedUser.displayName}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[55] transition-opacity duration-300 md:hidden",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onToggle}
        />
      )}

      <div className={cn(
        "fixed flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        // Mobile: full-screen overlay
        "inset-0 z-[60] md:z-50",
        // Desktop: right sidebar
        "md:right-0 md:top-0 md:left-auto md:bottom-auto md:h-full md:w-[380px]",
        // Surface
        "bg-gray-50 dark:bg-gray-900 md:bg-white md:dark:bg-gray-850 md:border-l md:border-gray-200/80 md:dark:border-gray-700/60 md:shadow-xl",
        // Animations
        isOpen
          ? "translate-y-0 md:translate-y-0 md:translate-x-0 opacity-100"
          : "translate-y-full md:translate-y-0 md:translate-x-full pointer-events-none opacity-0 md:opacity-100"
      )}
      data-testid="comments-panel"
      >
        {/* ─── Header ─── */}
        <div className="bg-white dark:bg-gray-800 md:bg-transparent md:dark:bg-transparent">
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-2.5 pb-0 md:hidden">
            <div className="w-9 h-[3px] rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30">
                <MessageSquare className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
                  Comments
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                  {openCount} open{resolvedCount > 0 && <> &middot; {resolvedCount} resolved</>}
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all"
              data-testid="button-close-comments"
            >
              <ChevronDown className="h-5 w-5 md:hidden" />
              <X className="h-4 w-4 hidden md:block" />
            </button>
          </div>

          {/* ─── Tab bar ─── */}
          <div className="px-4 sm:px-5 flex gap-0.5 border-b border-gray-200/80 dark:border-gray-700/50">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "relative pb-2.5 pt-1 px-3 text-[12px] font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.key
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
                data-testid={`tab-${tab.key}-comments`}
              >
                <span className="hidden sm:inline">{tab.labelFull || tab.label}</span>
                <span className="sm:hidden">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    "ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full tabular-nums min-w-[18px] inline-flex items-center justify-center",
                    activeTab === tab.key
                      ? "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  )}>
                    {tab.count}
                  </span>
                )}
                {/* Active indicator line */}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-1 right-1 h-[2px] bg-teal-600 dark:bg-teal-400 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Comment list ─── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-2.5">
          {filteredComments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
                {activeTab === 'open' && 'No open comments'}
                {activeTab === 'assigned' && 'No comments assigned to you'}
                {activeTab === 'resolved' && 'No resolved comments'}
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
                {activeTab === 'open' ? 'Start a conversation below' : 'Comments will appear here'}
              </p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </div>

        {/* ─── Compose area ─── */}
        {canComment ? (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200/80 dark:border-gray-700/50 p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 focus-within:border-teal-400 dark:focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-100 dark:focus-within:ring-teal-900/30 transition-all overflow-hidden">
              <Textarea
                ref={textareaRef}
                value={newComment}
                onChange={handleCommentChange}
                placeholder="Write a comment..."
                className="border-0 focus-visible:ring-0 min-h-[52px] sm:min-h-[68px] max-h-[120px] sm:max-h-[180px] resize-none bg-transparent text-[13px] placeholder:text-gray-400 dark:placeholder:text-gray-500 px-3.5 py-2.5"
                maxLength={MAX_COMMENT_LENGTH}
                data-testid="textarea-new-comment"
              />
              <div className="px-3 py-2 flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-gray-900/30">
                <div className="flex items-center gap-2">
                  <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <AtSign className="h-3 w-3" />
                    mention
                  </span>
                  <span className={cn(
                    "text-[10px] tabular-nums font-medium",
                    newComment.length > MAX_COMMENT_LENGTH * 0.9
                      ? "text-red-500"
                      : newComment.length > MAX_COMMENT_LENGTH * 0.75
                      ? "text-amber-500"
                      : "text-gray-400 dark:text-gray-500"
                  )}>
                    {newComment.length > 0 && `${newComment.length}/${MAX_COMMENT_LENGTH}`}
                  </span>
                </div>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || newComment.length > MAX_COMMENT_LENGTH || isAddingComment}
                  size="sm"
                  className={cn(
                    "h-7 sm:h-8 px-3 sm:px-4 text-xs font-medium rounded-lg gap-1.5 transition-all",
                    "bg-teal-600 hover:bg-teal-700 text-white shadow-sm",
                    "disabled:bg-gray-200 disabled:dark:bg-gray-700 disabled:text-gray-400 disabled:dark:text-gray-500 disabled:shadow-none"
                  )}
                  data-testid="button-add-comment"
                >
                  {isAddingComment ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending
                    </span>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border-t border-gray-200/80 dark:border-gray-700/50 p-3 sm:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-4">
            <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/40 bg-gray-50 dark:bg-gray-800/40 px-4 py-3 text-center">
              <p className="text-[12px] text-gray-400 dark:text-gray-500">
                {isViewOnly
                  ? "You have view-only access. Commenting is disabled."
                  : "You have edit-only access. Commenting is disabled."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mention Dropdown - Rendered via Portal */}
      {createPortal(
        <MentionDropdown
          users={users}
          isOpen={showMentionDropdown}
          position={mentionPosition}
          searchQuery={mentionSearchQuery}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentionDropdown(false)}
          isMobile={isMobile}
        />,
        document.body
      )}
    </>
  );
}
