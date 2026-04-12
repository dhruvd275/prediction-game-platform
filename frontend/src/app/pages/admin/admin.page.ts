import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, peopleOutline, calendarOutline, analyticsOutline, lockClosedOutline, flashOutline, checkmarkCircleOutline, addCircleOutline, settingsOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class AdminPage implements ViewWillEnter {

  stats: any = null;
  loading = true;

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, peopleOutline, calendarOutline, analyticsOutline, lockClosedOutline, flashOutline, checkmarkCircleOutline, addCircleOutline, settingsOutline });
  }

  ionViewWillEnter() {
    const key = this.api.getAdminKey();
    if (!key) {
      this.router.navigateByUrl('/admin-login');
      return;
    }
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.api.adminGetStats().subscribe({
      next: (res: any) => {
        this.stats = res.stats;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.api.clearAdminKey();
        this.router.navigateByUrl('/admin-login');
      }
    });
  }

  goMarkets() { this.router.navigateByUrl('/admin-markets'); }
  goCreateEvent() { this.router.navigateByUrl('/admin-create-event'); }

  logout() {
    this.api.clearAdminKey();
    this.router.navigateByUrl('/admin-login');
  }
}