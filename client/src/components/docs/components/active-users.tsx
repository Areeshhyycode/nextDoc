import type { CollaborationUser } from "@/hooks/use-collaboration";

interface ActiveUsersProps {
  users: CollaborationUser[];
  isConnected: boolean;
}

const MAX_VISIBLE = 5;

export function ActiveUsers({ users, isConnected }: ActiveUsersProps) {
  if (!isConnected && users.length === 0) return null;

  const visibleUsers = users.slice(0, MAX_VISIBLE);
  const overflowCount = users.length - MAX_VISIBLE;

  return (
    <div className="flex items-center gap-2">
      {/* Connection status dot */}
      <span
        className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${
          isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
        }`}
        title={isConnected ? "Connected" : "Reconnecting..."}
      />

      {/* User avatars */}
      {visibleUsers.length > 0 && (
        <div className="flex -space-x-2">
          {visibleUsers.map((user) => (
            <div
              key={user.id}
              className="relative group"
              title={`${user.displayName || user.email || "User"}${user.permission === "view" ? " (viewing)" : ""}`}
            >
              <div
                className="w-6 h-6 rounded-full border-2 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] font-semibold overflow-hidden"
                style={{ borderColor: user.color }}
              >
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.displayName}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span style={{ color: user.color }}>
                    {getInitials(user.displayName || user.email || '')}
                  </span>
                )}
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {user.displayName || user.email || "User"}
                {user.permission === "view" && (
                  <span className="text-gray-400 ml-1">(viewing)</span>
                )}
              </div>
            </div>
          ))}
          {overflowCount > 0 && (
            <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[10px] font-semibold text-gray-500 dark:text-gray-400">
              +{overflowCount}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getInitials(name: string | undefined | null): string {
  if (!name || typeof name !== 'string') return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";
}
