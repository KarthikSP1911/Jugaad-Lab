/** Levenshtein distance. */
function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const change = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(
        (previous[j] ?? 0) + 1,
        (row[j - 1] ?? 0) + 1,
        (previous[j - 1] ?? 0) + change,
      );
    }
    previous = row;
  }
  return previous[b.length] ?? 0;
}

/** The closest known name, if it is close enough to be a likely typo. */
export function suggest(name: string, known: Iterable<string>): string | undefined {
  // Quadratic in length, so very long names are not worth comparing.
  if (name.length > 40) return undefined;
  let best: string | undefined;
  let bestDistance = name.length < 4 ? 2 : 3;
  for (const candidate of known) {
    if (Math.abs(candidate.length - name.length) >= bestDistance) continue;
    const found = distance(name, candidate);
    if (found < bestDistance) {
      best = candidate;
      bestDistance = found;
    }
  }
  return best;
}
