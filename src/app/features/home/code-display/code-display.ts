import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeSnippets, TabType, CodeSnippetsService } from '../../../core/services/code-snippets.service';
import { PrismHighlightService } from '../../../core/services/prism-highlight.service';


@Component({
  selector: 'app-code-display',
  standalone: false,
  templateUrl: './code-display.html',
  styleUrl: './code-display.scss'
})
export class CodeDisplay  implements OnChanges, OnInit {
  @Input() activeTab: TabType = 'angular';
  @Input() codeSnippets: CodeSnippets = {};
  @Output() tabChange = new EventEmitter<TabType>();

  displayedCode: string = '';
  fullCode: string = '';
  charIndex: number = 0;
  typingSpeed: number = 2; // Base characters per frame
  private typingInterval: any;
  isTyping: boolean = false;
  
  // Words to highlight in green for each language
  private greenHighlightWords: {[key in TabType]: string[]} = {
    angular: ['@angular/core', 'app-greeting', 'message', './greeting.component.css', 'Koober Coders'],
    react: ['react', 'Greeting', 'useState', 'Koober Coders', 'message', '"greeting"'],
    csharp: ['System', 'Greeting', 'Message', '"Koober Coders"', 'DisplayGreeting']
  };
  
  constructor(
    private prismService: PrismHighlightService,
    private codeSnippetsService: CodeSnippetsService
  ) {}
  
  ngOnInit(): void {
    // Start typewriter animation when component initializes
    this.startTypewriterAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeTab'] || changes['codeSnippets']) {
      // Reset and start new typing animation when tab changes or snippets change
      this.startTypewriterAnimation();
    }
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
    this.tabChange.emit(tab);
    // Animation will start via ngOnChanges
  }

  startTypewriterAnimation(): void {
    // Clear any existing interval
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }

    // Reset state
    this.charIndex = 0;
    this.displayedCode = '';
    
    // Get the raw code with line numbers
    const rawCodeWithLineNumbers = this.codeSnippetsService.getSnippetWithLineNumbers(this.activeTab);
    
    // Determine the language for Prism based on active tab
    const language = this.mapTabToLanguage(this.activeTab);
    
    // Apply syntax highlighting with Prism
    this.fullCode = this.prismService.highlightCode(
      rawCodeWithLineNumbers, 
      language, 
      this.greenHighlightWords[this.activeTab]
    );
    
    this.isTyping = true;

    // Calculate speed based on content length - decreased for slower effect
    const contentLength = this.fullCode.length;
    const adjustedSpeed = Math.max(1, Math.min(3, Math.floor(contentLength / 600)));

    // Start typing animation
    this.typingInterval = setInterval(() => {
      if (this.charIndex < this.fullCode.length) {
        // Add a chunk of characters per frame for performance reasons
        const nextChunk = this.fullCode.substring(this.charIndex, this.charIndex + adjustedSpeed);
        this.displayedCode += nextChunk;
        this.charIndex += adjustedSpeed;
      } else {
        // Complete animation
        clearInterval(this.typingInterval);
        this.isTyping = false;
      }
    }, 30); // Increased interval for slower effect (was 15)
  }
  
  // Helper method to map tab type to Prism language name
  private mapTabToLanguage(tab: TabType): string {
    switch(tab) {
      case 'angular': return 'typescript';
      case 'react': return 'javascript';
      case 'csharp': return 'csharp';
      default: return 'typescript';
    }
  }
}
