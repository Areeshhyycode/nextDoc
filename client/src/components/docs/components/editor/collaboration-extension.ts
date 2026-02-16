/**
 * Custom lightweight collaboration extension that directly wraps ySyncPlugin + yUndoPlugin.
 *
 * We bypass the official @tiptap/extension-collaboration because its `addProseMirrorPlugins()`
 * has a code path (`this.options.document.getXmlFragment(...)`) that crashes when `document`
 * is null — even though we pass `fragment`. The crash is triggered by TipTap's internal
 * extension lifecycle during `new Editor()`.
 *
 * This custom extension does the same thing but without the problematic fallback code path.
 */
import { Extension } from '@tiptap/core';
import { ySyncPlugin, yUndoPlugin, yUndoPluginKey, undo, redo } from '@tiptap/y-tiptap';
import type { XmlFragment } from 'yjs';

export interface YjsCollaborationOptions {
  fragment: XmlFragment;
}

export const YjsCollaboration = Extension.create<YjsCollaborationOptions>({
  name: 'yjsCollaboration',
  priority: 1000,

  addOptions() {
    return {
      fragment: null as any,
    };
  },

  addCommands() {
    return {
      undo: () => ({ state, dispatch }: any) => {
        const undoManager = yUndoPluginKey.getState(state)?.undoManager;
        if (!undoManager || undoManager.undoStack.length === 0) return false;
        if (!dispatch) return true;
        return undo(state);
      },
      redo: () => ({ state, dispatch }: any) => {
        const undoManager = yUndoPluginKey.getState(state)?.undoManager;
        if (!undoManager || undoManager.redoStack.length === 0) return false;
        if (!dispatch) return true;
        return redo(state);
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-z': () => this.editor.commands.undo(),
      'Mod-y': () => this.editor.commands.redo(),
      'Shift-Mod-z': () => this.editor.commands.redo(),
    };
  },

  addProseMirrorPlugins() {
    const fragment = this.options.fragment;
    if (!fragment) {
      console.error('[YjsCollaboration] No fragment provided, skipping plugins');
      return [];
    }
    return [
      ySyncPlugin(fragment),
      yUndoPlugin(),
    ];
  },
});
