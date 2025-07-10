import { Injectable } from '@angular/core';

export interface CodeSnippets {
  [key: string]: string;
}

export type TabType = 'angular' | 'react' | 'csharp';

@Injectable({
  providedIn: 'root'
})
export class CodeSnippetsService {
  private codeSnippets: CodeSnippets = {
    angular: `import { Component } from '@angular/core';
@Component({
  selector: 'app-greeting',
  template: \`
    <h1>{{ message }}</h1>
  \`,
  styleUrls: [ './greeting.component.css' ]
})
export class GreetingComponent {
  message = 'Koober Coders';
}`,
    
    react: `import React from 'react';

function Greeting() {
  const [message, setMessage] = React.useState('Koober Coders');

  return (
    <div className="greeting">
      <h1>{message}</h1>
    </div>
  );
}

export default Greeting;`,
    
    csharp: `using System;
namespace KooberCoders {
  public class Greeting {
    private string _message = "Koober Coders";
    public string Message {
      get => _message;
      set => _message = value;
    }
    
    public void DisplayGreeting() => 
      Console.WriteLine(Message);
  }
}`
  };

  constructor() { }

  getCodeSnippets(): CodeSnippets {
    return this.codeSnippets;
  }

  getSnippet(language: string): string {
    return this.codeSnippets[language] || '';
  }
  
  // Get code with line numbers
  getSnippetWithLineNumbers(language: string): string {
    const code = this.codeSnippets[language] || '';
    const lines = code.split('\n');
    
    return lines.map((line, index) => {
      const lineNumber = index + 1;
      const paddedNumber = String(lineNumber).padStart(2, ' ');
      return `<span class="line"><span class="line-number">${paddedNumber}</span>${line}</span>`;
    }).join('\n');
  }
}
