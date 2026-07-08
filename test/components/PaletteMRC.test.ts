import { jest } from '@jest/globals';
import { createMockMarkdownPostProcessorContext } from '_mocks_/mockMarkdownPostProcessorContext';
import { PaletteMRC } from 'src/components/PaletteMRC';
import { ColorPaletteSettings, defaultSettings } from 'src/settings';
import { Status } from 'src/components/Palette';
import { setupMockPaletteConstructor, getMockPaletteConstructor } from '_mocks_/mockPaletteConstructor';
import { EventEmitter } from 'src/utils/EventEmitter';
import { createMockPalette } from '_mocks_/mockPalette';
import validateColor from 'validate-color';
import { parseUrl } from 'src/utils/basicUtils';
import { PaletteMenu } from 'src/components/PaletteMenu';

jest.mock('src/main', () => ({
  __esModule: true,
  default: class MockColorPalette {
    settings: ColorPaletteSettings = { ...defaultSettings };
    app: any = {
      workspace: {
        getActiveViewOfType: jest.fn(() => null),
      },
      metadataCache: {},
    };
    palettes: any[] = [];
  },
  urlRegex: /(?:https?:\/\/)?[a-zA-Z0-9]+\.[a-zA-Z0-9]+/,
}));

jest.mock('src/components/PaletteMenu', () => ({
  PaletteMenu: jest.fn().mockImplementation(function (this: any) {
    this.showAtMouseEvent = jest.fn();
  }),
}));

jest.mock('src/components/Palette', () => {
  const actual = jest.requireActual('src/components/Palette') as typeof import('src/components/Palette');
  return {
    ...actual,
    Palette: jest.fn(),
  };
});

jest.mock('src/utils/basicUtils', () => {
  const actual = jest.requireActual('src/utils/basicUtils') as typeof import('src/utils/basicUtils');
  return {
    ...actual,
    createPaletteBlock: jest.fn((obj) => JSON.stringify(obj)),
    getModifiedSettings: jest.fn((s) => s),
    parseUrl: jest.fn(() => ['#ffffff', '#000000']),
  };
});

jest.mock('validate-color', () => ({
  __esModule: true,
  default: jest.fn(() => true),
}));

function createPalettesArray() {
  const palettes: any[] = [];
  palettes.remove = (item: unknown) => {
    const index = palettes.indexOf(item);
    if (index > -1) palettes.splice(index, 1);
  };
  return palettes;
}

function createMockPlugin(overrides: Record<string, unknown> = {}) {
  return {
    settings: { ...defaultSettings },
    app: {
      workspace: {
        getActiveViewOfType: jest.fn(() => null),
      },
      metadataCache: {},
    },
    palettes: createPalettesArray(),
    ...overrides,
  };
}

function setupPaletteConstructorWithEmitter() {
  setupMockPaletteConstructor();
  const mockPaletteConstructor = getMockPaletteConstructor();
  mockPaletteConstructor.mockImplementation((colors, _settings, containerEl, _pluginSettings) => {
    const emitter = new EventEmitter<{ changed: [string[], unknown]; editMode: [boolean] }>();
    return createMockPalette({
      colors: Array.isArray(colors) ? colors : [],
      containerEl,
      status: Status.VALID,
      emitter,
      setEditMode: jest.fn(),
      reload: jest.fn(),
    });
  });
}

