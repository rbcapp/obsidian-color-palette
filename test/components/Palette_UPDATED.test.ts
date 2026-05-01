import { AliasMode, ColorPaletteSettings, CopyFormat, Direction } from "settings";
import { Palette, PaletteSettings, Status } from "../../src/components/Palette";
import { createMockHTMLElement } from "../../_mocks_/mockHTMLElement";
import { createMockPaletteItem } from "../../_mocks_/mockPaletteItem";
import { PaletteItem } from "components/PaletteItem";
import { Canvas } from "utils/canvasUtils";
import { MockCanvasBuilder, createMockCanvas } from "../../_mocks_/utils/mockCanvasUtils";

jest.mock("components/PaletteItem");

// Mock Canvas using your existing MockCanvasBuilder pattern
jest.mock("utils/canvasUtils", () => {
	return {
		Canvas: jest.fn().mockImplementation((container: HTMLElement) => {
			const mockCanvas = new MockCanvasBuilder()
				.withContainer(container)
				.build();
			
			// Add methods that are called by Palette
			return {
				...mockCanvas,
				createGradient: jest.fn(),
				getCanvasHex: jest.fn(() => '#FFFFFF'),
				setTooltipPosition: jest.fn(),
				isTouchEnabled: jest.fn(() => false)
			};
		})
	};
});

