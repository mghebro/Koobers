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
      question: 'HOME.FAQ.QUESTIONS.COST',
      answer: 'HOME.FAQ.ANSWERS.COST',
      isOpen: false
    },
    {
      question: 'HOME.FAQ.QUESTIONS.STARTUPS',
      answer: 'HOME.FAQ.ANSWERS.STARTUPS',
      isOpen: false
    },
    {
      question: 'HOME.FAQ.QUESTIONS.SUPPORT',
      answer: 'HOME.FAQ.ANSWERS.SUPPORT',
      isOpen: false
    },
    {
      question: 'HOME.FAQ.QUESTIONS.INVOLVEMENT',
      answer: 'HOME.FAQ.ANSWERS.INVOLVEMENT',
      isOpen: false
    },
    {
      question: 'HOME.FAQ.QUESTIONS.REDESIGNS',
      answer: 'HOME.FAQ.ANSWERS.REDESIGNS',
      isOpen: false
    }
  ];

  toggleFaq(index: number): void {


    // Toggle the selected FAQ
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
