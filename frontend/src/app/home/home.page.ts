import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
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
export class HomePage implements OnInit {

  user: any = null;

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    this.api.me().subscribe({
      next: (res) => {
        this.user = res.user;
      },
      error: () => {
        console.log('User not authenticated');
      }
    });
  }

  goEvents() {
    this.router.navigateByUrl('/events');
  }
}