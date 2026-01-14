
import {PaletteMRC} from "../../src/components/PaletteMRC";


describe('MyPlugin Tests', () => {

  it('should be able to execute test', () => {
    expect("hello").toBeTruthy();
  });
});

// this is necessary to conform the isolatedModules compiler option and can be removed as soon as an import is added
//export {};