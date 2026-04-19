import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { logOutOutline, arrowBackOutline, lockClosedOutline, flashOutline, checkmarkCircleOutline, settingsOutline, chevronDownOutline, chevronUpOutline, trashOutline, addOutline } from 'ionicons/icons';

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

  marketTypesBySport: { [key: string]: { value: string; label: string }[] } = {
    F1: [
      { value: 'race_p1', label: 'Race P1 (Winner)' },
      { value: 'race_p2', label: 'Race P2' },
      { value: 'race_p3', label: 'Race P3' },
      { value: 'pole', label: 'Pole Position' },
      { value: 'sprint_p1', label: 'Sprint P1' },
      { value: 'sprint_p2', label: 'Sprint P2' },
      { value: 'sprint_p3', label: 'Sprint P3' },
      { value: 'fastest_lap', label: 'Fastest Lap' },
    ],
    CRICKET: [
      { value: 'match_winner', label: 'Match Winner' },
      { value: 'toss_winner', label: 'Toss Winner' },
    ],
    FOOTBALL: [
      { value: 'match_winner', label: 'Match Winner' },
    ],
  };

  constructor(private api: Api, private router: Router) {
    addIcons({ logOutOutline, arrowBackOutline, lockClosedOutline, flashOutline, checkmarkCircleOutline, settingsOutline, chevronDownOutline, chevronUpOutline, trashOutline, addOutline });
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
          confirmDelete: false,
        }));

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
              showAddForm: false,
              newMarket: { type: '', multiplier: null, cutoffAt: '' },
              addError: '',
            };
          }
          groupsMap[m.event_id].markets.push(m);
          if (m.status === 'OPEN') groupsMap[m.event_id].openCount++;
          if (m.status === 'LOCKED') groupsMap[m.event_id].lockedCount++;
          if (m.status === 'RESOLVED') groupsMap[m.event_id].resolvedCount++;
        });

        this.eventGroups = Object.values(groupsMap);
        this.loading = false;

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

  formatDate(dateStr: string): string {
  const utcStr = dateStr.endsWith('Z') ? dateStr : dateStr.replace(' ', 'T') + 'Z';
  return new Date(utcStr).toLocaleString('en-IE', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  });
}

  toggleGroup(group: any) {
    group.expanded = !group.expanded;
  }

  getMarketTypes(sport: string) {
    return this.marketTypesBySport[sport?.toUpperCase()] || [];
  }

  addMarket(group: any) {
    group.addError = '';
    const m = group.newMarket;

    if (!m.type || !m.multiplier || !m.cutoffAt) {
      group.addError = 'Fill in all fields';
      return;
    }
    const payload = [{
      type: m.type,
      multiplier: m.multiplier,
      cutoff_at: m.cutoffAt,
    }];

    this.api.adminCreateMarkets(group.event_id, payload).subscribe({
      next: () => {
        this.successMessage = 'Market added!';
        group.showAddForm = false;
        group.newMarket = { type: '', multiplier: null, cutoffAt: '' };
        this.loadMarkets();
      },
      error: (err) => {
        group.addError = err?.error?.message || 'Failed to add market';
      }
    });
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

  deleteMarket(m: any) {
    this.errorMessage = '';
    this.successMessage = '';
    this.api.adminDeleteMarket(m.market_id).subscribe({
      next: () => {
        this.successMessage = 'Market deleted';
        this.loadMarkets();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to delete market';
      }
    });
  }

  goAdmin() { this.router.navigateByUrl('/admin'); }
  logout() { this.api.clearAdminKey(); this.router.navigateByUrl('/admin-login'); }
}