describe('PaletteMRC', () => {
  let mockPlugin: ReturnType<typeof createMockPlugin>;
  let mockContainerEl: HTMLElement;
  let mockInput: string;
  let mockContext: ReturnType<typeof createMockMarkdownPostProcessorContext>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(validateColor).mockReturnValue(true);
    setupPaletteConstructorWithEmitter();
    mockPlugin = createMockPlugin();
    mockContainerEl = document.createElement('div');
    mockInput = '#ff0000\n#00ff00\n#0000ff';
    mockContext = createMockMarkdownPostProcessorContext();
  });

  describe('PaletteMRC Constructor & Properties', () => {
    it('should instantiate correctly with provided arguments', () => {
      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);

      expect(paletteMrc.plugin).toBe(mockPlugin);
      expect(paletteMrc.input).toBe(mockInput);
      expect(paletteMrc.context).toBe(mockContext);
      expect(paletteMrc.containerEl).toBeDefined();
    });

    it('should set containerEl to the provided element', () => {
      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);

      expect(paletteMrc.containerEl).toBe(mockContainerEl);
    });

    it('should set pluginSettings from plugin.settings', () => {
      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);

      expect(paletteMrc.pluginSettings).toBe(mockPlugin.settings);
    });

    it('should create palette after onload', () => {
      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);

      expect(paletteMrc.palette).toBeUndefined();

      paletteMrc.onload();

      expect(paletteMrc.palette).toBeDefined();
      expect(mockPlugin.palettes).toContain(paletteMrc);
    });
  });

  describe('Direct color input', () => {
    it('passes multiline hex colors to Palette without metadata lookup', () => {
      const paletteMrc = new PaletteMRC(
        mockPlugin,
        mockContainerEl,
        '#ff0000\n#00ff00\n#0000ff',
        mockContext
      );
      paletteMrc.update();

      const mockPaletteConstructor = getMockPaletteConstructor();
      expect(mockPaletteConstructor).toHaveBeenCalled();
      expect(mockPaletteConstructor.mock.calls[0][0]).toEqual(['#ff0000', '#00ff00', '#0000ff']);
      expect(paletteMrc.palette.colors).toEqual(['#ff0000', '#00ff00', '#0000ff']);
    });

    it('splits comma-delimited colors on one line', () => {
      const paletteMrc = new PaletteMRC(
        mockPlugin,
        mockContainerEl,
        '#ff0000, #00ff00, #0000ff',
        mockContext
      );
      paletteMrc.update();

      expect(getMockPaletteConstructor().mock.calls[0][0]).toEqual(['#ff0000', '#00ff00', '#0000ff']);
    });

    it('splits semicolon-delimited rgb colors', () => {
      const paletteMrc = new PaletteMRC(
        mockPlugin,
        mockContainerEl,
        'rgb(255, 0, 0); rgb(0, 255, 0)',
        mockContext
      );
      paletteMrc.update();

      expect(getMockPaletteConstructor().mock.calls[0][0]).toEqual(['rgb(255, 0, 0)', 'rgb(0, 255, 0)']);
    });
  });

  describe('parseSettings', () => {
    it('parses JSON settings from the last input line', () => {
      const paletteMrc = new PaletteMRC(
        mockPlugin,
        mockContainerEl,
        '#ff0000\n{"height": 200, "width": 400}',
        mockContext
      );
      paletteMrc.update();

      const settings = getMockPaletteConstructor().mock.calls[0][1];
      expect(settings).toEqual(expect.objectContaining({ height: 200, width: 400 }));
    });

    it('falls back to plugin defaults when settings JSON is malformed', () => {
      const paletteMrc = new PaletteMRC(
        mockPlugin,
        mockContainerEl,
        '#ff0000\n{not valid json',
        mockContext
      );
      paletteMrc.update();

      const settings = getMockPaletteConstructor().mock.calls[0][1];
      expect(settings).toBe(Status.INVALID_SETTINGS);
    });
  });

  describe('parseColors validation', () => {
    it('returns INVALID_COLORS when validation fails and override is false', () => {
      jest.mocked(validateColor).mockImplementation((color) => color !== 'not-a-color');

      const paletteMrc = new PaletteMRC(
        mockPlugin,
        mockContainerEl,
        'not-a-color',
        mockContext
      );
      paletteMrc.update();

      expect(getMockPaletteConstructor().mock.calls[0][0]).toBe(Status.INVALID_COLORS);
    });

    it('allows invalid colors when override is true in settings', () => {
      jest.mocked(validateColor).mockReturnValue(false);

      const paletteMrc = new PaletteMRC(
        mockPlugin,
        mockContainerEl,
        'not-a-color\n{"override": true}',
        mockContext
      );
      paletteMrc.update();

      expect(getMockPaletteConstructor().mock.calls[0][0]).toEqual(['not-a-color']);
    });
  });

  describe('URL color extraction', () => {
    it('calls parseUrl for URL-like color entries', () => {
      const paletteMrc = new PaletteMRC(
        mockPlugin,
        mockContainerEl,
        'coolors.co/palette/test',
        mockContext
      );
      paletteMrc.update();

      expect(parseUrl).toHaveBeenCalledWith('coolors.co/palette/test');
      expect(paletteMrc.palette.colors).toEqual(['#ffffff', '#000000']);
    });
  });

  describe('Lifecycle and events', () => {
    it('unloads palette and removes itself from plugin.palettes', () => {
      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);
      paletteMrc.onload();

      paletteMrc.unload();

      expect(paletteMrc.palette.unload).toHaveBeenCalled();
      expect(mockPlugin.palettes).not.toContain(paletteMrc);
    });

    it('tracks editModeChanges when palette emits changed', () => {
      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);
      paletteMrc.update();

      paletteMrc.palette.emitter.emit('changed', ['#111111'], { height: 100 });

      expect(paletteMrc.editModeChanges).toEqual({
        colors: ['#111111'],
        settings: { height: 100 },
      });
    });

    it('shows PaletteMenu on contextmenu when palette is valid', () => {
      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);
      paletteMrc.onload();

      const event = new MouseEvent('contextmenu', { bubbles: true });
      paletteMrc.containerEl.dispatchEvent(event);

      expect(PaletteMenu).toHaveBeenCalled();
    });
  });

  describe('Editor I/O', () => {
    it('getPaletteInput returns editor range when section info is available', () => {
      const mockEditor = {
        getRange: jest.fn(() => '#ff0000\n#00ff00'),
      };
      mockPlugin.app.workspace.getActiveViewOfType.mockReturnValue({ editor: mockEditor });
      mockContext.getSectionInfo.mockReturnValue({ lineStart: 2, lineEnd: 4 });

      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);
      paletteMrc.onload();

      const result = paletteMrc.getPaletteInput();

      expect(result).toEqual({
        lines: { lineStart: 2, lineEnd: 4 },
        input: '#ff0000\n#00ff00',
      });
      expect(mockEditor.getRange).toHaveBeenCalledWith(
        { line: 2, ch: 0 },
        { line: 5, ch: 0 }
      );
    });

    it('setPaletteInput replaces editor range when section info is available', () => {
      const mockEditor = {
        replaceRange: jest.fn(),
      };
      mockPlugin.app.workspace.getActiveViewOfType.mockReturnValue({ editor: mockEditor });
      mockContext.getSectionInfo.mockReturnValue({ lineStart: 1, lineEnd: 3 });

      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);
      paletteMrc.onload();

      const result = paletteMrc.setPaletteInput('new palette block');

      expect(mockEditor.replaceRange).toHaveBeenCalledWith(
        'new palette block',
        { line: 1, ch: 0 },
        { line: 4, ch: 0 }
      );
      expect(result).toEqual({ lineStart: 1, lineEnd: 3 });
    });

    it('createNotice is invoked when editor is not ready', () => {
      const paletteMrc = new PaletteMRC(mockPlugin, mockContainerEl, mockInput, mockContext);
      paletteMrc.onload();
      const noticeSpy = jest.spyOn(paletteMrc, 'createNotice');

      paletteMrc.getPaletteInput();

      expect(noticeSpy).toHaveBeenCalledWith('The editor has not fully loaded yet.');
    });
  });
});
