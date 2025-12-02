import { PDFDocument, type PDFFont, type PDFPage, rgb, StandardFonts } from 'pdf-lib';
import type { ContiWithSongs } from '@/types/conti';

/**
 * PDF Generator Utility
 *
 * Generates PDF documents for worship contis using pdf-lib.
 * Includes Korean font embedding for proper text rendering.
 */

export interface PdfGeneratorOptions {
  includeSheetMusic?: boolean;
  includeAnnotations?: boolean;
  pageSize?: {
    width: number;
    height: number;
  };
}

export class PdfGenerator {
  private doc: PDFDocument;
  private font: PDFFont;
  private boldFont: PDFFont;

  constructor(doc: PDFDocument, font: PDFFont, boldFont: PDFFont) {
    this.doc = doc;
    this.font = font;
    this.boldFont = boldFont;
  }

  static async create(): Promise<PdfGenerator> {
    const doc = await PDFDocument.create();

    // Embed standard fonts (Korean requires external font files - using Helvetica as fallback)
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

    return new PdfGenerator(doc, font, boldFont);
  }

  getDoc(): PDFDocument {
    return this.doc;
  }

  getFont(): PDFFont {
    return this.font;
  }

  getBoldFont(): PDFFont {
    return this.boldFont;
  }

  addPage(width: number = 595, height: number = 842): PDFPage {
    return this.doc.addPage([width, height]); // A4 size
  }

  async save(): Promise<Uint8Array> {
    return await this.doc.save();
  }

  /**
   * Generate a complete PDF for a conti
   */
  async generateContiPdf(
    conti: ContiWithSongs,
    options: PdfGeneratorOptions = {}
  ): Promise<Uint8Array> {
    // Add conti info page
    await this.addContiInfoPage(conti);

    // Add song pages (if sheet music is included)
    if (options.includeSheetMusic && conti.songs.length > 0) {
      for (const song of conti.songs) {
        await this.addSongPage(song, options.includeAnnotations);
      }
    }

    return await this.save();
  }

  private async addContiInfoPage(conti: ContiWithSongs): Promise<void> {
    const page = this.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;

    // Title
    page.drawText(conti.title, {
      x: margin,
      y,
      size: 24,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 40;

    // Worship Date
    const date = new Date(conti.worship_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    page.drawText(`Date: ${date}`, {
      x: margin,
      y,
      size: 14,
      font: this.font,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 30;

    // Notes (if any)
    if (conti.notes) {
      page.drawText('Notes:', {
        x: margin,
        y,
        size: 12,
        font: this.boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 20;

      const notesLines = this.wrapText(conti.notes, width - 2 * margin, 12);
      for (const line of notesLines) {
        page.drawText(line, {
          x: margin,
          y,
          size: 12,
          font: this.font,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 16;
      }
      y -= 10;
    }

    // Song List
    page.drawText('Song List:', {
      x: margin,
      y,
      size: 16,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 30;

    // Draw songs
    for (let i = 0; i < conti.songs.length; i++) {
      const song = conti.songs[i];

      // Check if we need a new page
      if (y < margin + 40) {
        const newPage = this.addPage();
        y = newPage.getSize().height - margin;
      }

      // Song number and title
      const songText = `${i + 1}. ${song.title}`;
      page.drawText(songText, {
        x: margin,
        y,
        size: 14,
        font: this.font,
        color: rgb(0, 0, 0),
      });
      y -= 20;

      // Song details (composer, key, BPM)
      const details: string[] = [];
      if (song.composer) details.push(`Composer: ${song.composer}`);
      if (song.key_signature) details.push(`Key: ${song.key_signature}`);
      if (song.bpm_array && song.bpm_array.length > 0) {
        details.push(`BPM: ${song.bpm_array.join(' -> ')}`);
      }

      if (details.length > 0) {
        page.drawText(details.join('  |  '), {
          x: margin + 20,
          y,
          size: 10,
          font: this.font,
          color: rgb(0.4, 0.4, 0.4),
        });
        y -= 20;
      }

      // Notes
      if (song.notes) {
        page.drawText(`  Notes: ${song.notes}`, {
          x: margin + 20,
          y,
          size: 10,
          font: this.font,
          color: rgb(0.5, 0.5, 0.5),
        });
        y -= 20;
      }

      y -= 10; // Extra spacing between songs
    }
  }

  private async addSongPage(
    song: ContiWithSongs['songs'][0],
    includeAnnotations: boolean = false
  ): Promise<void> {
    const page = this.addPage();
    const { width, height } = page.getSize();
    const margin = 50;
    let y = height - margin;

    // Song title
    page.drawText(song.title, {
      x: margin,
      y,
      size: 20,
      font: this.boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 40;

    // Song metadata
    const metadata: string[] = [];
    if (song.composer) metadata.push(`Composer: ${song.composer}`);
    if (song.lyricist) metadata.push(`Lyricist: ${song.lyricist}`);
    if (song.key_signature) metadata.push(`Key: ${song.key_signature}`);
    if (song.time_signature) metadata.push(`Time: ${song.time_signature}`);

    if (metadata.length > 0) {
      page.drawText(metadata.join('  |  '), {
        x: margin,
        y,
        size: 11,
        font: this.font,
        color: rgb(0.3, 0.3, 0.3),
      });
      y -= 25;
    }

    // BPM Array
    if (song.bpm_array && song.bpm_array.length > 0) {
      page.drawText(`BPM: ${song.bpm_array.join(' -> ')}`, {
        x: margin,
        y,
        size: 14,
        font: this.boldFont,
        color: rgb(0, 0, 0),
      });
      y -= 30;
    }

    // Sheet music placeholder (would require actual image/PDF embedding)
    if (song.sheet_music_url) {
      page.drawRectangle({
        x: margin,
        y: y - 200,
        width: width - 2 * margin,
        height: 200,
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      });

      page.drawText('[Sheet Music Would Be Embedded Here]', {
        x: margin + 100,
        y: y - 100,
        size: 12,
        font: this.font,
        color: rgb(0.5, 0.5, 0.5),
      });
      y -= 220;
    }

    // Annotations placeholder
    if (includeAnnotations && song.annotations) {
      // Annotations would be drawn as vector graphics over the sheet music
      // This is a placeholder for the actual implementation
    }
  }

  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    const approxCharWidth = fontSize * 0.6; // Approximate character width
    const maxChars = Math.floor(maxWidth / approxCharWidth);

    for (const word of words) {
      if ((currentLine + word).length <= maxChars) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }
}
