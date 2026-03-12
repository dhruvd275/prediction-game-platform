import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-admin-markets',
  templateUrl: './admin-markets.page.html',
  styleUrls: ['./admin-markets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class AdminMarketsPage implements OnInit {

  markets: any[] = [];
  loading = true;

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    const key = this.api.getAdminKey();
    if (!key) {
      this.router.navigateByUrl('/admin-login');
      return;
    }
    this.loadMarkets();
  }

  loadMarkets() {
    this.loading = true;
    this.api.adminGetMarkets().subscribe({
      next: (res: any) => {
        this.markets = (res.markets || []).map((m: any) => ({
          ...m,
          resolveResult: '',
        }));
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load markets');
      }
    });
  }

  autoLock() {
    this.api.adminAutoLock().subscribe({
      next: (res: any) => {
        alert(`Locked ${res.locked_count} market(s)`);
        this.loadMarkets();
      },
      error: () => {
        alert('Failed to auto-lock markets');
      }
    });
  }

  resolve(m: any) {
    if (!m.resolveResult.trim()) {
      alert('Enter a result (e.g. VER, HAM)');
      return;
    }

    this.api.adminResolveMarket(m.market_id, m.resolveResult.trim().toUpperCase()).subscribe({
      next: (res: any) => {
        alert(`Resolved! Won: ${res.won}, Lost: ${res.lost}`);
        this.loadMarkets();
      },
      error: (err) => {
        alert(err?.error?.message || 'Failed to resolve market');
      }
    });
  }
}