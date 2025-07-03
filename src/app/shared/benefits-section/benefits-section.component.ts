import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-benefits-section',
  standalone: false,
  templateUrl: './benefits-section.component.html',
  styleUrls: ['./benefits-section.component.scss']
})
export class BenefitsSectionComponent {
    activeIndex: number = 1;

  benefits = [
    {
      id: 1,
      title: 'A Reliable Tech Partner',
      description: 'You can leave the technical part to us and focus on growing your business.',
    },
    {
      id: 2,
      title: 'Increased Efficiency',
      description: 'The automated systems we create will help you save time and human resources.',
    },
    {
      id: 3,
      title: 'Better User Experience',
      description: 'Intuitive and fast products will increase your customer satisfaction and loyalty.',
    },
    {
      id: 4,
      title: 'Future-Proof Solutions',
      description: "We build scalable products that will be ready for your business's future growth.",
    }
  ];

  selectBenefit(selectedId: number): void {
    this.activeIndex = selectedId
  }
}
