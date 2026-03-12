import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.page.html',
  styleUrls: ['./leaderboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class LeaderboardPage implements OnInit {

  leaderboard: any[] = [];
  loading = true;

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.loading = true;
    this.api.getLeaderboard().subscribe({
      next: (res: any) => {
        this.leaderboard = res.leaderboard || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load leaderboard');
      }
    });
  }
}