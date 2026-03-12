import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
})
export class EventsPage implements OnInit {

  events: any[] = [];
  loading = true;

  constructor(private api: Api, private router: Router) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.api.getEvents().subscribe({
      next: (res: any) => {
        this.events = res.events || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        alert('Failed to load events');
      }
    });
  }

  openMarkets(eventId: number) {
  console.log('clicked event:', eventId);
  this.router.navigateByUrl(`/events/${eventId}/markets`);
}

  
}