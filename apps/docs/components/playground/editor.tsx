'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { complete, type Completion } from '../../lib/editor/complete';
import { dedent, indent, INDENT, newline, toggleComment, type Edit } from '../../lib/editor/edit';
import { Highlighted } from '../ui/code';
import { useDictionary, useLocale } from '../ui/locale';

/** Matches the editor's padding and line height in the stylesheet. */
const PADDING = 16;
const LINE_HEIGHT = 24;

interface Popup extends Completion {
  selected: number;
  top: number;
  left: number;
  /** Asked for or moved through, so Enter takes the suggestion. */
  chosen: boolean;
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

/** Moves the list above its line, or to the left, when it would be cut off. */
function keepInView(list: HTMLElement, { top, left }: Popup) {
  const view = list.closest('.editor-scroll');
  const origin = list.offsetParent;
  if (!view || !(origin instanceof HTMLElement)) return;
  const bounds = view.getBoundingClientRect();
  const base = origin.getBoundingClientRect();
  const below = base.top + top + list.offsetHeight > bounds.bottom;
  const above = top - LINE_HEIGHT - list.offsetHeight;
  list.style.top = `${below && base.top + above >= bounds.top ? above : top}px`;
  const overflow = base.left + left + list.offsetWidth - bounds.right;
  list.style.left = `${Math.max(0, left - Math.max(0, overflow))}px`;
}

export interface Position {
  line: number;
  column: number;
}

interface Props {
  code: string;
  onChange: (code: string) => void;
  onRun: () => void;
  /** Lines with an error, counted from 1. */
  errorLines: readonly number[];
  /** Puts the cursor here whenever a new object arrives. */
  jump: Position | null;
}

export function Editor({ code, onChange, onRun, errorLines, jump }: Props) {
  const locale = useLocale();
  const { editor: text } = useDictionary();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [popup, setPopup] = useState<Popup | null>(null);
  /** After Escape, Tab moves focus instead of indenting. */
  const releaseTab = useRef(false);
  /** Set while a command edits the text, which should not open suggestions. */
  const applying = useRef(false);

  useLayoutEffect(() => {
    if (popup && list.current) keepInView(list.current, popup);
  }, [popup]);

  useEffect(() => {
    const editor = textarea.current;
    if (!jump || !editor) return;
    const lines = editor.value.split('\n').slice(0, jump.line - 1);
    const offset = lines.reduce((total, line) => total + line.length + 1, 0) + jump.column - 1;
    editor.focus({ preventScroll: true });
    editor.setSelectionRange(offset, offset);
    const view = editor.closest('.editor-scroll');
    if (view) view.scrollTop = PADDING + (jump.line - 1) * LINE_HEIGHT - view.clientHeight / 2;
    editor.closest('.workbench')?.scrollIntoView({ block: 'nearest' });
  }, [jump]);

  function suggest(editor: HTMLTextAreaElement, explicit = false) {
    const found =
      editor.selectionStart === editor.selectionEnd
        ? complete(editor.value, editor.selectionStart, explicit, locale)
        : null;
    setPopup(found && { ...found, selected: 0, chosen: explicit, ...position(editor, found.from) });
  }

  function apply(editor: HTMLTextAreaElement, { from, to, insert, selection }: Edit) {
    setPopup(null);
    editor.focus();
    if (from !== to || insert !== '') {
      applying.current = true;
      editor.setSelectionRange(from, to);
      // Deprecated, but still the only way to edit that keeps the browser's undo history.
      const done = document.execCommand(insert ? 'insertText' : 'delete', false, insert);
      if (!done) {
        editor.setRangeText(insert, from, to, 'end');
        onChange(editor.value);
      }
      applying.current = false;
    }
    editor.setSelectionRange(...selection);
  }

  function accept(index: number) {
    const editor = textarea.current;
    const item = popup?.items[index];
    if (!editor || !popup || !item) return;
    const cursor = popup.from + item.insert.length;
    apply(editor, {
      from: popup.from,
      to: editor.selectionEnd,
      insert: item.insert,
      selection: [cursor, cursor],
    });
  }

  function select(step: number) {
    if (!popup) return;
    const selected = (popup.selected + step + popup.items.length) % popup.items.length;
    setPopup({ ...popup, selected, chosen: true });
    document.getElementById(`suggestion-${selected}`)?.scrollIntoView({ block: 'nearest' });
  }

  /** Keys that act on the open suggestion list. */
  function onPopupKey(key: string): boolean {
    if (!popup) return false;
    if (key === 'ArrowDown') select(1);
    else if (key === 'ArrowUp') select(-1);
    else if (key === 'Tab' || (key === 'Enter' && popup.chosen)) accept(popup.selected);
    else if (key === 'Escape') setPopup(null);
    else {
      if (['Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) setPopup(null);
      return false;
    }
    return true;
  }

  /** The editing command a key stands for, if any. */
  function commandFor(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.ctrlKey || event.metaKey) return event.key === '/' ? toggleComment : null;
    if (event.altKey || event.nativeEvent.isComposing) return null;
    if (event.key === 'Enter') return newline;
    if (event.key !== 'Tab' || releaseTab.current) return null;
    return event.shiftKey ? dedent : indent;
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // Holding Shift on the way to Shift+Tab must not cancel the release.
    if (event.key === 'Shift') return;
    const editor = event.currentTarget;
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
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
    } else {
      const command = commandFor(event);
      if (command) {
        event.preventDefault();
        apply(editor, command(editor.value, editor.selectionStart, editor.selectionEnd));
      }
    }
    releaseTab.current = false;
  }

  const marked = new Set(errorLines);

  return (
    <div className="editor-scroll">
      <div className="line-numbers" aria-hidden="true">
        {code.split('\n').map((_, index) => (
          <span key={index} className={marked.has(index + 1) ? 'has-error' : undefined}>
            {index + 1}
          </span>
        ))}
      </div>
      <div className="editor">
        {[...marked].map((line) => (
          <div
            key={line}
            className="error-line"
            style={{ top: PADDING + (line - 1) * LINE_HEIGHT }}
          />
        ))}
        <pre aria-hidden="true">
          <Highlighted source={code} />
          {'\n '}
        </pre>
        <textarea
          ref={textarea}
          aria-label={text.label}
          aria-autocomplete="list"
          aria-controls={popup ? 'suggestions' : undefined}
          aria-activedescendant={popup ? `suggestion-${popup.selected}` : undefined}
          value={code}
          onChange={(event) => {
            onChange(event.target.value);
            if (!applying.current) suggest(event.target);
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
              ref={list}
              id="suggestions"
              role="listbox"
              aria-label={text.suggestions}
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
