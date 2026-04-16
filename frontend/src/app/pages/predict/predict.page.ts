import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, menuOutline, arrowBackOutline, flashOutline, lockClosedOutline, checkmarkCircleOutline, walletOutline } from 'ionicons/icons';

@Component({
  selector: 'app-predict',
  templateUrl: './predict.page.html',
  styleUrls: ['./predict.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class PredictPage implements ViewWillEnter {

  marketId!: number;
  market: any = null;
  options: any[] = [];

  selection = '';
  stake: number | null = null;

  loading = false;
  credits: string | null = null;
  errorMessage = '';
  successMessage = '';
  menuOpen = false;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router
  ) {
    addIcons({ logOutOutline, menuOutline, arrowBackOutline, flashOutline, lockClosedOutline, checkmarkCircleOutline, walletOutline });
  }

  ionViewWillEnter() {
    this.marketId = Number(this.route.snapshot.paramMap.get('id'));
    this.errorMessage = '';
    this.successMessage = '';
    this.selection = '';
    this.stake = null;
    this.loading = false;
    this.market = null;
    this.options = [];
    this.menuOpen = false;
    this.loadMarket();
    this.loadOptions();
    this.loadCredits();
  }

  loadMarket() {
    this.api.getMarket(this.marketId).subscribe({
      next: (res: any) => {
        this.market = res.market;
      },
      error: () => {
        this.errorMessage = 'Failed to load market info';
      }
    });
  }

  loadOptions() {
    this.api.getMarketOptions(this.marketId).subscribe({
      next: (res: any) => {
        this.options = res.options || [];
      },
      error: () => {
        this.options = [];
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

  get isTwoTeam(): boolean {
    const sport = this.market?.sport?.toUpperCase();
    return sport === 'CRICKET' || sport === 'FOOTBALL';
  }

  get selectionLabel(): string {
    return this.isTwoTeam ? 'Select Team' : 'Select Driver';
  }

  get selectionPlaceholder(): string {
    return this.isTwoTeam ? 'Selection (e.g., CSK)' : 'Selection (e.g., VER)';
  }

  selectTeam(value: string) {
    this.selection = value;
  }

  get potentialPayout(): string {
    if (!this.stake || !this.market?.multiplier) return '0.00';
    return (Number(this.stake) * Number(this.market.multiplier)).toFixed(2);
  }

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selection) {
      this.errorMessage = this.isTwoTeam ? 'Select a team' : 'Select a driver';
      return;
    }

    const stakeNum = Number(this.stake);
    if (!this.stake || !Number.isFinite(stakeNum) || stakeNum <= 0) {
      this.errorMessage = 'Stake must be a positive number';
      return;
    }

    if (this.credits !== null && stakeNum > Number(this.credits)) {
      this.errorMessage = 'Stake cannot be more than your credits';
      return;
    }

    this.loading = true;

    this.api.submitPrediction(this.marketId, this.selection, stakeNum).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.credits = res.credits;
        this.successMessage = 'Prediction submitted!';
        setTimeout(() => {
          this.router.navigateByUrl('/events');
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Failed to submit prediction';
      }
    });
  }

  goBack() {
    if (this.market?.event_id) {
      this.router.navigateByUrl(`/events/${this.market.event_id}/markets`);
    } else {
      this.router.navigateByUrl('/events');
    }
  }

  goHome() { this.router.navigateByUrl('/home'); }
  goEvents() { this.router.navigateByUrl('/events'); }
  goHistory() { this.router.navigateByUrl('/history'); }
  goCreditLog() { this.router.navigateByUrl('/credit-log'); }
  goLeaderboard() { this.router.navigateByUrl('/leaderboard'); }
  toggleMenu() { this.menuOpen = !this.menuOpen; }
  logout() { this.api.clearToken(); this.router.navigateByUrl('/login'); }
}