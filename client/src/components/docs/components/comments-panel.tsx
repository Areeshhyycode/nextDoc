import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Check, X, RotateCcw, ChevronRight, Edit2, Trash2, Send } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { DocumentComment, User } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { MentionDropdown } from "./mention-dropdown";

interface CommentsPanelProps {
  documentId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSaveDocument?: () => Promise<string>;
}

export function CommentsPanel({ documentId, isOpen, onToggle, onSaveDocument }: CommentsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState<'open' | 'assigned' | 'resolved'>('open');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionSearchQuery, setMentionSearchQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionStartIndex, setMentionStartIndex] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_COMMENT_LENGTH = 5000;

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

  const handleEditComment = (comment: DocumentComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content || "");
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
          
          // Calculate available space
          const dropdownHeight = 250; // Approximate max height
          const spaceBelow = window.innerHeight - textAreaRect.bottom;
          const spaceAbove = textAreaRect.top;
          
          // Position above if not enough space below
          let topPosition: number;
          if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
            topPosition = textAreaRect.top - dropdownHeight - 10;
          } else {
            topPosition = textAreaRect.bottom + 5;
          }
          
          const leftPosition = textAreaRect.left + 10;
          
          setMentionPosition({
            top: Math.max(10, topPosition), // Ensure minimum 10px from top
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

  // Filter comments based on active tab
  const filteredComments = comments.filter(comment => {
    if (activeTab === 'open') return comment.status === 'open';
    if (activeTab === 'resolved') return comment.status === 'resolved';
    if (activeTab === 'assigned') {
      return comment.mentionedUserIds?.includes(user?.id || '') && comment.status === 'open';
    }
    return true;
  });

  const CommentItem = ({ comment }: { comment: DocumentComment }) => {
    const commentUser = getUserById(comment.userId);
    const isResolved = comment.status === 'resolved';
    const isEditing = editingCommentId === comment.id;
    const isOwner = comment.userId === user?.id;

    // Generate consistent avatar color
    const getAvatarColor = (userId: string) => {
      const colors = [
        'from-purple-600 to-purple-400',
        'from-blue-600 to-blue-400',
        'from-red-600 to-red-400',
        'from-green-600 to-green-400',
        'from-cyan-600 to-cyan-400',
        'from-orange-600 to-orange-400',
        'from-pink-600 to-pink-400',
        'from-indigo-600 to-indigo-400',
      ];
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    return (
      <div
        className={cn(
          "p-3 rounded-lg border transition-all",
          isResolved
            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/50'
            : 'bg-white dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'
        )}
        data-testid={`comment-${comment.id}`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-xs font-semibold flex-shrink-0",
              getAvatarColor(comment.userId)
            )}>
              {commentUser?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {commentUser?.displayName || 'Unknown'}
                {isOwner && <span className="ml-1.5 text-xs text-gray-500 dark:text-gray-400">(You)</span>}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, h:mm a') : 'Just now'}
                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                  <span className="ml-1">(edited)</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isResolved ? (
              <>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Check className="h-3 w-3" />
                  Resolved
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateCommentMutation.mutate({ commentId: comment.id, status: 'open' })}
                  className="h-7 w-7 p-0"
                  title="Reopen"
                  data-testid={`button-reopen-${comment.id}`}
                >
                  <RotateCcw className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateCommentMutation.mutate({ commentId: comment.id, status: 'resolved' })}
                className="h-7 w-7 p-0"
                title="Resolve"
                data-testid={`button-resolve-${comment.id}`}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
            )}
            {isOwner && !isResolved && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditComment(comment)}
                  className="h-7 w-7 p-0"
                  title="Edit"
                  data-testid={`button-edit-${comment.id}`}
                >
                  <Edit2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="h-7 w-7 p-0"
                  title="Delete"
                  data-testid={`button-delete-${comment.id}`}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                </Button>
              </>
            )}
          </div>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={editTextareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px] resize-none"
              maxLength={MAX_COMMENT_LENGTH}
            />
            <div className="flex items-center justify-between">
              <span className={cn(
                "text-xs",
                editContent.length > MAX_COMMENT_LENGTH * 0.9
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {editContent.length}/{MAX_COMMENT_LENGTH}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={editCommentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSaveEdit(comment.id)}
                  disabled={!editContent.trim() || editContent.length > MAX_COMMENT_LENGTH || editCommentMutation.isPending}
                >
                  {editCommentMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
              {comment.content}
            </p>
            {comment.mentionedUserIds && comment.mentionedUserIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {comment.mentionedUserIds.map(userId => {
                  const mentionedUser = getUserById(userId);
                  return mentionedUser ? (
                    <span
                      key={userId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                    >
                      @{mentionedUser.displayName}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 h-full w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0 z-50" : "translate-x-full pointer-events-none z-10"
    )}
    data-testid="comments-panel"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between relative">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
          <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
            {comments.filter(c => c.status === 'open').length}
          </span>
        </h3>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          data-testid="button-close-comments"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger 
            value="open" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            data-testid="tab-open-comments"
          >
            Open
            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
              {comments.filter(c => c.status === 'open').length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="assigned" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            data-testid="tab-assigned-comments"
          >
            Assigned to me
            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
              {comments.filter(c => c.mentionedUserIds?.includes(user?.id || '') && c.status === 'open').length}
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="resolved" 
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            data-testid="tab-resolved-comments"
          >
            Resolved
            <span className="ml-2 px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-full">
              {comments.filter(c => c.status === 'resolved').length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-4 space-y-3 m-0">
          {filteredComments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No comments on this page!</p>
              <p className="text-xs mt-1">Be the first to add a comment</p>
            </div>
          ) : (
            filteredComments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Add Comment */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 relative">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <Textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleCommentChange}
            placeholder="Add a comment... Use @ to mention someone"
            className="border-0 focus-visible:ring-0 min-h-[80px] max-h-[200px] resize-none bg-transparent"
            maxLength={MAX_COMMENT_LENGTH}
            data-testid="textarea-new-comment"
          />
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Use @ to mention
              </span>
              <span className={cn(
                "text-xs font-medium",
                newComment.length > MAX_COMMENT_LENGTH * 0.9
                  ? "text-red-600 dark:text-red-400"
                  : newComment.length > MAX_COMMENT_LENGTH * 0.75
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-500 dark:text-gray-400"
              )}>
                {newComment.length}/{MAX_COMMENT_LENGTH}
              </span>
            </div>
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || newComment.length > MAX_COMMENT_LENGTH || isAddingComment}
              size="sm"
              className="gap-1.5"
              data-testid="button-add-comment"
            >
              {isAddingComment ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mention Dropdown - Rendered via Portal to avoid clipping */}
      {createPortal(
        <MentionDropdown
          users={users}
          isOpen={showMentionDropdown}
          position={mentionPosition}
          searchQuery={mentionSearchQuery}
          onSelect={handleMentionSelect}
          onClose={() => setShowMentionDropdown(false)}
        />,
        document.body
      )}
    </div>
  );
}
