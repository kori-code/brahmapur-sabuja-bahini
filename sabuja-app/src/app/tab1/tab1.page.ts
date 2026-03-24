import { Component, OnInit } from '@angular/core';
import { DataService, Event, Service } from '../services/data.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  services: Service[] = [];
  events: Event[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.loadServices();
    this.loadEvents();
  }

  loadServices() {
    this.services = this.dataService.getServices();
  }

  loadEvents() {
    this.events = this.dataService.getEvents();
  }

  registerEvent(eventId: string) {
    console.log('Registered for event:', eventId);
    // Add registration logic here
  }
}
