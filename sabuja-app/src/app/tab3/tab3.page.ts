import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { DataService } from '../services/data.service';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  joinDate: string;
  contributions: number;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit {
  currentUser: any = null;
  topMembers: TeamMember[] = [];
  totalMembers: number = 0;

  constructor(
    private afAuth: AngularFireAuth,
    private dataService: DataService
  ) {
    this.generateTopMembers();
  }

  ngOnInit() {
    this.checkCurrentUser();
  }

  checkCurrentUser() {
    this.afAuth.authState.subscribe(user => {
      this.currentUser = user;
    });
  }

  generateTopMembers() {
    // Generate mock team members - in production, fetch from Firebase
    const avatarColors = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Brent',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Christian',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Daisy',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Emile'
    ];

    const roles = ['Founder', 'Core Member', 'Active Volunteer', 'Volunteer', 'Supporter'];
    const names = ['Raj Kumar', 'Priya Singh', 'Amit Patel', 'Neha Sharma', 'Vikram Rao', 'Sneha Desai'];

    this.topMembers = names.map((name, index) => ({
      id: `member_${index}`,
      name: name,
      role: roles[index % roles.length],
      avatar: avatarColors[index],
      joinDate: new Date(Date.now() - Math.random() * 400 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      contributions: Math.floor(Math.random() * 50) + 5
    }));

    this.totalMembers = 500; // Total members count
  }
}
