/**
 * Custom lightweight collaboration cursor extension.
 * Wraps yCursorPlugin from @tiptap/y-tiptap directly, bypassing
 * @tiptap/extension-collaboration-cursor which imports from y-prosemirror
 * (creating potential duplicate plugin key conflicts).
 */
import { Extension } from '@tiptap/core';
import { yCursorPlugin } from '@tiptap/y-tiptap';

export interface YjsCollaborationCursorOptions {
  provider: any;
  user: { name: string; color: string };
}

export const YjsCollaborationCursor = Extension.create<YjsCollaborationCursorOptions>({
  name: 'yjsCollaborationCursor',

  addOptions() {
    return {
      provider: null as any,
      user: { name: 'Anonymous', color: '#999999' },
    };
  },

  addProseMirrorPlugins() {
    const provider = this.options.provider;
    if (!provider?.awareness) {
      console.warn('[YjsCollaborationCursor] No provider/awareness, skipping cursor plugin');
      return [];
    }

    // Merge cursor name/color into existing awareness user state (set by use-collaboration.ts)
    // instead of overwriting it, so displayName, email, id etc. are preserved.
    const existing = provider.awareness.getLocalState()?.user || {};
    provider.awareness.setLocalStateField('user', {
      ...existing,
      name: this.options.user.name,
      color: this.options.user.color,
    });

    return [
      yCursorPlugin(provider.awareness, {
        cursorBuilder: (user: any) => {
          const cursor = document.createElement('span');
          cursor.classList.add('collaboration-cursor__caret');
          cursor.setAttribute('style', `border-color: ${user.color}`);

          const label = document.createElement('div');
          label.classList.add('collaboration-cursor__label');
          label.setAttribute('style', `background-color: ${user.color}`);
          // Use displayName with fallback to name
          const displayName = user.displayName || user.name || 'Anonymous';
          label.insertBefore(document.createTextNode(displayName), null);
          cursor.insertBefore(label, null);

          return cursor;
        },
      }),
    ];
  },
});
