# 6. Command line presentation

Status: accepted. Amends the "output is unchanged" line of ADR 0005.

## Decision

Errors are coloured only when standard error is a terminal and `NO_COLOR` is
unset. Several errors are separated by blank lines and followed by a count.
`check` confirms success only when standard output is a terminal.

The CLI's own messages (usage, file and REPL messages) are in English and
Hinglish. A single line shows both unless `--lang` chooses one; help text is
English unless `--lang=hi`.

The REPL accepts an entry without its final `;`, and has `.help`, `.cancel` and
`.exit`. Program files still require `;`.

## Consequences

Colour and layout stay in `packages/cli`; `core` renders plain text. Line editing
and history are not offered, because `Host.readLine` is synchronous.
