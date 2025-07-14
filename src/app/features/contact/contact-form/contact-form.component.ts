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
  submitted = false;

  // Custom validator for optional phone number
  optionalPhoneValidator = (control: any) => {
    if (!control.value || control.value.trim() === '' || control.value === '+995 ') {
      return null; // Valid if empty or just the prefix
    }
    return /^\+995\s\d{9}$/.test(control.value) ? null : { pattern: true };
  };

  contactForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [this.optionalPhoneValidator]),
    message: new FormControl('', [Validators.required, Validators.maxLength(500)])
  });

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
    
    // If the field is completely empty, leave it empty
    if (value === '') {
      this.contactForm.get('phoneNumber')?.setValue('');
      return;
    }
    
    // Extract all digits from the input
    const allDigits = value.replace(/\D/g, '');
    
    // If no digits, clear the field
    if (allDigits === '') {
      this.contactForm.get('phoneNumber')?.setValue('');
      return;
    }
    
    // Remove the country code (995) if it exists at the beginning
    const phoneDigits = allDigits.startsWith('995') ? allDigits.substring(3) : allDigits;
    
    // Limit to 9 digits
    const limitedNumbers = phoneDigits.substring(0, 9);
    
    // Format the number with prefix
    const formattedValue = '+995 ' + limitedNumbers;
    
    // Update the form control
    this.contactForm.get('phoneNumber')?.setValue(formattedValue);
  }

  onPhoneKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    const value = input.value;
    
    // Allow clearing the entire field
    if ((event.key === 'Backspace' || event.key === 'Delete') && value === '+995 ') {
      this.contactForm.get('phoneNumber')?.setValue('');
      event.preventDefault();
      return;
    }
    
    // Prevent deletion of +995 prefix when there are numbers after it
    if ((event.key === 'Backspace' || event.key === 'Delete') && cursorPosition <= 5 && value.length > 5) {
      event.preventDefault();
    }
    
    // Prevent arrow keys, home, end from going before the prefix
    if (event.key === 'ArrowLeft' || event.key === 'Home') {
      setTimeout(() => {
        if (input.selectionStart !== null && input.selectionStart < 5 && input.value.length > 0) {
          input.setSelectionRange(5, 5);
        }
      });
    }
  }

  onPhoneFocus(event: any): void {
    const input = event.target;
    const value = input.value;
    
    // Only set cursor after +995 prefix if there's content
    if (value && value.length > 0) {
      setTimeout(() => {
        if (input.selectionStart !== null && input.selectionStart < 5) {
          input.setSelectionRange(5, 5);
        }
      });
    }
  }
}