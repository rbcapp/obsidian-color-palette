module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    moduleDirectories: ["node_modules", "src","test"],
    moduleNameMapper: {"obsidian": "<rootDir>/_mocks_/obsidian.ts"}
};