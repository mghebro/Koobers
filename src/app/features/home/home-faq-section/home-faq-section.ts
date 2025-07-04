import { Component } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-home-faq-section',
  standalone: false,
  templateUrl: './home-faq-section.html',
  styleUrl: './home-faq-section.scss'
})
export class HomeFaqSection {
  faqItems: FaqItem[] = [
    {
      question: 'How much does a website cost?',
      answer: 'Pricing depends on the project\'s scope, features, and complexity. After a discovery call, we provide a custom quote tailored to your needs — no hidden fees, just transparent pricing.',
      isOpen: false
    },
    {
      question: 'Do you work with startups or small businesses?',
      answer: 'Absolutely. Whether you\'re just launching or scaling up, we tailor each project to fit your business goals, size, and stage.',
      isOpen: false
    },
    {
      question: 'What if I need help after the site is launched?',
      answer: 'We offer ongoing support, updates, and growth-focused improvements. Whether it\'s bug fixes, feature updates, or scaling — we\'ve got you covered.',
      isOpen: false
    },
    {
      question: 'How involved will I be in the process?',
      answer: 'We keep things collaborative. You\'ll be involved in key decisions — from early ideas to design approvals — with regular updates and progress reviews.',
      isOpen: false
    },
    {
      question: 'Do you offer redesigns or only full builds?',
      answer: 'We do both. Whether you\'re starting from scratch or refreshing an existing site, we can help improve performance, design, and user experience.',
      isOpen: false
    }
  ];

  toggleFaq(index: number): void {
  
    
    // Toggle the selected FAQ
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
