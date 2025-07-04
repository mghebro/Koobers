import { Component } from '@angular/core';

@Component({
  selector: 'app-contact-page',
  standalone: false,
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss']
})
export class ContactPageComponent {
  contactInfo = {
    phone: "+995 567 789 654",
    phoneAlternative: "+995 568 04 92 94",
    email: "Example@gmail.com",
    emailAlternative: "Example@gmail.com",
  }
}
