import { Component } from '@angular/core';

@Component({
  selector: 'app-work-portfolio-section',
  standalone: false,
  templateUrl: './work-portfolio-section.html',
  styleUrl: './work-portfolio-section.scss'
})
export class WorkPortfolioSection {

  openedFolders: boolean[] = [false, false, false];

  toggleFolder(index: number): void {
    this.openedFolders[index] = !this.openedFolders[index];
  }
}
