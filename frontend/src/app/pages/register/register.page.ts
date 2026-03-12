import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegisterPage {

  email = '';
  password = '';

  constructor(private api: Api, private router: Router) {}

  register() {
    if (!this.email || !this.password) {
      alert('Email and password are required');
      return;
    }

    if (this.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    this.api.register(this.email, this.password).subscribe({
      next: () => {
        alert('Account created! Please login.');
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        alert(err?.error?.message || 'Registration failed');
      }
    });
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }
}