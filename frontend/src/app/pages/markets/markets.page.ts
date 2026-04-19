import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline, arrowBackOutline, calendarOutline, timeOutline, lockClosedOutline, checkmarkCircleOutline, flashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-markets',
  templateUrl: './markets.page.html',
  styleUrls: ['./markets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class MarketsPage implements ViewWillEnter {

  eventId!: number;
  event: any = null;

  markets: any[] = [];
  loading = true;
  errorMessage = '';
  menuOpen = false;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router
  ) {
    addIcons({ logOutOutline, menuOutline, arrowBackOutline, calendarOutline, timeOutline, lockClosedOutline, checkmarkCircleOutline, flashOutline });
  }

  ionViewWillEnter() {
  this.eventId = Number(this.route.snapshot.paramMap.get('id'));
  this.load();
}
  load() {
    this.loading = true;
    this.errorMessage = '';

    this.api.getEvent(this.eventId).subscribe({
      next: (res: any) => {
        this.event = res.event;
      },
      error: () => {
        this.event = null;
      }
    });

    this.api.getMarkets(this.eventId).subscribe({
      next: (res: any) => {
        this.markets = res.markets || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load markets. Please try again.';
      }
    });
  }

  openPredict(m: any) {
    if (m.status !== 'OPEN') return;
    this.router.navigateByUrl(`/markets/${m.id}/predict`);
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