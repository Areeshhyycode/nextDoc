export function EditorStyles() {
  return (
    <style>{`
      /* ClickUp-style Placeholder - Clean and minimal */
      .ProseMirror p.is-empty::before,
      .ProseMirror p.is-node-empty::before,
      .ProseMirror p.is-editor-empty::before {
        content: attr(data-placeholder);
        float: left;
        color: #a1a1aa;
        pointer-events: none;
        height: 0;
        width: 100%;
        font-size: 13px;
        font-weight: 400;
        letter-spacing: -0.01em;
      }

      /* When the entire editor is empty, target first child paragraph */
      .ProseMirror.is-editor-empty p:first-child::before,
      .ProseMirror.is-empty p:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #a1a1aa;
        pointer-events: none;
        height: 0;
        width: 100%;
        font-size: 13px;
        font-weight: 400;
        letter-spacing: -0.01em;
      }

      @media (min-width: 768px) {
        .ProseMirror p.is-empty::before,
        .ProseMirror p.is-node-empty::before,
        .ProseMirror p.is-editor-empty::before,
        .ProseMirror.is-editor-empty p:first-child::before,
        .ProseMirror.is-empty p:first-child::before {
          font-size: 15px;
        }
      }

      /* Dark mode placeholder - slightly brighter for visibility */
      .dark .ProseMirror p.is-empty::before,
      .dark .ProseMirror p.is-node-empty::before,
      .dark .ProseMirror p.is-editor-empty::before,
      .dark .ProseMirror.is-editor-empty p:first-child::before,
      .dark .ProseMirror.is-empty p:first-child::before {
        color: #71717a;
      }

      /* ClickUp-style Task List */
      .ProseMirror ul[data-type="taskList"] {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0;
      }

      .ProseMirror ul[data-type="taskList"] li {
        display: flex;
        align-items: flex-start;
        gap: 0.625rem;
        padding: 0.25rem 0;
      }

      .ProseMirror ul[data-type="taskList"] li > label {
        flex: 0 0 auto;
        user-select: none;
        display: flex;
        align-items: center;
      }

      .ProseMirror ul[data-type="taskList"] li > div {
        flex: 1 1 auto;
        min-width: 0;
      }

      .ProseMirror ul[data-type="taskList"] li input[type="checkbox"] {
        cursor: pointer;
        width: 1.125rem;
        height: 1.125rem;
        margin-top: 0.125rem;
        border-radius: 0.25rem;
        border: 2px solid #d4d4d8;
        accent-color: #7c3aed;
      }

      .dark .ProseMirror ul[data-type="taskList"] li input[type="checkbox"] {
        border-color: #52525b;
      }

      .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div > p {
        text-decoration: line-through;
        color: #a1a1aa;
      }

      .dark .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div > p {
        color: #71717a;
      }

      /* ClickUp-style Typography - Mobile first */
      .ProseMirror h1 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 1rem 0 0.5rem 0;
        line-height: 1.3;
        color: #18181b;
      }

      .dark .ProseMirror h1 {
        color: #fafafa;
      }

      .ProseMirror h2 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0.875rem 0 0.375rem 0;
        line-height: 1.35;
        color: #18181b;
      }

      .dark .ProseMirror h2 {
        color: #fafafa;
      }

      .ProseMirror h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0.75rem 0 0.375rem 0;
        line-height: 1.4;
        color: #27272a;
      }

      .dark .ProseMirror h3 {
        color: #e4e4e7;
      }

      .ProseMirror h4 {
        font-size: 0.9375rem;
        font-weight: 600;
        margin: 0.625rem 0 0.25rem 0;
        line-height: 1.4;
        color: #3f3f46;
      }

      .dark .ProseMirror h4 {
        color: #d4d4d8;
      }

      .ProseMirror p {
        margin: 0.25rem 0;
        line-height: 1.6;
        font-size: 0.875rem;
        color: #3f3f46;
      }

      .dark .ProseMirror p {
        color: #d4d4d8;
      }

      /* ClickUp-style Code Blocks */
      .ProseMirror pre {
        background: #f4f4f5;
        color: #18181b;
        font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        margin: 0.75rem 0;
        overflow-x: auto;
        font-size: 0.8125rem;
        line-height: 1.6;
        border: 1px solid #e4e4e7;
      }

      .dark .ProseMirror pre {
        background: #27272a;
        color: #fafafa;
        border-color: #3f3f46;
      }

      .ProseMirror code {
        background: #f4f4f5;
        color: #dc2626;
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.8125em;
        font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
      }

      .dark .ProseMirror code {
        background: #27272a;
        color: #f87171;
      }

      /* ClickUp-style Blockquote */
      .ProseMirror blockquote {
        border-left: 3px solid #a1a1aa;
        padding-left: 0.75rem;
        margin: 0.75rem 0;
        font-style: normal;
        color: #52525b;
      }

      .ProseMirror blockquote p {
        font-size: 0.8125rem;
      }

      .dark .ProseMirror blockquote {
        color: #a1a1aa;
        border-left-color: #52525b;
      }

      /* ClickUp-style Divider */
      .ProseMirror hr {
        border: none;
        border-top: 1px solid #e4e4e7;
        margin: 1rem 0;
      }

      .dark .ProseMirror hr {
        border-top-color: #3f3f46;
      }

      /* Tablet and up - restore larger sizes */
      @media (min-width: 640px) {
        .ProseMirror h1 {
          font-size: 1.5rem;
          margin: 1.25rem 0 0.625rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
          margin: 1rem 0 0.5rem 0;
        }
        .ProseMirror h3 {
          font-size: 1.125rem;
          margin: 0.875rem 0 0.5rem 0;
        }
        .ProseMirror h4 {
          font-size: 1rem;
          margin: 0.75rem 0 0.375rem 0;
        }
        .ProseMirror p {
          margin: 0.375rem 0;
          font-size: 0.9375rem;
        }
        .ProseMirror pre {
          padding: 0.875rem 1.125rem;
          font-size: 0.875rem;
        }
        .ProseMirror blockquote {
          padding-left: 0.875rem;
          margin: 0.875rem 0;
        }
        .ProseMirror blockquote p {
          font-size: 0.875rem;
        }
      }

      /* Desktop - full sizes */
      @media (min-width: 768px) {
        .ProseMirror h1 {
          font-size: 1.875rem;
          margin: 1.5rem 0 0.75rem 0;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
          margin: 1.25rem 0 0.5rem 0;
        }
        .ProseMirror h3 {
          font-size: 1.25rem;
          margin: 1rem 0 0.5rem 0;
        }
        .ProseMirror h4 {
          font-size: 1.125rem;
          margin: 0.75rem 0 0.375rem 0;
        }
        .ProseMirror p {
          margin: 0.375rem 0;
          font-size: inherit;
          line-height: 1.625;
        }
        .ProseMirror pre {
          padding: 1rem 1.25rem;
          margin: 1rem 0;
          font-size: 0.875rem;
          line-height: 1.7;
        }
        .ProseMirror blockquote {
          padding-left: 1rem;
          margin: 1rem 0;
        }
        .ProseMirror blockquote p {
          font-size: inherit;
        }
        .ProseMirror hr {
          margin: 1.5rem 0;
        }
      }

      /* =========================================
         TABLE STYLES - Fits page, no scroll
         ========================================= */

      /* Table wrapper */
      .ProseMirror .tableWrapper {
        overflow: hidden;
        margin: 0.75rem 0;
        border-radius: 0.5rem;
        border: 1px solid #e4e4e7;
      }

      .dark .ProseMirror .tableWrapper {
        border-color: #3f3f46;
      }

      @media (min-width: 768px) {
        .ProseMirror .tableWrapper {
          margin: 1.25rem 0;
          border-radius: 0.75rem;
        }
      }

      /* Table - always fits inside page */
      .ProseMirror table {
        border-collapse: collapse;
        border-spacing: 0;
        table-layout: fixed;
        width: 100%;
        margin: 0;
      }

      /* Cells - compact on mobile, comfortable on desktop */
      .ProseMirror td,
      .ProseMirror th {
        border: 1px solid #e4e4e7;
        padding: 6px 8px;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
        font-size: 11px;
        line-height: 1.4;
        word-break: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
      }

      @media (min-width: 640px) {
        .ProseMirror td,
        .ProseMirror th {
          padding: 8px 10px;
          font-size: 13px;
        }
      }

      @media (min-width: 768px) {
        .ProseMirror td,
        .ProseMirror th {
          padding: 10px 14px;
          font-size: 14px;
          line-height: 1.5;
        }
      }

      .dark .ProseMirror td,
      .dark .ProseMirror th {
        border-color: #3f3f46;
      }

      /* Header cells */
      .ProseMirror th {
        font-weight: 600;
        text-align: left;
        background: #f8fafc;
        color: #334155;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        padding: 5px 8px;
        border-bottom: 2px solid #6366f1;
      }

      @media (min-width: 640px) {
        .ProseMirror th {
          font-size: 11px;
          padding: 7px 10px;
        }
      }

      @media (min-width: 768px) {
        .ProseMirror th {
          font-size: 12px;
          padding: 10px 14px;
          letter-spacing: 0.02em;
        }
      }

      .dark .ProseMirror th {
        background: #1e293b;
        color: #e2e8f0;
        border-bottom-color: #6366f1;
      }

      /* Body cells */
      .ProseMirror td {
        color: #374151;
      }

      .dark .ProseMirror td {
        color: #d1d5db;
      }

      /* Alternating row colors */
      .ProseMirror tbody tr:nth-child(even) td {
        background-color: #f9fafb;
      }

      .dark .ProseMirror tbody tr:nth-child(even) td {
        background-color: #18202f;
      }

      /* Row hover */
      @media (min-width: 768px) {
        .ProseMirror tbody tr:hover td {
          background-color: #eef2ff !important;
        }
        .dark .ProseMirror tbody tr:hover td {
          background-color: #1e2a4a !important;
        }
      }

      /* Remove margin from paragraphs inside cells */
      .ProseMirror td p,
      .ProseMirror th p {
        margin: 0;
        line-height: 1.4;
        font-size: inherit;
      }

      /* Cell selection highlight */
      .ProseMirror .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: "";
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(99, 102, 241, 0.12);
        pointer-events: none;
      }

      /* Column resize handle */
      .ProseMirror .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: -2px;
        width: 4px;
        background-color: #6366f1;
        pointer-events: none;
      }

      .ProseMirror.resize-cursor {
        cursor: col-resize;
      }

      /* =========================================
         COLLABORATION CURSOR STYLES
         ========================================= */
      .collaboration-cursor__caret {
        border-left: 2px solid;
        border-right: none;
        margin-left: -1px;
        margin-right: -1px;
        pointer-events: none;
        position: relative;
        word-break: normal;
      }

      .collaboration-cursor__label {
        display: none;
      }

      /* Remote selection highlight */
      .ProseMirror .selection {
        display: inline;
      }
    `}</style>
  );
}
