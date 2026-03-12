import { Component } from '@angular/core';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../services/api';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HomePage implements ViewWillEnter {

  user: any = null;

  constructor(private api: Api, private router: Router) {}

  ionViewWillEnter() {
    this.loadUser();
  }

  loadUser() {
    const token = this.api.getToken();

    if (!token) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.api.me().subscribe({
      next: (res) => {
        this.user = res.user;
      },
      error: () => {
        this.api.clearToken();
        this.router.navigateByUrl('/login');
      }
    });
  }

  goEvents() {
    this.router.navigateByUrl('/events');
  }

  goHistory() {
    this.router.navigateByUrl('/history');
  }

  goLeaderboard() {
    this.router.navigateByUrl('/leaderboard');
  }

  logout() {
    this.api.clearToken();
    this.router.navigateByUrl('/login');
  }
}