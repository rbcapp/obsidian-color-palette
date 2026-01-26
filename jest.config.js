module.exports = {
    preset: "ts-jest",
    testEnvironment: "jest-environment-jsdom",
    moduleDirectories: ["node_modules", "src","test"],
    moduleNameMapper: {"obsidian": "<rootDir>/_mocks_/index.ts"},
    setupFiles: ['<rootDir>/jest.setup.ts'],
};