import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline, walletOutline, trophyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class LeaderboardPage implements ViewWillEnter {

  leaderboard: any[] = [];
  topThree: any[] = [];
  rest: any[] = [];
  loading = true;
  errorMessage = '';
  credits: string | null = null;
  currentUserId: number | null = null;
  menuOpen = false;

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, menuOutline, walletOutline, trophyOutline });
  }

  ionViewWillEnter() {
    this.menuOpen = false;
    this.loadCurrentUser();
    this.loadLeaderboard();
  }

  loadCurrentUser() {
    this.api.me().subscribe({
      next: (res: any) => {
        this.credits = res.user.credits;
        this.currentUserId = res.user.id;
      },
      error: () => {}
    });
  }

  loadLeaderboard() {
    this.loading = true;
    this.errorMessage = '';
    this.api.getLeaderboard().subscribe({
      next: (res: any) => {
        this.leaderboard = res.leaderboard || [];
        this.topThree = this.leaderboard.slice(0, 3);
        this.rest = this.leaderboard.slice(3);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load leaderboard. Please try again.';
      }
    });
  }

  isCurrentUser(user: any): boolean {
    return this.currentUserId !== null && user.id === this.currentUserId;
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