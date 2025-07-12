import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener } from '@angular/core';
import { trigger, state, style, transition, animate, query, stagger, keyframes } from '@angular/animations';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-form',
  standalone: false,
  templateUrl: './modal-form.html',
  styleUrl: './modal-form.scss',
  animations: [
    trigger('overlayAnimation', [
      transition(':enter', [
        style({ opacity: 0, backdropFilter: 'blur(0px)' }),
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, backdropFilter: 'blur(8px)' })
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 0, backdropFilter: 'blur(0px)' })
        )
      ])
    ]),
    trigger('modalAnimation', [
      transition(':enter', [
        animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          keyframes([
            style({
              opacity: 0,
              transform: 'scale(0.9) translateY(20px)',
              offset: 0
            }),
            style({
              opacity: 1,
              transform: 'scale(1.02) translateY(-5px)',
              offset: 0.7
            }),
            style({
              opacity: 1,
              transform: 'scale(1) translateY(0)',
              offset: 1
            })
          ])
        )
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 0,
            transform: 'scale(0.95) translateY(10px)'
          })
        )
      ])
    ]),
    trigger('formFieldAnimation', [
      transition(':enter', [
        query('.stagger-item', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('600ms cubic-bezier(0.4, 0, 0.2, 1)',
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class ModalForm implements OnInit, OnDestroy {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() showDefaultActions: boolean = false;
  @Input() closeOnOverlayClick: boolean = true;
  @Input() closeOnEscape: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' | 'fullscreen' = 'medium';

  @Output() onClose = new EventEmitter<void>();
  @Output() onConfirm = new EventEmitter<void>();

  animationState = 'in';

  ngOnInit() {
    // Prevent body scroll when modal is open
    if (this.isOpen) {
      // Check if we need to compensate for scrollbar
      const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;

      // Add adjust class to html to prevent layout shift
      if (hasScrollbar) {
        document.documentElement.classList.add('scroll-lock-adjust');
      }

      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    // Restore body scroll
    document.body.style.overflow = '';
    document.documentElement.classList.remove('scroll-lock-adjust');
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.closeOnEscape && this.isOpen) {
      this.close();
    }
  }

  onOverlayClick(event: MouseEvent) {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }

  close() {
    this.isOpen = false;
    document.body.style.overflow = '';
    document.documentElement.classList.remove('scroll-lock-adjust');
    this.onClose.emit();
  }

  confirm() {
    this.onConfirm.emit();
  }

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

