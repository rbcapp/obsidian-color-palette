
import { ColorPaletteSettings } from "settings";
import { Palette } from "../../src/components/Palette";
import { Plugin } from 'obsidian';
import { mock } from 'ts-jest-mocker';




describe('A Palette', () => {
  const HTMLElementMock = mock<HTMLElement>();
  const ColorPaletteSettingsMock = mock<ColorPaletteSettings>();

  describe('can be constructed', () => {
    it('should be able to execute test', () => {
      expect(Palette).toBeTruthy();
    });
  });
});

describe('Palette', () => {
	// Mock Plugin to avoid errors during instantiation
	const mockPlugin = {
		addCommand: jest.fn(),
		addStatusBarItem: jest.fn(),
		addIcon: jest.fn(),
		getIcon: jest.fn(),
		loadLayout: jest.fn(),
		saveLayout: jest.fn(),
		onLayoutChange: jest.fn(),
		trigger: jest.fn(),
		triggerRefetch: jest.fn()
	} as unknown as Plugin;


	const mockHTMLElement = {
		addClass:jest.fn()
	}

	it('should set the width and update the CSS variable on the dropzone', () => {
		// Arrange
		const dropzone = document.createElement('div');
		const colors = ['#FFFFFF', '#000000'];
		const settings = {
			height: 50,
			direction: 'row',
			showLabel: false
		};

		const palette = new Palette(colors, settings, dropzone, mockPlugin);
		
		// Initialize the palette (this sets up the dropzone reference)
		palette.create(dropzone, colors, settings, mockPlugin);

		// Act
		const newWidth = 300;
		palette.setWidth(newWidth);

		// Assert
		expect(dropzone.style.getPropertyValue('--palette-width')).toBe(`${newWidth}px`);
	});
});
