import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-credit-log',
  templateUrl: './credit-log.page.html',
  styleUrls: ['./credit-log.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class CreditLogPage implements OnInit {

  log: any[] = [];
  loading = true;

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadLog();
  }

  loadLog() {
    this.loading = true;
    this.api.myCreditLog().subscribe({
      next: (res: any) => {
        this.log = res.log || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load credit log');
      }
    });
  }
}