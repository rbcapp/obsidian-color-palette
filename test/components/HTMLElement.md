# Definition
The following code defines the interface for an HTMLElement. Parent interfaces included

# Code

```
    interface Node {
        detach(): void;
        empty(): void;
        insertAfter<T extends Node>(node: T, child: Node | null): T;
        indexOf(other: Node): number;
        setChildrenInPlace(children: Node[]): void;
        appendText(val: string): void;
        /**
         * Cross-window capable instanceof check, a drop-in replacement
         * for instanceof checks on DOM Nodes. Remember to also check
         * for nulls when necessary.
         * @param type
         */
        instanceOf<T>(type: {
            new (): T;
        }): this is T;
        /**
         * The document this node belongs to, or the global document.
         */
        doc: Document;
        /**
         * The window object this node belongs to, or the global window.
         */
        win: Window;
        constructorWin: Window;
    }
    interface Element extends Node {
        getText(): string;
        setText(val: string | DocumentFragment): void;
        addClass(...classes: string[]): void;
        addClasses(classes: string[]): void;
        removeClass(...classes: string[]): void;
        removeClasses(classes: string[]): void;
        toggleClass(classes: string | string[], value: boolean): void;
        hasClass(cls: string): boolean;
        setAttr(qualifiedName: string, value: string | number | boolean | null): void;
        setAttrs(obj: {
            [key: string]: string | number | boolean | null;
        }): void;
        getAttr(qualifiedName: string): string | null;
        matchParent(selector: string, lastParent?: Element): Element | null;
        getCssPropertyValue(property: string, pseudoElement?: string): string;
        isActiveElement(): boolean;
    }
    interface HTMLElement extends Element {
        show(): void;
        hide(): void;
        toggle(show: boolean): void;
        toggleVisibility(visible: boolean): void;
        /**
         * Returns whether this element is shown, when the element is attached to the DOM and
         * none of the parent and ancestor elements are hidden with `display: none`.
         *
         * Exception: Does not work on `<body>` and `<html>`, or on elements with `position: fixed`.
         */
        isShown(): boolean;
        setCssStyles(styles: Partial<CSSStyleDeclaration>): void;
        setCssProps(props: Record<string, string>): void;
        /**
         * Get the inner width of this element without padding.
         */
        readonly innerWidth: number;
        /**
         * Get the inner height of this element without padding.
         */
        readonly innerHeight: number;
    }
```