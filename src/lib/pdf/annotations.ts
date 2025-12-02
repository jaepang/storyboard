/**
 * PDF Annotations Rendering
 *
 * This module provides utilities for rendering vector annotations as PDF layers.
 * The actual implementation is in generator.ts for maintainability.
 *
 * @see PdfGenerator.addSongPage (includeAnnotations parameter) in generator.ts
 */

export { PdfGenerator } from './generator';

/**
 * Annotation types supported in the system
 */
export type AnnotationType = 'circle' | 'arrow' | 'line' | 'text';

/**
 * Base annotation interface
 */
export interface Annotation {
  page: number;
  type: AnnotationType;
  color: string;
  strokeWidth?: number;
}

/**
 * Circle annotation
 */
export interface CircleAnnotation extends Annotation {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
}

/**
 * Arrow annotation
 */
export interface ArrowAnnotation extends Annotation {
  type: 'arrow';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Line annotation
 */
export interface LineAnnotation extends Annotation {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Text annotation
 */
export interface TextAnnotation extends Omit<Annotation, 'strokeWidth'> {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
}
