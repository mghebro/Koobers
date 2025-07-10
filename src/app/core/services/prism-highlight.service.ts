import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as Prism from 'prismjs';

// Import Prism core
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-css';

@Injectable({
  providedIn: 'root'
})
export class PrismHighlightService {
  constructor(@Inject(DOCUMENT) private document: Document) {
    // Add CSS for green highlights
    this.addGreenHighlightStyles();
  }

  /**
   * Highlights code with Prism and adds green highlights to specified keywords
   * @param code The source code to highlight
   * @param language The language for syntax highlighting
   * @param greenHighlightWords Array of words to highlight in green
   */
  highlightCode(code: string, language: string, greenHighlightWords: string[] = []): string {
    // Default to typescript if language not specified
    const lang = language || 'typescript';
    
    if (code.includes('<span class="line">')) {
      // Code already has line structure, we need to process each line separately
      const lines = code.split('\n');
      
      const highlightedLines = lines.map(line => {
        if (line.includes('<span class="line">')) {
          // Extract the line number part
          const lineNumberPart = line.match(/<span class="line"><span class="line-number">.*?<\/span>/)?.[0] || '';
          
          // Extract the code content (everything after the line number span)
          const codeContent = line.replace(lineNumberPart, '').replace(/<\/span>$/, '');
          
          // Highlight the code content
          const highlightedContent = this.highlightCodeSegment(codeContent, lang, greenHighlightWords);
          
          // Rebuild the line with highlighted content
          return `${lineNumberPart}${highlightedContent}</span>`;
        }
        return line; // Return unchanged if it doesn't have the expected format
      });
      
      return highlightedLines.join('\n');
    } else {
      // Standard code without line structure
      return this.highlightCodeSegment(code, lang, greenHighlightWords);
    }
  }
  
  /**
   * Highlights a segment of code without line structure
   */
  private highlightCodeSegment(code: string, language: string, greenHighlightWords: string[]): string {
    // Apply basic Prism highlighting
    let highlightedCode = Prism.highlight(code, Prism.languages[language], language);
    
    // Apply green highlights
    if (greenHighlightWords.length > 0) {
      greenHighlightWords.forEach(word => {
        // Handle quotes in the search string
        const searchWord = this.escapeRegExp(word);
        
        // Make sure we don't replace inside HTML tags
        const regex = new RegExp(`(?<!<[^>]*)\\b${searchWord}\\b(?![^<]*>)`, 'g');
        
        // For quoted strings, we need special handling
        if (word.startsWith('"') || word.startsWith("'") || word.startsWith('`')) {
          // For quotes, we need to search more precisely within string tokens
          const quoteRegex = new RegExp(`(["'\`]${searchWord.slice(1, -1)}["'\`])`, 'g');
          highlightedCode = highlightedCode.replace(quoteRegex, '<span class="green-highlight">$1</span>');
        } else {
          // For normal words
          highlightedCode = highlightedCode.replace(regex, '<span class="green-highlight">$&</span>');
        }
      });
    }
    
    return highlightedCode;
  }

  /**
   * Adds the necessary CSS for green highlights
   */
  private addGreenHighlightStyles(): void {
    const style = this.document.createElement('style');
    style.textContent = `
      .green-highlight {
        color: #4CAF50 !important;
        font-weight: bold;
      }
      
      /* Override all token colors with a single color */
      .token {
        color: #e0e0e0 !important;
      }
      
      /* Style for line numbers */
      .line-number {
        color: #6a8379 !important;
        opacity: 0.6;
      }
    `;
    this.document.head.appendChild(style);
  }

  /**
   * Helper to escape special characters in regex
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
} 