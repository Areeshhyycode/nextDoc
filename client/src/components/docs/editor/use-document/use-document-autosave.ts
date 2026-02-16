import { useEffect, useRef } from "react";
import type { PageStyles } from "./types";

interface AutosaveParams {
  title: string;
  content: string;
  tags: string[];
  pageStyles: PageStyles;
  isNewDoc: boolean;
  docId: string | null;
  originalTitleRef: React.MutableRefObject<string>;
  originalContentRef: React.MutableRefObject<string>;
  onSave: (payload: any) => void;
  onSavingStart: () => void;
  enabled?: boolean;
}

export function useDocumentAutosave({
  title,
  content,
  tags,
  pageStyles,
  isNewDoc,
  docId,
  originalTitleRef,
  originalContentRef,
  onSave,
  onSavingStart,
  enabled = true,
}: AutosaveParams) {
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!isNewDoc && docId && (title || content)) {
      const titleChanged = title !== originalTitleRef.current;
      const contentChanged = content !== originalContentRef.current;

      if (!titleChanged && !contentChanged) {
        return;
      }

      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }

      autosaveTimerRef.current = setTimeout(() => {
        const updatePayload: any = {
          tags,
          ...pageStyles,
        };

        if (titleChanged) {
          updatePayload.title = title;
          originalTitleRef.current = title;
        }

        if (contentChanged) {
          updatePayload.content = content;
          originalContentRef.current = content;
        }

        console.log('[Autosave] Firing — titleChanged:', titleChanged, 'contentChanged:', contentChanged, 'hasContent:', !!updatePayload.content);
        onSavingStart();
        onSave(updatePayload);
      }, 2000);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [title, content, tags, pageStyles, isNewDoc, docId, enabled]);
}
