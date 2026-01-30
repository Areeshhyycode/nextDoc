import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import type { UserSearchResult, PermissionType } from "./types";
import { PERMISSION_CONFIG, getAvatarColor } from "./types";

interface UserSearchSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  permission: PermissionType;
  onPermissionChange: (value: PermissionType) => void;
  availableUsers: UserSearchResult[];
  isSearching: boolean;
  isPending: boolean;
  onSelectUser: (user: UserSearchResult) => void;
}

export function UserSearchSection({
  searchQuery,
  onSearchChange,
  permission,
  onPermissionChange,
  availableUsers,
  isSearching,
  isPending,
  onSelectUser,
}: UserSearchSectionProps) {
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset highlight when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [availableUsers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    if (showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSearchResults]);

  const handleSelectUser = (user: UserSearchResult) => {
    onSelectUser(user);
    setShowSearchResults(false);
  };

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
  }, [showSearchResults, availableUsers, highlightedIndex]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        Share with people
      </p>

      <div className="flex gap-2" ref={searchDropdownRef}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            ref={searchInputRef}
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            onKeyDown={handleSearchKeyDown}
            className="pl-9 h-10 bg-[#2a2a2a] border-[#444] text-white placeholder:text-gray-500"
          />

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

        <Select value={permission} onValueChange={(val: PermissionType) => onPermissionChange(val)}>
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
              const userToSelect = highlightedIndex >= 0
                ? availableUsers[highlightedIndex]
                : availableUsers[0];
              handleSelectUser(userToSelect);
            }
          }}
          disabled={isPending || searchQuery.length < 2 || availableUsers.length === 0}
          className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Invite"
          )}
        </Button>
      </div>
    </div>
  );
}
