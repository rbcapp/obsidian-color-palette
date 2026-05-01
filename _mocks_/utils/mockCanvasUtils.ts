import { Canvas } from '../../src/utils/canvasUtils';
import { EventEmitter } from "../../src/utils/EventEmitter";
import { Direction } from '../../src/settings';

export type CanvasEventMap = {
  click: [hex: string],
}

/**
 * Default mock settings for Canvas
 */
const DEFAULT_CANVAS_CONFIG = {
  width: 400,
  height: 200,
  direction: Direction.Row,
  colors: ['#FFA000', '#00FFB0', '#C000FF'],
};

/**
 * Creates a mock EventEmitter for Canvas testing
 */
const createMockCanvasEmitter = (): EventEmitter<CanvasEventMap> => {
  return {
    on: jest.fn(),
    emit: jest.fn(),
    clear: jest.fn(),
  } as unknown as EventEmitter<CanvasEventMap>;
};

/**
 * Creates a mock HTMLCanvasElement for testing
 */
const createMockCanvasElement = (width: number = DEFAULT_CANVAS_CONFIG.width, height: number = DEFAULT_CANVAS_CONFIG.height): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  // Mock the context
  const mockContext = {
    createLinearGradient: jest.fn(),
    fillStyle: '',
    fillRect: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray([255, 0, 0, 255]), // Default red color
    })),
  } as unknown as CanvasRenderingContext2D;
  
  canvas.getContext = jest.fn(() => mockContext) as any;
  
  return canvas;
};

/**
 * Creates a properly typed mock Canvas with sensible defaults
 * @param overrides Optional property overrides for test-specific customization
 * @returns A fully typed Canvas mock
 * 
 * @example
 * // Basic usage
 * const mockCanvas = createMockCanvas();
 * 
 * @example
 * // Custom dimensions
 * const wideCanvas = createMockCanvas({ 
 *   canvas: createMockCanvasElement(800, 300)
 * });
 * 
 * @example
 * // Custom container
 * const customContainer = document.createElement('div');
 * const canvasMock = createMockCanvas({ container: customContainer });
 */
export const createMockCanvas = (
  overrides?: Partial<Canvas>
): Canvas => {
  const container = document.createElement('div');
  const canvas = createMockCanvasElement();
  const tooltip = document.createElement('section');
  const tooltipText = document.createElement('span');

  const baseMock: Canvas = {
    container,
    canvas,
    tooltip,
    tooltipText,
    context: canvas.getContext('2d', { willReadFrequently: true, alpha: true })!,
    emitter: createMockCanvasEmitter(),
  }as unknown as Canvas;

  return {
    ...baseMock,
    ...overrides,
  } as Canvas;
};

/**
 * Creates a mock Canvas with all methods spied (for assertion testing)
 * @param overrides Optional property overrides
 * @returns A jest.Mocked version of Canvas
 * 
 * @example
 * const spiedCanvas = createSpiedMockCanvas();
 * // ... test code ...
 * expect(spiedCanvas.createGradient).toHaveBeenCalled();
 */
export const createSpiedMockCanvas = (
  overrides?: Partial<Canvas>
): jest.Mocked<Canvas> => {
  return createMockCanvas(overrides) as jest.Mocked<Canvas>;
};

/**
 * Creates multiple mock Canvas instances at once
 * @param count Number of mocks to create
 * @param overridesArray Optional array of overrides for each mock
 * @returns Array of Canvas mocks
 * 
 * @example
 * const mockCanvases = createMockCanvases(3, [
 *   { canvas: createMockCanvasElement(400, 200) },
 *   { canvas: createMockCanvasElement(600, 300) },
 *   { canvas: createMockCanvasElement(800, 400) },
 * ]);
 */
export const createMockCanvases = (
  count: number,
  overridesArray?: Partial<Canvas>[]
): Canvas[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockCanvas(overridesArray?.[index])
  );
};

/**
 * Builder pattern for complex Canvas mock configurations
 * Use this when you need to set up multiple interdependent properties
 * or when testing complex canvas interactions
 * 
 * @example
 * const mockCanvas = new MockCanvasBuilder()
 *   .withDimensions(600, 400)
 *   .withColors(['#FF0000', '#00FF00', '#0000FF'])
 *   .withDirection(Direction.Column)
 *   .build();
 * 
 * @example
 * const mockCanvasForEvents = new MockCanvasBuilder()
 *   .withDimensions(500, 250)
 *   .spyOnCreateGradient()
 *   .build();
 */
export class MockCanvasBuilder {
  private mock: Canvas;
  private canvasElement: HTMLCanvasElement;

  constructor() {
    this.canvasElement = createMockCanvasElement();
    this.mock = createMockCanvas({
      canvas: this.canvasElement,
    });
  }

