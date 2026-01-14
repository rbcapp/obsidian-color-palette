
import { ColorPaletteSettings } from "settings";
import {Palette} from "../../src/components/Palette";
import { mock } from 'ts-jest-mocker';



describe('A Palette', () => {
    //const HTMLElementMock = mock<HTMLElement>();
    //const ColorPaletteSettingsMock = mock<ColorPaletteSettings>();
    //HTMLElementMock.addClass.mockReturnValue();
    //HTMLElementMock.createEl.mockReturnValue();
    describe('can be constructed', () => {
        //var palette = new Palette(["0,0,0"],undefined,HTMLElementMock,ColorPaletteSettingsMock);
  it('should be able to execute test', () => {
    expect(Palette).toBeTruthy();
    });
  });
});

// this is necessary to conform the isolatedModules compiler option and can be removed as soon as an import is added
//export {};