import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-admin-create-event',
  templateUrl: './admin-create-event.page.html',
  styleUrls: ['./admin-create-event.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class AdminCreateEventPage {

  sport = '';
  name = '';
  startsAt = '';

  markets: any[] = [];

  loading = false;

  constructor(private api: Api, private router: Router) {
    const key = this.api.getAdminKey();
    if (!key) {
      this.router.navigateByUrl('/admin-login');
    }
  }

  addMarket() {
    this.markets.push({
      type: '',
      multiplier: null,
      cutoffAt: '',
    });
  }

  removeMarket(index: number) {
    this.markets.splice(index, 1);
  }

  submit() {
    if (!this.sport.trim() || !this.name.trim() || !this.startsAt) {
      alert('Fill in sport, name and start time');
      return;
    }

    if (this.markets.length === 0) {
      alert('Add at least one market');
      return;
    }

    for (const m of this.markets) {
      if (!m.type.trim() || !m.multiplier || !m.cutoffAt) {
        alert('Fill in all market fields');
        return;
      }
    }

    this.loading = true;

    // Step 1: Create the event
    this.api.adminCreateEvent(this.sport.trim(), this.name.trim(), this.startsAt).subscribe({
      next: (res: any) => {
        const eventId = res.event.id;

        // Step 2: Create markets for the event
        const marketsPayload = this.markets.map(m => ({
          type: m.type.trim(),
          multiplier: m.multiplier,
          cutoff_at: m.cutoffAt,
        }));

        this.api.adminCreateMarkets(eventId, marketsPayload).subscribe({
          next: () => {
            this.loading = false;
            alert('Event and markets created!');
            this.router.navigateByUrl('/admin');
          },
          error: () => {
            this.loading = false;
            alert('Event created but failed to add markets');
          }
        });
      },
      error: (err) => {
        this.loading = false;
        alert(err?.error?.message || 'Failed to create event');
      }
    });
  }
}