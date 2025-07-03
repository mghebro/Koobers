// contact-form.component.ts
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact-form',
  standalone: false,
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  contactForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('+995 ', [Validators.pattern(/^\+995\s\d{9}$/)]),
    message: new FormControl('', [Validators.required, Validators.maxLength(500)])
  });
  
  submitted = false;

  hasError(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field?.invalid && (this.submitted));
  }

  // Get specific error message for a field
  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} must be at least ${requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        const requiredLength = field.errors['maxlength'].requiredLength;
        return `${this.getFieldDisplayName(fieldName)} cannot exceed ${requiredLength} characters`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['pattern']) {
        return 'Please enter a valid Georgian phone number (+995 followed by 9 digits)';
      }
    }
    return '';
  }

  // Helper method to get display name for fields
  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      message: 'Message'
    };
    return displayNames[fieldName] || fieldName;
  }

  onSubmit(): void {
    this.submitted = true;
    
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.value);
      // Here you would typically send the data to your backend
      this.onFormSubmitSuccess();
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  private onFormSubmitSuccess(): void {
    // Reset form after successful submission
    this.contactForm.reset();
    this.submitted = false;
    // You could show a success message here
    alert('Form submitted successfully!');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  // Phone number input handler
  onPhoneInput(event: any): void {
    const input = event.target;
    let value = input.value;
    
    // Always ensure it starts with +995 
    if (!value.startsWith('+995 ')) {
      value = '+995 ';
    }
    
    // Remove any non-digit characters after +995 
    const prefix = '+995 ';
    const numbers = value.substring(prefix.length).replace(/\D/g, '');
    
    // Limit to 9 digits after +995 
    const limitedNumbers = numbers.substring(0, 9);
    
    // Format the number
    const formattedValue = prefix + limitedNumbers;
    
    // Update the form control
    this.contactForm.get('phoneNumber')?.setValue(formattedValue);
  }

  onPhoneKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    
    // Prevent deletion of +995 prefix
    if ((event.key === 'Backspace' || event.key === 'Delete') && cursorPosition <= 5) {
      event.preventDefault();
    }
    
    // Prevent arrow keys, home, end from going before the prefix
    if (event.key === 'ArrowLeft' || event.key === 'Home') {
      setTimeout(() => {
        if (input.selectionStart !== null && input.selectionStart < 5) {
          input.setSelectionRange(5, 5);
        }
      });
    }
  }

  onPhoneFocus(event: any): void {
    const input = event.target;
    // Set cursor after +995 prefix
    setTimeout(() => {
      if (input.selectionStart !== null && input.selectionStart < 5) {
        input.setSelectionRange(5, 5);
      }
    });
  }
}