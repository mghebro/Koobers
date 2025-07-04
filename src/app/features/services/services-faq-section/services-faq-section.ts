import { Component } from "@angular/core";

interface FaqItem {
  title: string;
  description: string;
  text1: string;
  text2: string;
  text3: string;
  textdescription: string;
  textdescription2: string;
  textdescription3: string;

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
      title: 'Web Application Development',
      description: 'We build complex, fast, and scalable web applications tailored to your business needs.',
      textdescription: 'What You Get:',
      text1: 'High-performance custom platforms that match your specific workflows, goals, and growth plans.',
      textdescription2: 'Key Strengths:',
      text2: '→ Modern tech stack for stability and scalability→ Agile approach for flexible delivery→ Full-cycle development — from discovery to launch and support',
      textdescription3: 'Estimated Timeline:',
      text3: 'Discovery → 1–2 weeksDesign & Prototyping → 2–4 weeksDevelopment & Testing → 4–12+ weeksLaunch & Monitoring → 1 weekSupport & Growth → Ongoing',
      isOpen: true
    },
    {
      title : 'Mobile App Development (iOS/Android)',
      description: 'We build complex, fast, and scalable web applications tailored to your business needs.',
      textdescription: 'What You Get:',
      text1: 'Beautiful, fast, and intuitive mobile apps, built natively or cross-platform, depending on your needs.',
      textdescription2: 'Key Strengths:',
      text2: '→ UX-focused approach to maximize engagement→ Agile development for faster iteration→ Transparent communication and regular progress updates',
      textdescription3: 'Estimated Timeline:',
      text3: 'Discovery → 1–2 weeksDesign & Prototyping → 2–4 weeksDevelopment & Testing → 4–12+ weeksLaunch & Monitoring → 1 weekSupport & Growth → Ongoing',
      isOpen: false
    },
    {

      title : 'UI/UX Design & Prototyping',
      description: 'We create intuitive and visually appealing designs that ensure the best User Experience.',
      textdescription: 'What You Get:',
      text1: 'From user flows and wireframes to fully interactive prototypes — all crafted to deliver clarity and usability.',
      textdescription2: 'Key Strengths:',
      text2: '→ Personalized design tailored to your brand and audience→ Fast prototyping for early testing and feedback→ Consistent visual language across all platforms',
      textdescription3: 'Estimated Timeline:',
      text3: 'Discovery → 1–2 weeksDesign & Prototyping → 2–4 weeks',
      isOpen: false

    },
    {

      title : 'Custom Software Development',
      description: "If off-the-shelf solutions don't work for you, we will build unique software for your specific processes.",
      textdescription: 'What You Get:',
      text1: 'Fully customized tools, systems, or platforms that solve your exact challenges — no workarounds needed.',
      textdescription2: 'Key Strengths:',
      text2: '→ Deep understanding of your business before we build→ Agile process to adapt as we go→ Transparent progress tracking and communication',
      textdescription3: 'Estimated Timeline:',
      text3: 'Varies based on complexity — follows same phases as web apps: Discovery, Design, Dev, Launch, and Support.',
      isOpen: false

    },
    {
      title : 'Technical Consulting & Audit',
      description: 'Analyze your existing systems and receive professional recommendations for their improvement.',
      textdescription: 'What You Get:',
      text1: 'A full technical review of your systems, codebase, and tools — plus strategic advice to improve performance and scale.',
      textdescription2: 'Key Strengths:',
      text2: '→ Experienced team with real-world dev insight→ Honest, actionable recommendations→ Business-first thinking to align tech with your goals',
      textdescription3: 'Estimated Timeline:',
      text3: 'Short-term engagement based on system size (typically 1–2 weeks)',
      isOpen: false
    },
      {
        title : 'Post-Launch Support',
        description: "Our partnership doesn't end at launch. We offer ongoing technical support and development.",
        textdescription: 'What You Get:',
        text1: 'Continued collaboration to support your digital product — from small fixes to new features and scalability planning.',
        textdescription2: 'Key Strengths:',
        text2: '→ Fast response time→ Long-term product ownership→ Proactive improvements based on real user data',
        textdescription3: 'Estimated Timeline:',
        text3: 'Ongoing — support packages tailored to your needs',
        isOpen: false
    }
  ];

  toggleFaq(index: number): void {
  
    
    // Toggle the selected FAQ
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }
}
