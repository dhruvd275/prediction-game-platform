import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class HistoryPage implements OnInit {

  predictions: any[] = [];
  loading = true;

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadPredictions();
  }

  loadPredictions() {
    this.loading = true;
    this.api.myPredictions().subscribe({
      next: (res: any) => {
        this.predictions = res.predictions || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load predictions');
      }
    });
  }
}