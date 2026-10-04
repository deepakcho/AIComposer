/**
 * 01 — Document model.
 *
 * The PromptDocument is the single source of truth. It is a FLAT list of
 * nodes (ADR-0002): text runs plus atomic "chip" nodes. Documents are
 * immutable — edits return new documents.
 */

import {
  createDocument,
  createMentionNode,
  createTextNode,
  createVariableNode,
  deleteDocumentRange,
  documentLength,
  insertNodesAt,
  nodeLength,
  findNodeIndex,
  toGlobalOffset,
  fromGlobalOffset,
  createPosition,
} from '@ai-composer/core';

// -- building documents ----------------------------------------------------

const empty = createDocument(); // { nodes: [] }

const doc = createDocument([
  createTextNode('Summarize '),
  createMentionNode({ id: 'user-42', label: 'Ada Lovelace' }),
  createTextNode(' notes about '),
  createVariableNode({ name: 'project', value: 'apollo' }),
]);

console.log(empty.nodes.length); // 0
console.log(documentLength(doc)); // 28 — text chars + 1 per atomic chip

// Atomic nodes are indivisible: a mention with a 12-char label still has
// model length 1.
console.log(nodeLength(doc.nodes[1])); // 1

// -- keys ------------------------------------------------------------------
// Every node has a stable instance `key` (NOT the entity id). It survives
// clones, undo/redo, and DOM round-trips; adapters use it for React keys
// and DOM↔model mapping.
const mention = doc.nodes[1];
if (mention.type === 'mention') {
  console.log(mention.key); // "mention_lx3a_7_f2k9q1" (unique instance id)
  console.log(mention.id); // "user-42" (the entity being mentioned)
  console.log(findNodeIndex(doc, mention.key)); // 1
}

// -- positions & offsets ---------------------------------------------------

// Positions are (nodeIndex, offset). Offset for atomic nodes: 0 = before, 1 = after.
const beforeChip = createPosition(1, 0);
const afterChip = createPosition(1, 1);

console.log(toGlobalOffset(doc, beforeChip)); // 10 (after "Summarize ")
console.log(toGlobalOffset(doc, afterChip)); // 11
console.log(fromGlobalOffset(doc, 11)); // Position { nodeIndex: 1, offset: 1 }

// -- pure edit primitives ----------------------------------------------------

// deleteDocumentRange / insertNodesAt are pure: they never mutate inputs.
const deleted = deleteDocumentRange(doc, {
  start: createPosition(0, 0),
  end: createPosition(1, 1), // "Summarize " + the mention chip
});
console.log(documentLength(deleted.document)); // 18 (" notes about " + variable)
console.log(documentLength(doc)); // 28 (original untouched)

const inserted = insertNodesAt(doc, createPosition(0, 0), [createTextNode('TODO: ')]);
console.log(inserted.document.nodes[0]); // TextNode { text: 'TODO: Summarize ' }

export { doc, deleted, inserted };
