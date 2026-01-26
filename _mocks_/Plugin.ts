export class Plugin {
addRibbonIcon() {
    return {
      addClass: () => {}
    };
  }
  addStatusBarItem() {
    return {
      setText: () => {}
    };
  }
  addCommand() {}
  addSettingTab() {}
  registerDomEvent() {}
  registerInterval() {}
  loadData() {
    return Promise.resolve(null);
  }
  saveData() {
    return Promise.resolve();
  }
}