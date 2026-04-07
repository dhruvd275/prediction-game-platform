import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline, walletOutline } from 'ionicons/icons';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class HistoryPage implements ViewWillEnter {

  allPredictions: any[] = [];
  predictions: any[] = [];
  loading = true;
  errorMessage = '';
  filter: 'all' | 'PENDING' | 'WON' | 'LOST' = 'all';
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest';
  credits: string | null = null;
  menuOpen = false;

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, menuOutline, walletOutline });
  }

  ionViewWillEnter() {
    this.menuOpen = false;
    this.loadPredictions();
    this.loadCredits();
  }

  loadPredictions() {
    this.loading = true;
    this.errorMessage = '';
    this.api.myPredictions().subscribe({
      next: (res: any) => {
        this.allPredictions = res.predictions || [];
        this.applyFilterAndSort();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load predictions. Please try again.';
      }
    });
  }

  loadCredits() {
    this.api.me().subscribe({
      next: (res: any) => {
        this.credits = res.user.credits;
      },
      error: () => {}
    });
  }

  setFilter(filter: 'all' | 'PENDING' | 'WON' | 'LOST') {
    this.filter = filter;
    this.applyFilterAndSort();
  }

  applyFilterAndSort() {
    let result = [...this.allPredictions];

    // Filter
    if (this.filter !== 'all') {
      result = result.filter(p => p.prediction_status === this.filter);
    }

    // Sort
    if (this.sortBy === 'newest') {
      result.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
    } else if (this.sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime());
    } else if (this.sortBy === 'highest') {
      result.sort((a, b) => Number(b.stake) - Number(a.stake));
    } else if (this.sortBy === 'lowest') {
      result.sort((a, b) => Number(a.stake) - Number(b.stake));
    }

    this.predictions = result;
  }

  getPayout(p: any): string {
    return (Number(p.stake) * Number(p.multiplier)).toFixed(2);
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