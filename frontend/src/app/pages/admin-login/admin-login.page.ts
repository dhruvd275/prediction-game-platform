import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdminLoginPage {

  adminKey = '';

  constructor(private api: Api, private router: Router) {}

  login() {
    if (!this.adminKey.trim()) {
      alert('Enter the admin key');
      return;
    }

    // Verify the key by calling auto-lock (harmless — it only locks what's past cutoff)
    this.api.setAdminKey(this.adminKey.trim());

    this.api.adminAutoLock().subscribe({
      next: () => {
        alert('Admin access granted');
        this.router.navigateByUrl('/admin');
      },
      error: () => {
        this.api.clearAdminKey();
        alert('Invalid admin key');
      }
    });
  }
}