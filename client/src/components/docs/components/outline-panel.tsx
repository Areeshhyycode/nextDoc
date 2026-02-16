import { useState, useEffect, useCallback, useRef } from "react";
import { List, ChevronDown, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";

interface OutlinePanelProps {
  editor: Editor | null;
  isOpen: boolean;
  onToggle: () => void;
}

interface HeadingItem {
  id: string;
  level: number;
  text: string;
  pos: number;
}

function extractHeadings(editor: Editor): HeadingItem[] {
  const headings: HeadingItem[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      const text = node.textContent;
      if (text.trim()) {
        headings.push({
          id: `heading-${pos}-${node.attrs.level}`,
          level: node.attrs.level as number,
          text,
          pos,
        });
      }
    }
  });
  return headings;
}

export function OutlinePanel({ editor, isOpen, onToggle }: OutlinePanelProps) {
  const isMobile = useIsMobile();
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeadingPos, setActiveHeadingPos] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Extract headings from editor content with debounce
  const updateHeadings = useCallback(() => {
    if (!editor) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setHeadings(extractHeadings(editor));
    }, 150);
  }, [editor]);

  // Listen for editor updates
  useEffect(() => {
    if (!editor) return;
    // Initial extraction
    setHeadings(extractHeadings(editor));
    editor.on("update", updateHeadings);
    return () => {
      editor.off("update", updateHeadings);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [editor, updateHeadings]);

  // Active heading tracking via IntersectionObserver
  useEffect(() => {
    if (!editor || !isOpen || headings.length === 0) return;

    const headingElements: { el: Element; pos: number }[] = [];

    headings.forEach((heading) => {
      try {
        const domAtPos = editor.view.domAtPos(heading.pos);
        const node =
          domAtPos.node instanceof HTMLElement
            ? domAtPos.node
            : domAtPos.node.parentElement;
        const el = node?.closest("h1, h2, h3, h4, h5, h6");
        if (el) headingElements.push({ el, pos: heading.pos });
      } catch {
        // Position may be stale after edit
      }
    });

    if (headingElements.length === 0) return;

    const scrollContainer =
      editor.view.dom.closest(".overflow-y-auto") ||
      document.querySelector(".overflow-y-auto");

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );

        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries[0];
          const match = headingElements.find((h) => h.el === topEntry.target);
          if (match) setActiveHeadingPos(match.pos);
        }
      },
      {
        root: scrollContainer,
        rootMargin: "-10% 0px -80% 0px",
        threshold: 0,
      }
    );

    headingElements.forEach(({ el }) => observer.observe(el));
    return () => observer.disconnect();
  }, [editor, isOpen, headings]);

  // Scroll to heading on click
  const scrollToHeading = useCallback(
    (pos: number) => {
      if (!editor) return;
      try {
        editor.chain().setTextSelection(pos).run();
        const domAtPos = editor.view.domAtPos(pos);
        const node =
          domAtPos.node instanceof HTMLElement
            ? domAtPos.node
            : domAtPos.node.parentElement;
        const headingEl = node?.closest("h1, h2, h3, h4, h5, h6") || node;
        if (headingEl) {
          headingEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setActiveHeadingPos(pos);
        // Close panel on mobile after navigation
        if (isMobile) {
          setTimeout(() => onToggle(), 300);
        }
      } catch {
        // Position may be stale
      }
    },
    [editor, isMobile, onToggle]
  );

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggle();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onToggle]);

  return (
    <>
      {/* Backdrop overlay - mobile only */}
      {isMobile && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[55] transition-opacity duration-300 md:hidden",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onToggle}
        />
      )}

      <div
        className={cn(
          "fixed flex flex-col transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          // Mobile: full-screen overlay
          "inset-0 z-[60] md:z-50",
          // Desktop: right sidebar
          "md:right-0 md:top-0 md:left-auto md:bottom-auto md:h-full md:w-[320px]",
          // Surface
          "bg-gray-50 dark:bg-gray-900 md:bg-white md:dark:bg-gray-850 md:border-l md:border-gray-200/80 md:dark:border-gray-700/60 md:shadow-xl",
          // Animations
          isOpen
            ? "translate-y-0 md:translate-y-0 md:translate-x-0 opacity-100"
            : "translate-y-full md:translate-y-0 md:translate-x-full pointer-events-none opacity-0 md:opacity-100"
        )}
        data-testid="outline-panel"
      >
        {/* ─── Header ─── */}
        <div className="bg-white dark:bg-gray-800 md:bg-transparent md:dark:bg-transparent">
          {/* Mobile drag handle */}
          <div className="flex justify-center pt-2.5 pb-0 md:hidden">
            <div className="w-9 h-[3px] rounded-full bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between border-b border-gray-200/80 dark:border-gray-700/50">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30">
                <List className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
                  Outline
                </h3>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight mt-0.5">
                  {headings.length} heading
                  {headings.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all"
              data-testid="button-close-outline"
            >
              <ChevronDown className="h-5 w-5 md:hidden" />
              <X className="h-4 w-4 hidden md:block" />
            </button>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-3">
          {headings.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <List className="h-6 w-6 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 text-center">
                No headings found
              </p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5 text-center max-w-[220px] leading-relaxed">
                Add headings (H1, H2, H3...) to your document to see an outline
                here
              </p>
            </div>
          ) : (
            <nav className="space-y-0.5">
              {headings.map((heading) => (
                <button
                  key={heading.id}
                  onClick={() => scrollToHeading(heading.pos)}
                  className={cn(
                    "w-full text-left rounded-lg py-2 pr-3 text-[13px] transition-all duration-150 group",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    activeHeadingPos === heading.pos
                      ? "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-medium"
                      : "text-gray-700 dark:text-gray-300"
                  )}
                  style={{
                    paddingLeft: `${(heading.level - 1) * 16 + 12}px`,
                  }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase flex-shrink-0 w-5 text-center",
                        activeHeadingPos === heading.pos
                          ? "text-teal-500 dark:text-teal-400"
                          : "text-gray-400 dark:text-gray-500"
                      )}
                    >
                      H{heading.level}
                    </span>
                    <span className="truncate">{heading.text}</span>
                  </span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
