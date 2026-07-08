import { Editor } from 'obsidian';

type Cursor = { line: number; ch: number };

export class MockEditor extends Editor {
  lines: string[];
  cursor: Cursor;
  selected = false;
  selection = '';
  lastCursor: Cursor | null = null;

  constructor(initialLines: string[] = ['']) {
    super();
    this.lines = [...initialLines];
    this.cursor = { line: 0, ch: 0 };
  }

  getSelection() {
    return this.selection;
  }

  getLine(line: number) {
    return this.lines[line] ?? '';
  }

  getCursor(_side?: string) {
    return { ...this.cursor };
  }

  setCursor(cursor: Cursor) {
    this.lastCursor = { ...cursor };
    this.cursor = { ...cursor };
  }

  getRange(_from: Cursor, _to: Cursor) {
    return this.selection;
  }

  replaceRange(replacement: string, from: Cursor, to?: Cursor) {
    if (to === undefined) {
      const line = from.line;
      while (this.lines.length <= line) {
        this.lines.push('');
      }
      const before = this.lines[line].slice(0, from.ch);
      const after = this.lines[line].slice(from.ch);
      this.lines[line] = before + replacement + after;
      return;
    }

    const startLine = from.line;
    const endLine = to.line;

    if (startLine === endLine) {
      const line = this.lines[startLine];
      this.lines[startLine] = line.slice(0, from.ch) + replacement + line.slice(to.ch);
      return;
    }

    const first = this.lines[startLine].slice(0, from.ch) + replacement;
    const last = this.lines[endLine].slice(to.ch);
    this.lines.splice(startLine, endLine - startLine + 1, first + last);
  }

  replaceSelection(replacement: string) {
    this.selection = replacement;
    if (this.selected) {
      this.lines[this.cursor.line] = replacement;
    }
  }

  somethingSelected() {
    return this.selected;
  }

  lineCount() {
    return this.lines.length;
  }

  lastLine() {
    return this.lines.length - 1;
  }
}

export function createMockEditor(initialLines: string[] = ['']): MockEditor {
  return new MockEditor(initialLines);
}
