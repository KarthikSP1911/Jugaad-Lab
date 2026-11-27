/** Shows text with `backticks` as inline code. */
export function Rich({ text }: { text: string }) {
  return text
    .split('`')
    .map((part, i) => (i % 2 === 1 ? <code key={i}>{part}</code> : part || null));
}
