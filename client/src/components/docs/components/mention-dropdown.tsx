import { useEffect, useRef, useState } from "react";
import { User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MentionDropdownProps {
  users: User[];
  isOpen: boolean;
  position: { top: number; left: number };
  searchQuery: string;
  onSelect: (user: User) => void;
  onClose: () => void;
}

export function MentionDropdown({
  users,
  isOpen,
  position,
  searchQuery,
  onSelect,
  onClose,
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

  // Generate consistent colors based on user ID
  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-purple-600',
      'bg-blue-600',
      'bg-red-600',
      'bg-green-600',
      'bg-cyan-600',
      'bg-orange-600',
      'bg-pink-600',
      'bg-indigo-600',
    ];
    // Simple hash function to convert string ID to number
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div
      ref={dropdownRef}
      className="fixed bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-72 overflow-y-auto z-[100]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: "240px",
      }}
      data-testid="mention-dropdown"
    >
      {filteredUsers.length === 0 ? (
        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          No team members found
        </div>
      ) : (
        <div className="py-1">
          {filteredUsers.slice(0, 8).map((user, index) => (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={cn(
                "w-full px-3 py-2 text-left transition-colors flex items-center gap-3",
                index === selectedIndex
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "hover:bg-gray-50 dark:hover:bg-gray-750"
              )}
              data-testid={`mention-option-${user.id}`}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0",
                getAvatarColor(user.id)
              )}>
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                {user.displayName}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
