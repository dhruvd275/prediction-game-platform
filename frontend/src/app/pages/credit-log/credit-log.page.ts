import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline, walletOutline, trendingDownOutline, trendingUpOutline } from 'ionicons/icons';

@Component({
  selector: 'app-credit-log',
  templateUrl: './credit-log.page.html',
  styleUrls: ['./credit-log.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class CreditLogPage implements ViewWillEnter {

  allLog: any[] = [];
  log: any[] = [];
  loading = true;
  errorMessage = '';
  filter: 'all' | 'STAKE' | 'PAYOUT' = 'all';
  credits: string | null = null;
  menuOpen = false;

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, menuOutline, walletOutline, trendingDownOutline, trendingUpOutline });
  }

  ionViewWillEnter() {
    this.menuOpen = false;
    this.loadCredits();
    this.loadLog();
  }

  loadCredits() {
    this.api.me().subscribe({
      next: (res: any) => {
        this.credits = res.user.credits;
      },
      error: () => {}
    });
  }

  loadLog() {
    this.loading = true;
    this.errorMessage = '';
    this.api.myCreditLog().subscribe({
      next: (res: any) => {
        this.allLog = res.log || [];
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load credit log. Please try again.';
      }
    });
  }

  setFilter(filter: 'all' | 'STAKE' | 'PAYOUT') {
    this.filter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.filter === 'all') {
      this.log = this.allLog;
    } else {
      this.log = this.allLog.filter(entry => entry.type === this.filter);
    }
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  goEvents() {
    this.router.navigateByUrl('/events');
  }

  goHistory() {
    this.router.navigateByUrl('/history');
  }

  goCreditLog() {
    this.router.navigateByUrl('/credit-log');
  }

  goLeaderboard() {
    this.router.navigateByUrl('/leaderboard');
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.api.clearToken();
    this.router.navigateByUrl('/login');
  }
}