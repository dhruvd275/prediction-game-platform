import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-predict',
  templateUrl: './predict.page.html',
  styleUrls: ['./predict.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class PredictPage implements OnInit {

  marketId!: number;
  market: any = null;
  options: any[] = [];

  selection = '';
  stake: number | null = null;

  loading = false;
  credits: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router
  ) {}

  ngOnInit() {
    this.marketId = Number(this.route.snapshot.paramMap.get('id'));
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
        alert('Failed to load market info');
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

  submit() {
    if (!this.selection) {
      alert('Select a driver');
      return;
    }
    if (!this.stake || this.stake <= 0) {
      alert('Enter a valid stake');
      return;
    }

    this.loading = true;

    this.api.submitPrediction(this.marketId, this.selection, this.stake).subscribe({
      next: () => {
        this.loading = false;
        alert('Prediction submitted!');
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message || 'Failed to submit prediction');
      }
    });
  }
}