  /**
   * Sets custom canvas dimensions
   * @param width Canvas width in pixels
   * @param height Canvas height in pixels
   */
  withDimensions(width: number, height: number): MockCanvasBuilder {
    this.canvasElement.width = width;
    this.canvasElement.height = height;
    return this;
  }

  /**
   * Sets custom canvas width
   */
  withWidth(width: number): MockCanvasBuilder {
    this.canvasElement.width = width;
    return this;
  }

  /**
   * Sets custom canvas height
   */
  withHeight(height: number): MockCanvasBuilder {
    this.canvasElement.height = height;
    return this;
  }

  /**
   * Sets the container element
   */
  withContainer(container: HTMLElement): MockCanvasBuilder {
    this.mock.container = container;
    return this;
  }

  /**
   * Sets the tooltip element
   */
  withTooltip(tooltip: HTMLElement): MockCanvasBuilder {
    this.mock.tooltip = tooltip;
    return this;
  }

  /**
   * Sets the tooltip text element
   */
  withTooltipText(tooltipText: HTMLSpanElement): MockCanvasBuilder {
    this.mock.tooltipText = tooltipText;
    return this;
  }

  /**
   * Sets custom canvas context
   */
  withContext(context: CanvasRenderingContext2D): MockCanvasBuilder {
    this.mock.context = context;
    return this;
  }

  /**
   * Sets the emitter for event testing
   */
  withEmitter(emitter: EventEmitter<CanvasEventMap>): MockCanvasBuilder {
    this.mock.emitter = emitter;
    return this;
  }

  /**
   * Configure the context's getImageData to return specific color data
   * Useful for testing hex color retrieval from canvas
   * @param r Red channel (0-255)
   * @param g Green channel (0-255)
   * @param b Blue channel (0-255)
   * @param a Alpha channel (0-255)
   */
  withPixelColor(r: number, g: number, b: number, a: number = 255): MockCanvasBuilder {
    const mockContext = this.mock.context as jest.Mocked<CanvasRenderingContext2D>;
    mockContext.getImageData = jest.fn(() => ({
      data: new Uint8ClampedArray([r, g, b, a]),
    })) as any;
    return this;
  }

  /**
   * Configure the context's createLinearGradient method
   * Useful for testing gradient creation
   */
  withMockGradient(): MockCanvasBuilder {
    const mockContext = this.mock.context as jest.Mocked<CanvasRenderingContext2D>;
    const mockGradient = {
      addColorStop: jest.fn(),
    } as unknown as CanvasGradient;
    mockContext.createLinearGradient = jest.fn(() => mockGradient) as any;
    return this;
  }

  /**
   * Spy on the createLinearGradient method
   */
  spyOnCreateGradient(): MockCanvasBuilder {
    const mockContext = this.mock.context as jest.Mocked<CanvasRenderingContext2D>;
    mockContext.createLinearGradient = jest.fn(() => ({
      addColorStop: jest.fn(),
    })) as any;
    return this;
  }

  /**
   * Spy on the fillRect method
   */
  spyOnFillRect(): MockCanvasBuilder {
    const mockContext = this.mock.context as jest.Mocked<CanvasRenderingContext2D>;
    mockContext.fillRect = jest.fn();
    return this;
  }

  /**
   * Spy on the getImageData method
   */
  spyOnGetImageData(): MockCanvasBuilder {
    const mockContext = this.mock.context as jest.Mocked<CanvasRenderingContext2D>;
    mockContext.getImageData = jest.fn(() => ({
      data: new Uint8ClampedArray([255, 0, 0, 255]),
    })) as any;
    return this;
  }

  /**
   * Spy on canvas click events
   */
  spyOnClickEmission(): MockCanvasBuilder {
    (this.mock.emitter.emit as jest.Mock).mockClear();
    return this;
  }

  /**
   * Configure canvas to simulate touch device
   * Note: This would need to be used in conjunction with isTouchEnabled() mocking in your tests
   */
  asThouchDevice(): MockCanvasBuilder {
    // This is a marker for test setup - actual implementation depends on your test setup
    // You may need to mock window.ontouchstart or navigator.maxTouchPoints
    return this;
  }

  /**
   * Build the mock Canvas instance
   */
  build(): Canvas {
    return this.mock;
  }

  /**
   * Build the mock Canvas instance with all methods spied
   */
  buildSpied(): jest.Mocked<Canvas> {
    return this.mock as jest.Mocked<Canvas>;
  }

  /**
   * Get the underlying canvas element for direct manipulation
   */
  getCanvasElement(): HTMLCanvasElement {
    return this.canvasElement;
  }

  /**
   * Get the mock context for advanced assertions
   */
  getContext(): jest.Mocked<CanvasRenderingContext2D> {
    return this.mock.context as jest.Mocked<CanvasRenderingContext2D>;
  }
}