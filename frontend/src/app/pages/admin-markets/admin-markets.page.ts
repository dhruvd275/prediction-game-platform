import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, arrowBackOutline, lockClosedOutline, flashOutline, checkmarkCircleOutline, settingsOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';

@Component({
  selector: 'app-admin-markets',
  templateUrl: './admin-markets.page.html',
  styleUrls: ['./admin-markets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class AdminMarketsPage implements ViewWillEnter {

  eventGroups: any[] = [];
  loading = true;
  errorMessage = '';
  successMessage = '';

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, arrowBackOutline, lockClosedOutline, flashOutline, checkmarkCircleOutline, settingsOutline, chevronDownOutline, chevronUpOutline });
  }

  ionViewWillEnter() {
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
        const markets = (res.markets || []).map((m: any) => ({
          ...m,
          resolveResult: '',
          options: [],
        }));

        // Group by event
        const groupsMap: { [key: number]: any } = {};
        markets.forEach((m: any) => {
          if (!groupsMap[m.event_id]) {
            groupsMap[m.event_id] = {
              event_id: m.event_id,
              event_name: m.event_name,
              sport: m.sport,
              markets: [],
              expanded: false,
              openCount: 0,
              lockedCount: 0,
              resolvedCount: 0,
            };
          }
          groupsMap[m.event_id].markets.push(m);
          if (m.status === 'OPEN') groupsMap[m.event_id].openCount++;
          if (m.status === 'LOCKED') groupsMap[m.event_id].lockedCount++;
          if (m.status === 'RESOLVED') groupsMap[m.event_id].resolvedCount++;
        });

        this.eventGroups = Object.values(groupsMap);
        this.loading = false;

        // Fetch driver options for LOCKED markets
        markets.forEach((m: any) => {
          if (m.status === 'LOCKED') {
            this.api.getMarketOptions(m.market_id).subscribe({
              next: (opt: any) => { m.options = opt.options || []; },
              error: () => { m.options = []; }
            });
          }
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Failed to load markets';
      }
    });
  }

  toggleGroup(group: any) {
    group.expanded = !group.expanded;
  }

  autoLock() {
    this.errorMessage = '';
    this.successMessage = '';
    this.api.adminAutoLock().subscribe({
      next: (res: any) => {
        this.successMessage = `Locked ${res.locked_count} market(s)`;
        this.loadMarkets();
      },
      error: () => { this.errorMessage = 'Failed to auto-lock'; }
    });
  }

  resolve(m: any) {
    this.errorMessage = '';
    this.successMessage = '';
    if (!m.resolveResult) {
      this.errorMessage = 'Select a result';
      return;
    }
    this.api.adminResolveMarket(m.market_id, m.resolveResult).subscribe({
      next: (res: any) => {
        this.successMessage = `Resolved! Won: ${res.won}, Lost: ${res.lost}`;
        this.loadMarkets();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to resolve';
      }
    });
  }

  goAdmin() { this.router.navigateByUrl('/admin'); }
  logout() { this.api.clearAdminKey(); this.router.navigateByUrl('/admin-login'); }
}