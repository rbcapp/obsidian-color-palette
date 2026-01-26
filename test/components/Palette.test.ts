
import { ColorPaletteSettings } from "settings";
import { Palette } from "../../src/components/Palette";
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
