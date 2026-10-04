import { describe, expect, it } from 'vitest';
import { createMentionNode, createTextNode } from './nodes';
import {
  createDocument,
  documentLength,
  deleteDocumentRange,
  documentsEqual,
  findNodeIndex,
  insertNodesAt,
  isEmptyDocument,
  nodeLength,
  normalizeNodes,
} from './document';
import { createPosition, createSelection, fromGlobalOffset, toGlobalOffset } from './selection';

describe('document model', () => {
  it('creates an empty document', () => {
    const doc = createDocument();
    expect(doc.nodes).toEqual([]);
    expect(isEmptyDocument(doc)).toBe(true);
    expect(documentLength(doc)).toBe(0);
  });

  it('coerces metadata and keeps node order', () => {
    const doc = createDocument([createTextNode('hi'), createMentionNode({ id: 'u1', label: 'Ada' })], {
      sessionId: 's1',
    });
    expect(doc.metadata).toEqual({ sessionId: 's1' });
    expect(doc.nodes.map((n) => n.type)).toEqual(['text', 'mention']);
  });

  it('measures node length (atomic nodes are length 1)', () => {
    expect(nodeLength(createTextNode('hello'))).toBe(5);
    expect(nodeLength(createMentionNode({ id: 'u1', label: 'Ada Lovelace' }))).toBe(1);
  });

  it('merges adjacent text nodes and drops empty ones', () => {
    const merged = normalizeNodes([
      createTextNode('ab'),
      createTextNode(''),
      createTextNode('cd'),
      createMentionNode({ id: 'u1', label: 'Ada' }),
      createTextNode('ef'),
    ]);
    expect(merged).toHaveLength(3);
    expect(merged[0]).toMatchObject({ type: 'text', text: 'abcd' });
  });

  it('round-trips global offsets', () => {
    const doc = createDocument([
      createTextNode('ab'),
      createMentionNode({ id: 'u1', label: 'Ada' }),
      createTextNode('cd'),
    ]);
    // 0:a 1:b 2:|chip| 3:c 4:d
    expect(toGlobalOffset(doc, createPosition(0, 2))).toBe(2);
    expect(toGlobalOffset(doc, createPosition(1, 1))).toBe(3);
    expect(toGlobalOffset(doc, createPosition(2, 0))).toBe(3);
    expect(fromGlobalOffset(doc, 3)).toEqual(createPosition(2, 0));
    expect(fromGlobalOffset(doc, 5)).toEqual(createPosition(2, 2));
  });

  it('deletes a range spanning nodes and reports the caret', () => {
    const doc = createDocument([
      createTextNode('hello '),
      createMentionNode({ id: 'u1', label: 'Ada' }),
      createTextNode(' world'),
    ]);
    // (0,5)=global 5 ("hello|"), (2,1)=global 8 (inside " world" after its space)
    const result = deleteDocumentRange(doc, {
      start: createPosition(0, 5),
      end: createPosition(2, 1),
    });
    // chip + the leading space of " world" are gone; text runs merge
    expect(result.document.nodes.map((n) => (n.type === 'text' ? n.text : n.type))).toEqual([
      'helloworld',
    ]);
    // caret sits where the deleted range began (global offset 5)
    expect(toGlobalOffset(result.document, result.caret)).toBe(5);
  });

  it('deletes an atomic node fully when the range covers it', () => {
    const doc = createDocument([
      createTextNode('a'),
      createMentionNode({ id: 'u1', label: 'Ada' }),
      createTextNode('b'),
    ]);
    const result = deleteDocumentRange(doc, {
      start: createPosition(1, 0),
      end: createPosition(1, 1),
    });
    // adjacent text runs merge once the chip between them disappears
    expect(result.document.nodes.map((n) => (n.type === 'text' ? n.text : n.type))).toEqual(['ab']);
  });

  it('inserts nodes at a position, splitting text nodes', () => {
    const doc = createDocument([createTextNode('hello')]);
    const mention = createMentionNode({ id: 'u1', label: 'Ada' });
    const result = insertNodesAt(doc, createPosition(0, 2), [mention]);
    expect(result.document.nodes).toHaveLength(3);
    expect(result.document.nodes[0]).toMatchObject({ type: 'text', text: 'he' });
    expect(result.document.nodes[1]).toBe(mention);
    expect(toGlobalOffset(result.document, result.caret)).toBe(3);
  });

  it('finds nodes by key', () => {
    const mention = createMentionNode({ id: 'u1', label: 'Ada' });
    const doc = createDocument([createTextNode('hi '), mention]);
    expect(findNodeIndex(doc, mention.key)).toBe(1);
    expect(findNodeIndex(doc, 'missing')).toBe(-1);
  });

  it('compares documents structurally (keys matter)', () => {
    const text = createTextNode('x');
    const a = createDocument([text]);
    // same node instances → equal
    expect(documentsEqual(a, createDocument([text]))).toBe(true);
    expect(documentsEqual(a, a)).toBe(true);
    // different keys, same text → not equal (node identity is part of the value)
    expect(documentsEqual(a, createDocument([createTextNode('x')]))).toBe(false);
    expect(documentsEqual(a, createDocument([createTextNode('y')]))).toBe(false);
  });

  it('keeps selection usable on empty documents', () => {
    const doc = createDocument();
    expect(fromGlobalOffset(doc, 0)).toEqual(createPosition(0, 0));
    expect(toGlobalOffset(doc, createPosition(0, 0))).toBe(0);
    expect(createSelection(createPosition(0, 0)).anchor).toEqual(createPosition(0, 0));
  });
});
