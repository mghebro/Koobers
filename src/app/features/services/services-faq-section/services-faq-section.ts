import { Component } from '@angular/core';

interface FaqItem {
  title: string;
  description: string;
  textdescription: string;
  text1: string;
  textdescription2: string;
  text2: string;
  textdescription3: string;
  text3: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-services-faq-section',
  standalone: false,
  templateUrl: './services-faq-section.html',
  styleUrl: './services-faq-section.scss'
})
export class ServicesFaqSection {
  faqItems: FaqItem[] = [
    {
      title: 'SERVICES.FAQ.WEB_APP.TITLE',
      description: 'SERVICES.FAQ.WEB_APP.DESCRIPTION',
      textdescription: 'SERVICES.FAQ.WEB_APP.WHAT_YOU_GET',
      text1: 'SERVICES.FAQ.WEB_APP.GET_DESCRIPTION',
      textdescription2: 'SERVICES.FAQ.WEB_APP.KEY_STRENGTHS',
      text2: 'SERVICES.FAQ.WEB_APP.STRENGTHS_DESCRIPTION',
      textdescription3: 'SERVICES.FAQ.WEB_APP.TIMELINE',
      text3: 'SERVICES.FAQ.WEB_APP.TIMELINE_DESCRIPTION',
      isOpen: true
    },
    {
      title: 'SERVICES.FAQ.MOBILE_APP.TITLE',
      description: 'SERVICES.FAQ.MOBILE_APP.DESCRIPTION',
      textdescription: 'SERVICES.FAQ.MOBILE_APP.WHAT_YOU_GET',
      text1: 'SERVICES.FAQ.MOBILE_APP.GET_DESCRIPTION',
      textdescription2: 'SERVICES.FAQ.MOBILE_APP.KEY_STRENGTHS',
      text2: 'SERVICES.FAQ.MOBILE_APP.STRENGTHS_DESCRIPTION',
      textdescription3: 'SERVICES.FAQ.MOBILE_APP.TIMELINE',
      text3: 'SERVICES.FAQ.MOBILE_APP.TIMELINE_DESCRIPTION',
      isOpen: false
    },
    {
      title: 'SERVICES.FAQ.UI_UX.TITLE',
      description: 'SERVICES.FAQ.UI_UX.DESCRIPTION',
      textdescription: 'SERVICES.FAQ.UI_UX.WHAT_YOU_GET',
      text1: 'SERVICES.FAQ.UI_UX.GET_DESCRIPTION',
      textdescription2: 'SERVICES.FAQ.UI_UX.KEY_STRENGTHS',
      text2: 'SERVICES.FAQ.UI_UX.STRENGTHS_DESCRIPTION',
      textdescription3: 'SERVICES.FAQ.UI_UX.TIMELINE',
      text3: 'SERVICES.FAQ.UI_UX.TIMELINE_DESCRIPTION',
      isOpen: false
    },
    {
      title: 'SERVICES.FAQ.CUSTOM_SOFTWARE.TITLE',
      description: 'SERVICES.FAQ.CUSTOM_SOFTWARE.DESCRIPTION',
      textdescription: 'SERVICES.FAQ.CUSTOM_SOFTWARE.WHAT_YOU_GET',
      text1: 'SERVICES.FAQ.CUSTOM_SOFTWARE.GET_DESCRIPTION',
      textdescription2: 'SERVICES.FAQ.CUSTOM_SOFTWARE.KEY_STRENGTHS',
      text2: 'SERVICES.FAQ.CUSTOM_SOFTWARE.STRENGTHS_DESCRIPTION',
      textdescription3: 'SERVICES.FAQ.CUSTOM_SOFTWARE.TIMELINE',
      text3: 'SERVICES.FAQ.CUSTOM_SOFTWARE.TIMELINE_DESCRIPTION',
      isOpen: false
    },
    {
      title: 'SERVICES.FAQ.TECH_CONSULTING.TITLE',
      description: 'SERVICES.FAQ.TECH_CONSULTING.DESCRIPTION',
      textdescription: 'SERVICES.FAQ.TECH_CONSULTING.WHAT_YOU_GET',
      text1: 'SERVICES.FAQ.TECH_CONSULTING.GET_DESCRIPTION',
      textdescription2: 'SERVICES.FAQ.TECH_CONSULTING.KEY_STRENGTHS',
      text2: 'SERVICES.FAQ.TECH_CONSULTING.STRENGTHS_DESCRIPTION',
      textdescription3: 'SERVICES.FAQ.TECH_CONSULTING.TIMELINE',
      text3: 'SERVICES.FAQ.TECH_CONSULTING.TIMELINE_DESCRIPTION',
      isOpen: false
    },
    {
      title: 'SERVICES.FAQ.POST_LAUNCH.TITLE',
      description: 'SERVICES.FAQ.POST_LAUNCH.DESCRIPTION',
      textdescription: 'SERVICES.FAQ.POST_LAUNCH.WHAT_YOU_GET',
      text1: 'SERVICES.FAQ.POST_LAUNCH.GET_DESCRIPTION',
      textdescription2: 'SERVICES.FAQ.POST_LAUNCH.KEY_STRENGTHS',
      text2: 'SERVICES.FAQ.POST_LAUNCH.STRENGTHS_DESCRIPTION',
      textdescription3: 'SERVICES.FAQ.POST_LAUNCH.TIMELINE',
      text3: 'SERVICES.FAQ.POST_LAUNCH.TIMELINE_DESCRIPTION',
      isOpen: false
    }
  ];

  toggleFaq(index: number): void {
    // Toggle the selected FAQ
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
