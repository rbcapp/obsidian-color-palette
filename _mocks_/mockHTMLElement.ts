

// interface spiedHTMLElement extends HTMLElement{
//     method:addClass();
// }





// export const createMockHTMLElement = () => {
//     return {
//         style: {
//             setProperty: jest.fn()
//         },

//         addClass: jest.fn(),
//         createEl: jest.fn(),
//         toggleClass: jest.fn(),
//         addEventListener: jest.fn(),
//         children:[]
//     }
// };

import { jest } from '@jest/globals';

/**
 * Creates a mock HTMLElement that:
 * 1. Extends real HTMLElement (for type safety and real DOM methods)
 * 2. Adds Obsidian-specific methods (createEl, addClass, etc.) as Jest mocks
 * 3. Allows spying and assertion on method calls
 */
export const createMockHTMLElement = (): HTMLElement & {
    createEl: jest.Mock;
    addClass: jest.Mock;
    toggleClass: jest.Mock;
    setText?: jest.Mock;
    getText?: jest.Mock;
} => {
    // Start with a real HTMLElement to satisfy TypeScript
    const mockEl = document.createElement('div') as any;

    // Mock the Obsidian-specific createEl method
    // Returns a real DOM element so child operations work correctly
    mockEl.createEl = jest.fn((tag: string, options?: { text?: string; cls?: string }) => {
        const newEl = document.createElement(tag);
        if (options?.text) {
            newEl.textContent = options.text;
        }
        if (options?.cls) {
            newEl.className = options.cls;
        }
        mockEl.appendChild(newEl);
        return newEl;
    });

    // Mock addClass (chainable, returns self)
    mockEl.addClass = jest.fn((className: string) => {
        mockEl.classList.add(className);
        return mockEl;
    });

    // Mock toggleClass (chainable, returns self)
    mockEl.toggleClass = jest.fn((className: string, toggle?: boolean) => {
        if (toggle === undefined) {
            mockEl.classList.toggle(className);
        } else if (toggle) {
            mockEl.classList.add(className);
        } else {
            mockEl.classList.remove(className);
        }
        return mockEl;
    });

    // Mock setText (for Obsidian compatibility)
    mockEl.setText = jest.fn((text: string) => {
        mockEl.textContent = text;
        return mockEl;
    });

    // Mock getText (for Obsidian compatibility)
    mockEl.getText = jest.fn(() => {
        return mockEl.textContent || '';
    });

    return mockEl;
};