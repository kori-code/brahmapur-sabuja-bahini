import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MembersService, MemberProfile } from '../services/members.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page implements OnInit {
  currentUser: any = null;
  allMembers: MemberProfile[] = [];
  displayedMembers: MemberProfile[] = [];
  totalMembers: number = 0;
  
  // Filter options
  selectedFilter: 'all' | 'regular' | 'volunteer' | 'patron' = 'all';
  searchTerm: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private membersService: MembersService
  ) {}

  ngOnInit() {
    this.checkCurrentUser();
    this.loadAllMembers();
  }

  checkCurrentUser() {
    this.afAuth.authState.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadAllMembers() {
    this.membersService.getAllMembers().subscribe(members => {
      this.allMembers = members;
      this.totalMembers = members.length;
      this.filterAndDisplayMembers();
    });
  }

  filterAndDisplayMembers() {
    let filtered = this.allMembers;

    // Apply membership type filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(m => m.membershipType.toLowerCase() === this.selectedFilter);
    }

    // Apply search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.phone.includes(term) ||
        m.address.toLowerCase().includes(term)
      );
    }

    this.displayedMembers = filtered;
  }

  onFilterChange() {
    this.filterAndDisplayMembers();
  }

  onSearchChange() {
    this.filterAndDisplayMembers();
  }

  getMembershipTypeColor(type: string): string {
    switch (type) {
      case 'Regular':
        return 'primary-green';
      case 'Volunteer':
        return 'success';
      case 'Patron':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getMembershipTypeIcon(type: string): string {
    switch (type) {
      case 'Regular':
        return 'person-circle-outline';
      case 'Volunteer':
        return 'heart-outline';
      case 'Patron':
        return 'star-outline';
      default:
        return 'person-outline';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  getMemberColor(memberId: number): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA15E', '#BC6C25', '#9B59B6', '#3498DB', '#E74C3C'
    ];
    return colors[memberId % colors.length];
  }
}

