
import { EventEmitter } from "utils/EventEmitter";
import { AliasMode, Direction } from 'settings';
import { PaletteItem, PaletteItemSettings } from "components/PaletteItem";

/**
 * Default mock settings for PaletteItem
 */
const DEFAULT_SETTINGS: PaletteItemSettings = {
  aliasMode: AliasMode.Both,
  stabilityWhileEditing: false,
  height: 30,
  direction: Direction.Row,
  hover: true,
  hideText: false,
  alias: 'Test Alias',
  editMode: false,
  colorCount: 5,
};

/**
 * Creates a mock EventEmitter for testing
 */
const createMockEmitter = (): EventEmitter<any> => {
  return {
    on: jest.fn(),
    emit: jest.fn(),
    clear: jest.fn(),
  } as unknown as EventEmitter<any>;
};

/**
 * Creates a properly typed mock PaletteItem with sensible defaults
 * @param overrides Optional property overrides for test-specific customization
 * @returns A fully typed PaletteItem mock
 * 
 * @example
 * // Basic usage
 * const mockItem = createMockPaletteItem();
 * 
 * @example
 * // Custom color
 * const redItem = createMockPaletteItem({ color: '#FF0000' });
 * 
 * @example
 * // Custom settings
 * const customItem = createMockPaletteItem({
 *   settings: { ...DEFAULT_SETTINGS, editMode: true }
 * });
 */
export const createMockPaletteItem = (
  overrides?: Partial<PaletteItem>
): PaletteItem => {
  const baseMock: PaletteItem = {
    container: document.createElement('div'),
    color: '#000000',
    settings: DEFAULT_SETTINGS,
    emitter: createMockEmitter(),
    load: jest.fn(),
    unload: jest.fn(),
  }as unknown as PaletteItem;

  return {
    ...baseMock,
    ...overrides,
  } as PaletteItem;
};

/**
 * Creates a mock PaletteItem with all methods spied (for assertion testing)
 * @param overrides Optional property overrides
 * @returns A jest.Mocked version of PaletteItem
 * 
 * @example
 * const spiedItem = createSpiedMockPaletteItem();
 * paletteItems.push(spiedItem);
 * // ... test code ...
 * expect(spiedItem.unload).toHaveBeenCalled();
 */
export const createSpiedMockPaletteItem = (
  overrides?: Partial<PaletteItem>
): jest.Mocked<PaletteItem> => {
  return createMockPaletteItem(overrides) as jest.Mocked<PaletteItem>;
};

/**
 * Creates multiple mock PaletteItems at once
 * @param count Number of mocks to create
 * @param overridesArray Optional array of overrides for each mock
 * @returns Array of PaletteItem mocks
 * 
 * @example
 * const mockItems = createMockPaletteItems(3, [
 *   { color: '#FF0000' },
 *   { color: '#00FF00' },
 *   { color: '#0000FF' },
 * ]);
 */
export const createMockPaletteItems = (
  count: number,
  overridesArray?: Partial<PaletteItem>[]
): PaletteItem[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockPaletteItem(overridesArray?.[index])
  );
};

/**
 * Builder pattern for complex mock configurations
 * Use this when you need to set up multiple interdependent properties
 * 
 * @example
 * const mockItem = new MockPaletteItemBuilder()
 *   .withColor('#FF0000')
 *   .withAlias('Red')
 *   .withEditMode(true)
 *   .build();
 */
export class MockPaletteItemBuilder {
  private mock: PaletteItem;

  constructor() {
    this.mock = createMockPaletteItem();
  }

  withColor(color: string): MockPaletteItemBuilder {
    this.mock.color = color;
    return this;
  }

  withAlias(alias: string): MockPaletteItemBuilder {
    this.mock.settings.alias = alias;
    return this;
  }

  withEditMode(editMode: boolean): MockPaletteItemBuilder {
    this.mock.settings.editMode = editMode;
    return this;
  }

  withHeight(height: number): MockPaletteItemBuilder {
    this.mock.settings.height = height;
    return this;
  }

  withColorCount(count: number): MockPaletteItemBuilder {
    this.mock.settings.colorCount = count;
    return this;
  }

  withContainer(container: HTMLDivElement): MockPaletteItemBuilder {
    this.mock.container = container;
    return this;
  }

  withSettings(settings: Partial<PaletteItemSettings>): MockPaletteItemBuilder {
    this.mock.settings = { ...this.mock.settings, ...settings };
    return this;
  }

  build(): PaletteItem {
    return this.mock;
  }

  buildSpied(): jest.Mocked<PaletteItem> {
    return this.mock as jest.Mocked<PaletteItem>;
  }
}