import { useEffect, useRef, useState } from "react";
import { User } from "@shared/schema";
import { cn } from "@/lib/utils";
import { AtSign, Search } from "lucide-react";

interface MentionDropdownProps {
  users: User[];
  isOpen: boolean;
  position: { top: number; left: number };
  searchQuery: string;
  onSelect: (user: User) => void;
  onClose: () => void;
  isMobile?: boolean;
}

export function MentionDropdown({
  users,
  isOpen,
  position,
  searchQuery,
  onSelect,
  onClose,
  isMobile = false,
}: MentionDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredUsers.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Enter":
          e.preventDefault();
          if (filteredUsers[selectedIndex]) {
            onSelect(filteredUsers[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex, filteredUsers, onSelect, onClose]);

  if (!isOpen) return null;

  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500',
      'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-teal-500',
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Mobile: bottom sheet
  if (isMobile) {
    return (
      <>
        <div
          className="fixed inset-0 z-[70] bg-black/30"
          onClick={onClose}
        />
        <div
          ref={dropdownRef}
          className="fixed bottom-0 left-0 right-0 z-[75] bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl max-h-[50vh] overflow-y-auto"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          data-testid="mention-dropdown"
        >
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-9 h-[3px] rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 dark:border-gray-700/50">
            <Search className="h-3.5 w-3.5 text-gray-400" />
            <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
              {searchQuery ? `Searching "${searchQuery}"` : 'Mention someone'}
            </p>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="px-4 py-6 text-[13px] text-gray-400 dark:text-gray-500 text-center">
              No team members found
            </div>
          ) : (
            <div className="py-1">
              {filteredUsers.slice(0, 8).map((user, index) => (
                <button
                  key={user.id}
                  onClick={() => onSelect(user)}
                  className={cn(
                    "w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors active:bg-gray-100 dark:active:bg-gray-700",
                    index === selectedIndex ? "bg-gray-50 dark:bg-gray-700/50" : ""
                  )}
                  data-testid={`mention-option-${user.id}`}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm",
                    getAvatarColor(user.id)
                  )}>
                    {user.displayName?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[13px] font-medium text-gray-900 dark:text-gray-100 truncate block">
                      {user.displayName}
                    </span>
                    <span className="text-[11px] text-gray-400 dark:text-gray-500 truncate block">
                      {user.email}
                    </span>
                  </div>
                  <AtSign className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </>
    );
  }

  // Desktop: floating dropdown
  return (
    <div
      ref={dropdownRef}
      className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-72 overflow-y-auto z-[100]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "240px",
      }}
      data-testid="mention-dropdown"
    >
      {filteredUsers.length === 0 ? (
        <div className="px-4 py-4 text-[13px] text-gray-400 dark:text-gray-500 text-center">
          No team members found
        </div>
      ) : (
        <div className="py-1">
          {filteredUsers.slice(0, 8).map((user, index) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={cn(
                "w-full px-3 py-2 text-left transition-colors flex items-center gap-2.5",
                index === selectedIndex
                  ? "bg-teal-50 dark:bg-teal-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
              )}
              data-testid={`mention-option-${user.id}`}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm",
                getAvatarColor(user.id)
              )}>
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 truncate">
                {user.displayName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
