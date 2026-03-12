import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegisterPage {

  email = '';
  password = '';
  errorMessage = '';
  loading = false;
  showPassword = false;

  constructor(private api: Api, private router: Router) {
    addIcons({ eye, eyeOff });
  }

  get rules() {
    return [
      { label: 'At least 8 characters', met: this.password.length >= 8 },
      { label: 'One uppercase letter', met: /[A-Z]/.test(this.password) },
      { label: 'One lowercase letter', met: /[a-z]/.test(this.password) },
      { label: 'One number', met: /[0-9]/.test(this.password) },
      { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*]/.test(this.password) },
    ];
  }

  get allRulesMet(): boolean {
    return this.rules.every(r => r.met);
  }

  validate(): string {
    if (!this.email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) return 'Enter a valid email';
    if (!this.allRulesMet) return 'Password does not meet all requirements';
    return '';
  }

  register() {
    this.errorMessage = this.validate();
    if (this.errorMessage) return;

    this.loading = true;

    this.api.register(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Registration failed';
      }
    });
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }
}