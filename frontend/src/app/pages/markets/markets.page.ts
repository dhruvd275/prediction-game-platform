import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-markets',
  templateUrl: './markets.page.html',
  styleUrls: ['./markets.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class MarketsPage implements OnInit {

  eventId!: number;
  event: any = null;

  markets: any[] = [];
  loading = true;
  credits: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router
  ) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
    this.loadCredits();
  }

  load() {
    this.loading = true;

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
        alert('Failed to load markets');
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

  openPredict(m: any) {
    if (m.status !== 'OPEN') return;
    this.router.navigateByUrl(`/markets/${m.id}/predict`);
  }
}