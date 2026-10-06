# ADR-0001: Model-first architecture with DOM projection

**Status:** accepted

## Context

An AI composer can be DOM-first (the browser's content is truth), model-first
(the document is truth), or hybrid. We must serialize, undo, test headless,
support SSR, and behave identically across 4+ frameworks.

## Decision

**Model-first.** `AIComposerDocument` (core) is the single source of truth. The
DOM layer projects the model and reports user edits back via
`editor.applyViewUpdate(parsedDocument, selection)` — never by mutating state
directly. Re-renders restore the caret from the model selection.

User typing keeps native contentEditable behavior for IME friendliness; after
each input event the DOM is parsed (sanitized) into the model. All
programmatic APIs write the model; views re-project.

## Consequences

- Serialization/history/undo work without a browser (proven by headless tests).
- SSR: the model can be rendered to HTML server-side and hydrated.
- Full re-render per change is acceptable for typical composer documents (< few hundred
  nodes); a keyed diff is the escape hatch if profiling demands it (Phase 11).
- IME composition is bracketed (compositionstart/end) and synced once at the
  end — complex intermediate states never hit the model.
