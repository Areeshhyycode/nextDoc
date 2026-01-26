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
        font-size: 15px;
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
        font-size: 15px;
        font-weight: 400;
        letter-spacing: -0.01em;
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

      /* ClickUp-style Typography */
      .ProseMirror h1 {
        font-size: 1.875rem;
        font-weight: 600;
        margin: 1.5rem 0 0.75rem 0;
        line-height: 1.3;
        color: #18181b;
      }

      .dark .ProseMirror h1 {
        color: #fafafa;
      }

      .ProseMirror h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1.25rem 0 0.5rem 0;
        line-height: 1.35;
        color: #18181b;
      }

      .dark .ProseMirror h2 {
        color: #fafafa;
      }

      .ProseMirror h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 1rem 0 0.5rem 0;
        line-height: 1.4;
        color: #27272a;
      }

      .dark .ProseMirror h3 {
        color: #e4e4e7;
      }

      .ProseMirror h4 {
        font-size: 1.125rem;
        font-weight: 600;
        margin: 0.75rem 0 0.375rem 0;
        line-height: 1.4;
        color: #3f3f46;
      }

      .dark .ProseMirror h4 {
        color: #d4d4d8;
      }

      .ProseMirror p {
        margin: 0.375rem 0;
        line-height: 1.625;
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
        padding: 1rem 1.25rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        overflow-x: auto;
        font-size: 0.875rem;
        line-height: 1.7;
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
        font-size: 0.875em;
        font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
      }

      .dark .ProseMirror code {
        background: #27272a;
        color: #f87171;
      }

      /* ClickUp-style Blockquote */
      .ProseMirror blockquote {
        border-left: 3px solid #a1a1aa;
        padding-left: 1rem;
        margin: 1rem 0;
        font-style: normal;
        color: #52525b;
      }

      .dark .ProseMirror blockquote {
        color: #a1a1aa;
        border-left-color: #52525b;
      }

      /* ClickUp-style Divider */
      .ProseMirror hr {
        border: none;
        border-top: 1px solid #e4e4e7;
        margin: 1.5rem 0;
      }

      .dark .ProseMirror hr {
        border-top-color: #3f3f46;
      }

      /* Modern ClickUp-style Table with Gradient Headers */
      .ProseMirror table {
        border-collapse: separate;
        border-spacing: 0;
        table-layout: fixed;
        width: 100%;
        margin: 1.5rem 0;
        overflow: hidden;
        border-radius: 0.75rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }

      .dark .ProseMirror table {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
      }

      .ProseMirror td,
      .ProseMirror th {
        min-width: 120px;
        border: 1px solid #e4e4e7;
        padding: 1rem 1.25rem;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
        transition: all 0.2s ease;
      }

      .dark .ProseMirror td,
      .dark .ProseMirror th {
        border-color: #3f3f46;
      }

      /* Clean header row with subtle blue accent */
      .ProseMirror th {
        font-weight: 600;
        text-align: left;
        background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
        color: #334155;
        font-size: 0.875rem;
        padding: 1rem 1.25rem;
        border-bottom: 2px solid #3b82f6;
      }

      .dark .ProseMirror th {
        background: linear-gradient(to bottom, #1e293b, #0f172a);
        color: #e2e8f0;
        border-bottom-color: #3b82f6;
      }

      /* First header cell rounded corner */
      .ProseMirror thead tr:first-child th:first-child,
      .ProseMirror tr:first-child th:first-child {
        border-top-left-radius: 0.75rem;
      }

      /* Last header cell rounded corner */
      .ProseMirror thead tr:first-child th:last-child,
      .ProseMirror tr:first-child th:last-child {
        border-top-right-radius: 0.75rem;
      }

      /* Alternating row colors */
      .ProseMirror tbody tr:nth-child(odd) td {
        background-color: #ffffff;
      }

      .ProseMirror tbody tr:nth-child(even) td {
        background-color: #f9fafb;
      }

      .dark .ProseMirror tbody tr:nth-child(odd) td {
        background-color: #1f2937;
      }

      .dark .ProseMirror tbody tr:nth-child(even) td {
        background-color: #111827;
      }

      .ProseMirror td {
        color: #374151;
        font-size: 0.9375rem;
      }

      .dark .ProseMirror td {
        color: #d1d5db;
      }

      .ProseMirror td p,
      .ProseMirror th p {
        margin: 0;
      }

      /* Table cell selection with blue tint */
      .ProseMirror .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: "";
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: rgba(59, 130, 246, 0.15);
        pointer-events: none;
      }

      /* Resize handle with blue accent */
      .ProseMirror .column-resize-handle {
        position: absolute;
        right: -2px;
        top: 0;
        bottom: -2px;
        width: 4px;
        background-color: #3b82f6;
        pointer-events: none;
      }

      .ProseMirror.resize-cursor {
        cursor: col-resize;
      }

      /* Row hover with subtle color */
      .ProseMirror tbody tr:hover td {
        background-color: #eff6ff !important;
      }

      .dark .ProseMirror tbody tr:hover td {
        background-color: #1e3a5f !important;
      }

      /* Last row bottom corners */
      .ProseMirror tbody tr:last-child td:first-child {
        border-bottom-left-radius: 0.75rem;
      }

      .ProseMirror tbody tr:last-child td:last-child {
        border-bottom-right-radius: 0.75rem;
      }
    `}</style>
  );
}
