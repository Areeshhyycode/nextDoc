import { useEffect, useMemo, useRef, useState } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";

export interface CollaborationUser {
  id: string;
  displayName: string;
  email: string;
  profilePicture: string | null;
  color: string;
  permission?: string;
}

interface UseCollaborationOptions {
  documentId: string | null;
  enabled: boolean;
  user: {
    id: string;
    displayName: string;
    email: string;
    profilePicture?: string | null;
  } | null;
}

interface UseCollaborationReturn {
  ydoc: Y.Doc | null;
  provider: HocuspocusProvider | null;
  isConnected: boolean;
  isSynced: boolean;
  connectedUsers: CollaborationUser[];
}

const CURSOR_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#82E0AA",
  "#F1948A",
  "#85C1E9",
];

export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function useCollaboration({
  documentId,
  enabled,
  user,
}: UseCollaborationOptions): UseCollaborationReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<CollaborationUser[]>([]);
  const providerRef = useRef<HocuspocusProvider | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);

  const stableKey = enabled && documentId && user ? `${documentId}:${user.id}` : null;

  const ydoc = useMemo(() => {
    if (!stableKey) return null;
    const doc = new Y.Doc();
    ydocRef.current = doc;
    return doc;
  }, [stableKey]);

  const provider = useMemo(() => {
    if (!ydoc || !documentId || !user) return null;

    // Destroy previous provider
    providerRef.current?.destroy();

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.host}/collaboration`;

    console.log(`[Collaboration] Creating provider for doc ${documentId} at ${wsUrl}`);

    const newProvider = new HocuspocusProvider({
      url: wsUrl,
      name: documentId,
      document: ydoc,
      onConnect: () => {
        console.log(`[Collaboration] Connected to doc ${documentId}`);
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log(`[Collaboration] Disconnected from doc ${documentId}`);
        setIsConnected(false);
        setIsSynced(false);
      },
      onSynced: ({ state }: { state: boolean }) => {
        console.log(`[Collaboration] Synced: ${state} for doc ${documentId}`);
        setIsSynced(state);
      },
      onAuthenticationFailed: ({ reason }: { reason: string }) => {
        console.warn(`[Collaboration] Auth failed: ${reason}`);
        setIsConnected(false);
        setIsSynced(false);
      },
      onAwarenessUpdate: () => {
        const awareness = newProvider.awareness;
        if (!awareness) return;
        const users: CollaborationUser[] = [];
        const seen = new Set<string>();
        awareness.getStates().forEach((state: any, clientId: number) => {
          if (
            state.user &&
            clientId !== awareness.clientID &&
            !seen.has(state.user.id)
          ) {
            seen.add(state.user.id);
            users.push(state.user);
          }
        });
        setConnectedUsers(users);
      },
    });

    // Set local awareness state
    const color = getUserColor(user.id);
    newProvider.setAwarenessField("user", {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      profilePicture: user.profilePicture || null,
      color,
    });

    providerRef.current = newProvider;
    return newProvider;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ydoc, documentId, user?.id]);

  // Re-sync awareness when user details change (displayName, profilePicture)
  useEffect(() => {
    if (!providerRef.current || !user) return;
    const color = getUserColor(user.id);
    providerRef.current.setAwarenessField("user", {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      profilePicture: user.profilePicture || null,
      color,
    });
  }, [user?.displayName, user?.profilePicture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      providerRef.current?.destroy();
      providerRef.current = null;
      ydocRef.current?.destroy();
      ydocRef.current = null;
    };
  }, []);

  return { ydoc, provider, isConnected, isSynced, connectedUsers };
}
