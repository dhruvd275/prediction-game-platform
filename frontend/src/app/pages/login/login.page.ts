import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { eye, eyeOff } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class LoginPage {

  email = '';
  password = '';
  errorMessage = '';
  loading = false;
  showPassword = false;

  constructor(private api: Api, private router: Router) {
    addIcons({ eye, eyeOff });
  }

  validate(): string {
    if (!this.email.trim()) return 'Email is required';
    if (!this.password) return 'Password is required';
    return '';
  }

  login() {
    this.errorMessage = this.validate();
    if (this.errorMessage) return;

    this.loading = true;

    this.api.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.api.setToken(res.token);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Login failed';
      }
    });
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }
}