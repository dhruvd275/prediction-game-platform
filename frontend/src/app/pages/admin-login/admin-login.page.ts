import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { eye, eyeOff, shieldCheckmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  styleUrls: ['./admin-login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminLoginPage {

  adminKey = '';
  errorMessage = '';
  loading = false;
  showKey = false;

  constructor(private api: Api, private router: Router) {
    addIcons({ eye, eyeOff, shieldCheckmarkOutline });
  }

  login() {
    this.errorMessage = '';
    if (!this.adminKey.trim()) {
      this.errorMessage = 'Enter the admin key';
      return;
    }

    this.loading = true;
    this.api.setAdminKey(this.adminKey.trim());

    this.api.adminAutoLock().subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/admin');
      },
      error: () => {
        this.loading = false;
        this.api.clearAdminKey();
        this.errorMessage = 'Invalid admin key';
      }
    });
  }
}