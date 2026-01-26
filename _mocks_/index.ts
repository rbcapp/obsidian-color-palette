// https://devinhedge.com/2024/08/27/creating-modular-mocks-for-the-obsidian-api-in-jest/
// https://publish.obsidian.md/hub/04+-+Guides%2C+Workflows%2C+%26+Courses/Guides/How+to+add+automated+tests+to+your+plugin

//import App from "./App";
//import TFile from "./TFile";
//import { Modal } from "./Modal";
// import { Plugin } from "./Plugin";
// import Vault from './Vault';
// import Workspace from './Workspace';
// import MarkdownView from './MarkdownView';
import { PluginSettingTab } from "./PluginSettingTab";
// import { Setting } from './Setting';
//import StatusBarItem from './StatusBarItem';
import { createEl } from "./HTMLElement";

// TODO: remove extra mock files when complete

module.exports = {
  //App,
  //TFile,
  //Modal,
  //Plugin,
  //Vault,
  //Workspace,
  //MarkdownView,
  //Setting,
  //StatusBarItem,
  PluginSettingTab,
  createEl
};

// mocking these classes is not necessary. They're part of the import but only accessed as types, which should work out of the box.
// export class App {}
// export class MarkdownView {}
// export class Editor {}