describe('A Palette', () => {
	let containerDiv: ReturnType<typeof createMockHTMLElement>;
	let paletteContainerDiv: ReturnType<typeof createMockHTMLElement>;
	let dropzoneDiv: ReturnType<typeof createMockHTMLElement>;
	let testColors: string[];
	let paletteSettings: PaletteSettings;
	let pluginSettings: ColorPaletteSettings;
	let editMode: boolean;

	let paletteItem1: ReturnType<typeof createMockPaletteItem>;
	let paletteItem2: ReturnType<typeof createMockPaletteItem>;
	let paletteItem3: ReturnType<typeof createMockPaletteItem>;

	beforeEach(() => {
		const mockPaletteItemConstructor = jest.mocked(PaletteItem);

		global.ResizeObserver = jest.fn().mockImplementation(() => ({
			observe: jest.fn(),
			unobserve: jest.fn(),
			disconnect: jest.fn()
		})) as any;

		pluginSettings = {
			noticeDuration: 5000,
			errorPulse: false,
			aliasMode: AliasMode.Both,
			corners: false,
			stabilityWhileEditing: false,
			reloadDelay: 1000,
			copyFormat: CopyFormat.Raw,
			height: 50,
			width: 100,
			direction: Direction.Column,
			gradient: false,
			hover: false,
			hideText: false,
			override: false
		};

		paletteSettings = {
			height: 50,
			width: 100,
			direction: Direction.Column,
			gradient: false,
			hover: false,
			hideText: true,
			override: false,
			aliases: []
		};

		testColors = ["lightBlue", "#CBA", "rgb(236, 947, 50)"];
		editMode = false;

		containerDiv = createMockHTMLElement();
		dropzoneDiv = createMockHTMLElement();

		// Setup proper method chaining for containerDiv
		containerDiv.addClass.mockImplementation(() => containerDiv);
		containerDiv.createEl.mockReturnValue(dropzoneDiv);
		containerDiv.empty.mockImplementation(() => containerDiv);
		containerDiv.appendChild.mockImplementation((el: any) => el);

		// Setup proper method chaining and properties for dropzoneDiv
		dropzoneDiv.addClass.mockImplementation(() => dropzoneDiv);
		dropzoneDiv.toggleClass.mockImplementation(() => dropzoneDiv);
		dropzoneDiv.createEl.mockImplementation(() => {
			const mockEl = createMockHTMLElement();
			mockEl.toggleClass.mockImplementation(() => mockEl);
			mockEl.createEl.mockImplementation(() => createMockHTMLElement());
			return mockEl;
		});
		dropzoneDiv.appendChild.mockImplementation((el: any) => el);
		
		// Setup style property
		dropzoneDiv.style = {
			setProperty: jest.fn(),
			left: '',
			top: ''
		} as any;
		
		// Setup dimensions
		Object.defineProperty(dropzoneDiv, 'offsetWidth', {
			value: 100,
			writable: true,
			configurable: true
		});
		Object.defineProperty(dropzoneDiv, 'offsetHeight', {
			value: 50,
			writable: true,
			configurable: true
		});
		
		// Setup children property
		Object.defineProperty(dropzoneDiv, 'children', {
			value: [],
			writable: true,
			configurable: true
		});

		// Clear mock state
		mockPaletteItemConstructor.mockClear();
		jest.mocked(Canvas).mockClear();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("when constructed", () => {

		it("parameters are assigned", () => {
			// Execute
			const palette = new Palette(testColors, paletteSettings, containerDiv, pluginSettings, editMode);

			// Assert - Fixed: Added parentheses to toBeTruthy()
			expect(palette).toBeTruthy();
			expect(palette.containerEl).toEqual(containerDiv);
			expect(palette.pluginSettings).toEqual(pluginSettings);
			expect(palette.showNotice).toEqual(true);
			expect(palette.getEditMode()).toEqual(editMode);
			expect(palette.emitter).toBeTruthy();
		});

		it("adds the class to the container element", () => {
			// Execute
			const palette = new Palette(testColors, paletteSettings, containerDiv, pluginSettings, editMode);

			// Assert
			expect(containerDiv.addClass).toHaveBeenNthCalledWith(1, 'palette-container');
		});
	});


	describe('with valid colors and valid settings', () => {
		it('should assign valid colors', () => {
			// Execute
			const palette = new Palette(testColors, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.colors).toEqual(testColors);
		});

		it('should assign valid settings', () => {
			// Execute
			const palette = new Palette(testColors, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.settings).toEqual(expect.objectContaining({
				height: paletteSettings.height,
				width: paletteSettings.width,
				direction: paletteSettings.direction,
				gradient: paletteSettings.gradient,
				hover: paletteSettings.hover,
				hideText: paletteSettings.hideText,
				override: paletteSettings.override,
				aliases: paletteSettings.aliases
			}));
		});

		it('should set status to VALID', () => {
			// Execute
			const palette = new Palette(testColors, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.status).toBe(Status.VALID);
		});

		it('should merge plugin settings with palette settings (palette settings take precedence)', () => {
			// Setup
			const customPaletteSettings: PaletteSettings = {
				height: 75,
				width: 200,
				direction: Direction.Row,
				gradient: true,
				hover: true,
				hideText: false,
				override: true,
				aliases: ['red', 'blue']
			};

			// Clear Canvas mock to track this specific call
			jest.mocked(Canvas).mockClear();

			// Execute
			const palette = new Palette(testColors, customPaletteSettings, containerDiv, pluginSettings);

			// Assert - Palette settings should override plugin settings
			expect(palette.settings.height).toBe(75);
			expect(palette.settings.width).toBe(200);
			expect(palette.settings.direction).toBe(Direction.Row);
			expect(palette.settings.gradient).toBe(true);
			expect(palette.settings.hover).toBe(true);
			expect(palette.settings.hideText).toBe(false);
			expect(palette.settings.override).toBe(true);
			expect(palette.settings.aliases).toEqual(['red', 'blue']);
			
			// Verify Canvas was created for gradient palette
			expect(Canvas).toHaveBeenCalled();
		});
	});

	describe('with invalid colors (as string)', () => {
		// it('should set colors to empty array', () => {
		// 	// Execute
		// 	const palette = new Palette(Status.INVALID_COLORS, paletteSettings, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.colors).toEqual([]);
		// });

		// it('should set status to INVALID_COLORS when only colors are invalid', () => {
		// 	// Execute
		// 	const palette = new Palette(Status.INVALID_COLORS, paletteSettings, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.status).toBe(Status.INVALID_COLORS);
		// });

		// it('should set status to INVALID_COLORS_AND_SETTINGS when both colors and settings are invalid', () => {
		// 	// Execute
		// 	const palette = new Palette(Status.INVALID_COLORS, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.status).toBe(Status.INVALID_COLORS_AND_SETTINGS);
		// });

		// it('should use fallback settings from pluginSettings', () => {
		// 	// Execute
		// 	const palette = new Palette(Status.INVALID_COLORS, paletteSettings, containerDiv, pluginSettings);

		// 	// Assert - Settings should come from palette settings override with plugin fallback
		// 	expect(palette.settings).toBeDefined();
		// 	expect(palette.settings.height).toBe(paletteSettings.height);
		// 	expect(palette.settings.width).toBe(paletteSettings.width);
		// });
	});

	describe('with invalid settings (as string)', () => {
		// it('should fall back to pluginSettings converted to PaletteSettings', () => {
		// 	// Execute
		// 	const palette = new Palette(testColors, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.settings).toBeDefined();
		// 	expect(palette.settings.height).toBe(pluginSettings.height);
		// 	expect(palette.settings.width).toBe(pluginSettings.width);
		// 	expect(palette.settings.direction).toBe(pluginSettings.direction);
		// });

		// it('should set status to INVALID_SETTINGS', () => {
		// 	// Execute
		// 	const palette = new Palette(testColors, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.status).toBe(Status.INVALID_SETTINGS);
		// });

		// it('should not override colors with invalid settings', () => {
		// 	// Execute
		// 	const palette = new Palette(testColors, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.colors).toEqual(testColors);
		// });

		// it('should have colors but invalid settings status', () => {
		// 	// Execute
		// 	const palette = new Palette(testColors, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.colors.length).toBeGreaterThan(0);
		// 	expect(palette.status).toBe(Status.INVALID_SETTINGS);
		// });
	});

	describe('with undefined settings', () => {
		it('should fall back to pluginSettings converted to PaletteSettings', () => {
			// Execute
			const palette = new Palette(testColors, undefined, containerDiv, pluginSettings);

			// Assert
			expect(palette.settings).toBeDefined();
			expect(palette.settings.height).toBe(pluginSettings.height);
			expect(palette.settings.width).toBe(pluginSettings.width);
			expect(palette.settings.direction).toBe(pluginSettings.direction);
			expect(palette.settings.gradient).toBe(pluginSettings.gradient);
		});

		it('should set status to VALID when colors are valid and settings are undefined', () => {
			// Execute
			const palette = new Palette(testColors, undefined, containerDiv, pluginSettings);

			// Assert
			expect(palette.status).toBe(Status.VALID);
		});

		it('should assign valid colors when settings are undefined', () => {
			// Execute
			const palette = new Palette(testColors, undefined, containerDiv, pluginSettings);

			// Assert
			expect(palette.colors).toEqual(testColors);
		});

		it('should include aliases array from fallback settings', () => {
			// Execute
			const palette = new Palette(testColors, undefined, containerDiv, pluginSettings);

			// Assert
			expect(palette.settings.aliases).toBeDefined();
			expect(Array.isArray(palette.settings.aliases)).toBe(true);
		});
	});

	describe('with both colors and settings invalid', () => {
		// it('should set colors to empty array', () => {
		// 	// Execute
		// 	const palette = new Palette(Status.INVALID_COLORS, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.colors).toEqual([]);
		// });

		// it('should fall back to pluginSettings for settings', () => {
		// 	// Execute
		// 	const palette = new Palette(Status.INVALID_COLORS, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.settings.height).toBe(pluginSettings.height);
		// 	expect(palette.settings.width).toBe(pluginSettings.width);
		// });

		// it('should set status to INVALID_COLORS_AND_SETTINGS', () => {
		// 	// Execute
		// 	const palette = new Palette(Status.INVALID_COLORS, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Assert
		// 	expect(palette.status).toBe(Status.INVALID_COLORS_AND_SETTINGS);
		// });

		// it('should be recoverable from invalid state when settings object is passed', () => {
		// 	// Setup
		// 	const invalidPalette = new Palette(Status.INVALID_COLORS, Status.INVALID_SETTINGS, containerDiv, pluginSettings);

		// 	// Execute - Call setDefaults again with valid data
		// 	invalidPalette.setDefaults(testColors, paletteSettings);

		// 	// Assert
		// 	expect(invalidPalette.colors).toEqual(testColors);
		// 	expect(invalidPalette.status).toBe(Status.VALID);
		// });
	});

	describe('with various color formats', () => {
		it('should accept named colors', () => {
			// Setup
			const namedColors = ['red', 'blue', 'green'];

			// Execute
			const palette = new Palette(namedColors, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.colors).toEqual(namedColors);
		});

		it('should accept hex colors', () => {
			// Setup
			const hexColors = ['#FF0000', '#00FF00', '#0000FF'];

			// Execute
			const palette = new Palette(hexColors, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.colors).toEqual(hexColors);
		});

		it('should accept rgb colors', () => {
			// Setup
			const rgbColors = ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)'];

			// Execute
			const palette = new Palette(rgbColors, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.colors).toEqual(rgbColors);
		});

		it('should accept mixed color formats', () => {
			// Setup
			const mixedColors = ['red', '#00FF00', 'rgb(0, 0, 255)'];

			// Execute
			const palette = new Palette(mixedColors, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.colors).toEqual(mixedColors);
		});

		it('should accept empty color array', () => {
			// Setup
			const emptyColors: string[] = [];

			// Execute
			const palette = new Palette(emptyColors, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.colors).toEqual([]);
		});

		it('should accept single color', () => {
			// Setup
			const singleColor = ['#FFFFFF'];

			// Execute
			const palette = new Palette(singleColor, paletteSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.colors).toEqual(singleColor);
		});
	});

	describe('settings merging behavior', () => {
		// it('should preserve all palette settings properties when merging', () => {
		// 	// Setup
		// 	const customSettings: PaletteSettings = {
		// 		height: 100,
		// 		width: 150,
		// 		direction: Direction.Row,
		// 		gradient: true,
		// 		hover: true,
		// 		hideText: false,
		// 		override: true,
		// 		aliases: ['primary', 'secondary']
		// 	};

		// 	// Execute
		// 	const palette = new Palette(testColors, customSettings, containerDiv, pluginSettings);

		// 	// Assert - All properties should be preserved
		// 	expect(Object.keys(palette.settings)).toContain('height');
		// 	expect(Object.keys(palette.settings)).toContain('width');
		// 	expect(Object.keys(palette.settings)).toContain('direction');
		// 	expect(Object.keys(palette.settings)).toContain('gradient');
		// 	expect(Object.keys(palette.settings)).toContain('hover');
		// 	expect(Object.keys(palette.settings)).toContain('hideText');
		// 	expect(Object.keys(palette.settings)).toContain('override');
		// 	expect(Object.keys(palette.settings)).toContain('aliases');
		// });

		it('should handle partial palette settings overrides', () => {
			// Setup
			const partialSettings: Partial<PaletteSettings> = {
				height: 75,
				width: 200
			};

			// Execute
			const palette = new Palette(testColors, partialSettings as PaletteSettings, containerDiv, pluginSettings);

			// Assert - Partial settings should override, rest filled from plugin settings
			expect(palette.settings.height).toBe(75);
			expect(palette.settings.width).toBe(200);
			expect(palette.settings.direction).toBeDefined();
		});

		it('should preserve plugin settings for properties not in palette settings', () => {
			// Setup
			const minimalSettings: PaletteSettings = {
				height: 60,
				width: 120,
				direction: Direction.Row,
				gradient: false,
				hover: false,
				hideText: false,
				override: false,
				aliases: []
			};

			// Execute
			const palette = new Palette(testColors, minimalSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.settings.height).toBe(minimalSettings.height);
			expect(palette.settings.width).toBe(minimalSettings.width);
		});
	});

	describe('edge cases', () => {
		it('should handle calling setDefaults multiple times', () => {
			// Setup
			const palette = new Palette(testColors, paletteSettings, containerDiv, pluginSettings);
			const newColors = ['#111111', '#222222'];
			const newSettings: PaletteSettings = {
				height: 80,
				width: 160,
				direction: Direction.Row,
				gradient: true,
				hover: true,
				hideText: true,
				override: false,
				aliases: []
			};

			// Execute
			palette.setDefaults(newColors, newSettings);

			// Assert - Should update with new values
			expect(palette.colors).toEqual(newColors);
			expect(palette.settings.height).toBe(80);
			expect(palette.settings.direction).toBe(Direction.Row);
		});

		it('should handle switching from valid to invalid state', () => {
			// Setup
			const palette = new Palette(testColors, paletteSettings, containerDiv, pluginSettings);
			expect(palette.status).toBe(Status.VALID);

			// Execute - Switch to invalid state
			palette.setDefaults(Status.INVALID_COLORS, Status.INVALID_SETTINGS);

			// Assert
			expect(palette.status).toBe(Status.INVALID_COLORS_AND_SETTINGS);
			expect(palette.colors).toEqual([]);
		});

		it('should handle empty aliases array in settings', () => {
			// Setup
			const settingsWithEmptyAliases: PaletteSettings = {
				...paletteSettings,
				aliases: []
			};

			// Execute
			const palette = new Palette(testColors, settingsWithEmptyAliases, containerDiv, pluginSettings);

			// Assert
			expect(palette.settings.aliases).toEqual([]);
		});

		it('should handle aliases array with same length as colors', () => {
			// Setup
			const settingsWithAliases: PaletteSettings = {
				...paletteSettings,
				aliases: ['primary', 'secondary', 'tertiary']
			};

			// Execute
			const palette = new Palette(testColors, settingsWithAliases, containerDiv, pluginSettings);

			// Assert
			expect(palette.settings.aliases.length).toBe(palette.colors.length);
			expect(palette.settings.aliases).toEqual(['primary', 'secondary', 'tertiary']);
		});

		it('should handle aliases array longer than colors array', () => {
			// Setup
			const settingsWithExtraAliases: PaletteSettings = {
				...paletteSettings,
				aliases: ['primary', 'secondary', 'tertiary', 'extra']
			};

			// Execute
			const palette = new Palette(testColors, settingsWithExtraAliases, containerDiv, pluginSettings);

			// Assert
			expect(palette.settings.aliases.length).toBe(4);
		});
	});

	describe('type validation', () => {
		// Type validation tests can be added here
		// These test runtime type checking behavior
	});

	describe('with gradient palettes', () => {
		it('should create a Canvas instance for gradient palettes', () => {
			// Setup
			jest.mocked(Canvas).mockClear();
			const gradientSettings: PaletteSettings = {
				...paletteSettings,
				gradient: true
			};

			// Execute
			const palette = new Palette(testColors, gradientSettings, containerDiv, pluginSettings);

			// Assert
			expect(Canvas).toHaveBeenCalledWith(dropzoneDiv);
			expect(palette.paletteCanvas).toBeDefined();
		});

		it('should set up click listener on gradient canvas', () => {
			// Setup
			const gradientSettings: PaletteSettings = {
				...paletteSettings,
				gradient: true
			};

			const mockCanvasInstance = new MockCanvasBuilder()
				.withDimensions(200, 100)
				.spyOnClickEmission()
				.buildSpied();

			jest.mocked(Canvas).mockReturnValueOnce(mockCanvasInstance as any);

			// Execute
			const palette = new Palette(testColors, gradientSettings, containerDiv, pluginSettings);

			// Assert
			expect(mockCanvasInstance.emitter.on).toHaveBeenCalledWith('click', expect.any(Function));
		});

		it('should handle gradient with custom dimensions', () => {
			// Setup
			jest.mocked(Canvas).mockClear();
			const customGradientSettings: PaletteSettings = {
				height: 150,
				width: 500,
				direction: Direction.Column,
				gradient: true,
				hover: true,
				hideText: false,
				override: false,
				aliases: []
			};

			// Execute
			const palette = new Palette(testColors, customGradientSettings, containerDiv, pluginSettings);

			// Assert
			expect(palette.settings.height).toBe(150);
			expect(palette.settings.width).toBe(500);
			expect(Canvas).toHaveBeenCalled();
		});
	});
});