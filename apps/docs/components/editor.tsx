'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useRef, useState, type KeyboardEvent } from 'react';
import { complete, type Completion } from '../lib/complete';
import { Highlighted } from './code';

const INDENT = '    ';
/** Matches the editor's padding and line height in the stylesheet. */
const PADDING = 16;
const LINE_HEIGHT = 24;

interface Popup extends Completion {
  selected: number;
  top: number;
  left: number;
}

/** Where the line below the given offset starts, in the editor's own pixels. */
function position(editor: HTMLTextAreaElement, offset: number) {
  const lines = editor.value.slice(0, offset).split('\n');
  const text = (lines.at(-1) ?? '').replaceAll('\t', INDENT);
  const context = document.createElement('canvas').getContext('2d');
  let width = 0;
  if (context) {
    const { fontSize, fontFamily } = getComputedStyle(editor);
    context.font = `${fontSize} ${fontFamily}`;
    width = context.measureText(text).width;
  }
  return { top: PADDING + lines.length * LINE_HEIGHT, left: PADDING + width };
}

interface Props {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
}

export function Editor({ code, onChange, onRun }: Props) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [popup, setPopup] = useState<Popup | null>(null);
  /** After Escape, Tab moves focus instead of indenting. */
  const releaseTab = useRef(false);

  function suggest(editor: HTMLTextAreaElement, explicit = false) {
    const found =
      editor.selectionStart === editor.selectionEnd
        ? complete(editor.value, editor.selectionStart, explicit)
        : null;
    setPopup(found && { ...found, selected: 0, ...position(editor, found.from) });
  }

  function replace(editor: HTMLTextAreaElement, text: string, from: number) {
    editor.setRangeText(text, from, editor.selectionEnd, 'end');
    onChange(editor.value);
    setPopup(null);
  }

  function accept(index: number) {
    const editor = textarea.current;
    const item = popup?.items[index];
    if (editor && popup && item) replace(editor, item.insert, popup.from);
  }

  function select(step: number) {
    if (!popup) return;
    const selected = (popup.selected + step + popup.items.length) % popup.items.length;
    setPopup({ ...popup, selected });
    document.getElementById(`suggestion-${selected}`)?.scrollIntoView({ block: 'nearest' });
  }

  /** Keys that act on the open suggestion list. */
  function onPopupKey(key: string): boolean {
    if (!popup) return false;
    if (key === 'ArrowDown') select(1);
    else if (key === 'ArrowUp') select(-1);
    else if (key === 'Enter' || key === 'Tab') accept(popup.selected);
    else if (key === 'Escape') setPopup(null);
    else {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) setPopup(null);
      return false;
    }
    return true;
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const editor = event.currentTarget;
    const command = event.ctrlKey || event.metaKey;
    if (event.key === 'Enter' && command) {
      event.preventDefault();
      setPopup(null);
      onRun();
    } else if (event.code === 'Space' && event.ctrlKey) {
      event.preventDefault();
      suggest(editor, true);
    } else if (!event.shiftKey && onPopupKey(event.key)) {
      event.preventDefault();
    } else if (event.key === 'Escape') {
      releaseTab.current = true;
      return;
    } else if (event.key === 'Tab' && !event.shiftKey && !releaseTab.current) {
      event.preventDefault();
      replace(editor, INDENT, editor.selectionStart);
    }
    releaseTab.current = false;
  }

  return (
    <div className="editor-scroll">
      <div className="editor">
        <pre aria-hidden="true">
          <Highlighted source={code} />
          {'\n '}
        </pre>
        <textarea
          ref={textarea}
          aria-label="Program source. Control and space shows suggestions. Escape, then Tab, leaves the editor."
          aria-autocomplete="list"
          aria-controls={popup ? 'suggestions' : undefined}
          aria-activedescendant={popup ? `suggestion-${popup.selected}` : undefined}
          value={code}
          onChange={(event) => {
            onChange(event.target.value);
            suggest(event.target);
          }}
          onKeyDown={onKeyDown}
          onClick={() => setPopup(null)}
          onBlur={() => setPopup(null)}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          wrap="off"
        />
        <AnimatePresence>
          {popup && (
            <motion.ul
              id="suggestions"
              role="listbox"
              aria-label="Suggestions"
              className="suggestions"
              style={{ top: popup.top, left: popup.left }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
            >
              {popup.items.map(({ label, kind, detail }, index) => (
                <li
                  key={label}
                  id={`suggestion-${index}`}
                  role="option"
                  aria-selected={index === popup.selected}
                  // Keeps focus in the editor while choosing with the mouse.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    accept(index);
                  }}
                >
                  <span className={`tok-${kind === 'name' ? 'plain' : kind}`}>{label}</span>
                  <span className="text-muted">{detail}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
