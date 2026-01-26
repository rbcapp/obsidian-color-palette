export class Modal {
  open() {}
  close() {}
  contentEl = {
    createEl: jest.fn((str:string) => HTMLElement),
    empty: jest.fn(),
  };
}