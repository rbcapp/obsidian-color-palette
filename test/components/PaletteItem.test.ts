
import { AliasMode, Direction } from "../../src/settings";
import { Palette } from "../../src/components/Palette";
import { mock } from 'ts-jest-mocker';
import { PaletteItem, PaletteItemSettings } from "components/PaletteItem";
import { JSDOM } from 'jsdom';

describe('A PaletteItem', () => {
  const defaultPaletteItemSetting: PaletteItemSettings = {
    aliasMode: AliasMode.Both,
    stabilityWhileEditing: true,
    height: 100,
    direction: Direction.Column,
    hover: false,
    hideText: false,
    alias: "",
    editMode: false,
    colorCount: 1
  };
  var testColor = " blue ";
  const div = document.createElement("div");
  var paletteItem = new PaletteItem(div, testColor, defaultPaletteItemSetting);
  it('can be constucted', () => {
    expect(paletteItem).toBeTruthy();
  });

  it('holds its settings', () => {
    expect(paletteItem.settings).toEqual(defaultPaletteItemSetting);
  });
  it('Adds an emitter', () => {
    expect(paletteItem.emitter).toBeDefined();
  });
  it('HTMLContainer adds exactly 1 div child', () => {
    expect(div.children.length).toEqual(1);
    expect(div.children[0].tagName).toMatch("DIV");
  });

  describe("has a container div", () => {
    const childDiv = div.children[0] as HTMLDivElement;
    it('with a background matching the passed color', () => {
      expect(childDiv.style.getPropertyValue("--palette-background-color")).toEqual("blue");
    });
  });

  const colorTestArray = [
    { inputColor: " light blue ", verifiedColor: "light blue" },
    { inputColor: " blue ", verifiedColor: "blue" },
    { inputColor: "#FFF", verifiedColor: "#FFF" },
  ];
  describe("trims whitespace from color input:", () => {
    test.concurrent.each(colorTestArray)("'$inputColor' to '$verifiedColor'", ({ inputColor, verifiedColor }) => {
      const div = document.createElement("div");
      const paletteItem = new PaletteItem(div, inputColor, defaultPaletteItemSetting);
      expect(paletteItem.color).toMatch(verifiedColor);
    });
  });


  const flexTestArray = [
    { colors: 1, height: 100, expected: '50px' },
    { colors: 2, height: 100, expected: '25px' },
    { colors: 3, height: 102, expected: '17px' },
    { colors: 2, height: 50, expected: '12.5px' },
    { colors: 5, height: 500, expected: '50px' }
  ];
  describe("calculates flex amount", () => {
    test.concurrent.each(flexTestArray)("height:$height, colorCount:$colors => $expected", ({ colors, height, expected }) => {
      jest.replaceProperty(defaultPaletteItemSetting, 'colorCount', colors);
      jest.replaceProperty(defaultPaletteItemSetting, 'height', height);

      const div = document.createElement("div");
      const paletteItem = new PaletteItem(div, "#F3A6B2", defaultPaletteItemSetting);
      const childDiv = div.children[0] as HTMLDivElement;
      expect(childDiv.style.getPropertyValue("--palette-column-flex-basis")).toEqual(expected);
    });
  });

  const textDisplayTests = [
    {
      aliasMode: AliasMode.Both, alias: "", inputColor: "#fff", expectedSpan:
        [{ expectedTextColor: "#000000", expectedText: "#FFF" },
        { expectedTextColor: "#000000", expectedText: "" }]
    },
    {
      aliasMode: AliasMode.Alias, alias: "", inputColor: "#ddd", expectedSpan:
        [{ expectedTextColor: "#000000", expectedText: "#DDD" },
        { expectedTextColor: "#000000", expectedText: "" }]
    },
    {
      aliasMode: AliasMode.Both, alias: "test", inputColor: "#bbbbbb", expectedSpan:
        [{ expectedTextColor: "#000000", expectedText: "#BBBBBB" },
        { expectedTextColor: "#000000", expectedText: "test" }]
    },
    {
      aliasMode: AliasMode.Alias, alias: "Test", inputColor: "#aaa", expectedSpan:
        [
          { expectedTextColor: "#ffffff", expectedText: "Test" },
          //{ expectedTextColor: "#000000", expectedText: "" }
        ]
    },
    {
      aliasMode: AliasMode.Both, alias: " ", inputColor: "#444", expectedSpan:
        [{ expectedTextColor: "#ffffff", expectedText: "#444" },
        { expectedTextColor: "#ffffff", expectedText: " " }]
    },
    {
      aliasMode: AliasMode.Alias, alias: " ", inputColor: "#333", expectedSpan:
        [{ expectedTextColor: "#ffffff", expectedText: "#333" },
        { expectedTextColor: "#ffffff", expectedText: " " }]
    },
    {
      aliasMode: AliasMode.Both, alias: "blue", inputColor: "#2648a5", expectedSpan:
        [
          { expectedTextColor: "#ffffff", expectedText: "#2648A5" },
          { expectedTextColor: "#ffffff", expectedText: "blue" }
        ]
    },
  ]

  describe.each(textDisplayTests)("formats the text label case:%#", ({ aliasMode, alias, inputColor, expectedSpan }) => {
    jest.replaceProperty(defaultPaletteItemSetting, 'aliasMode', aliasMode);
    jest.replaceProperty(defaultPaletteItemSetting, 'alias', alias);

    const div = document.createElement("div");
    const paletteItem = new PaletteItem(div, inputColor, defaultPaletteItemSetting);
    const childDiv = div.children[0] as HTMLDivElement;

    test("has " + expectedSpan.length + " child elements", () => {
      expect(childDiv.children.length).toEqual(expectedSpan.length);
    });

    expectedSpan.forEach((expected, index) => {
      describe("Child " + index, () => {
        test("is a span", () => {
          expect(childDiv.children[index]).toBeInstanceOf(HTMLSpanElement);
        });
        const element = childDiv.children[index] as HTMLSpanElement;
        test("'--palette-color' set to " + expected.expectedTextColor, () => {
          expect(element.style.getPropertyValue('--palette-color')).toMatch(expected.expectedTextColor);
        });
        test("and shows text", () => {
          expect(element.textContent).toEqual(expected.expectedText);
        });
      });
    });
  });
});