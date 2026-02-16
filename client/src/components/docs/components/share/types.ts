export interface UserSearchResult {
  id: string;
  displayName: string;
  email: string;
  profilePicture: string | null;
}

export type PermissionType = "view" | "edit" | "comment" | "edit_comment";

export interface DocumentShare {
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

export interface PublicLinkResponse {
  publicLinkEnabled: boolean;
  publicLinkToken: string | null;
  publicLinkExpiresAt: string | null;
  publicLinkCreatedAt: string | null;
  publicLinkUrl: string | null;
}

export const PERMISSION_CONFIG: Record<PermissionType, { label: string; shortLabel: string }> = {
  view: { label: "Can view", shortLabel: "Can view" },
  edit: { label: "Can edit", shortLabel: "Can edit" },
  comment: { label: "Can comment", shortLabel: "Can comment" },
  edit_comment: { label: "Edit & comment", shortLabel: "Edit & comment" },
};

export const PERMISSION_LEVELS: Record<PermissionType, number> = {
  view: 1,
  comment: 2,
  edit: 3,
  edit_comment: 4,
};

export function getAllowedPermissions(maxPermission: PermissionType | null): PermissionType[] {
  if (!maxPermission) return Object.keys(PERMISSION_CONFIG) as PermissionType[];
  const maxLevel = PERMISSION_LEVELS[maxPermission];
  return (Object.keys(PERMISSION_LEVELS) as PermissionType[]).filter(
    (p) => PERMISSION_LEVELS[p] <= maxLevel
  );
}

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-teal-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-cyan-500",
];

export function getAvatarColor(name: string): string {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
