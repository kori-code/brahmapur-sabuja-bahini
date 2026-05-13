import { Component, OnInit } from '@angular/core';
import { MembersService, MemberProfile } from '../../services/members.service';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-member-dashboard',
  templateUrl: './member-dashboard.page.html',
  styleUrls: ['./member-dashboard.page.scss'],
  standalone: false
})
export class MemberDashboardPage implements OnInit {
  currentMember: MemberProfile | null = null;
  monthsDue: number = 0;
  totalDue: number = 0;
  totalPaid: number = 0;
  recentPayments: any[] = [];
  subscriptionStatus: string = 'Active';
  lastPaymentDate: string = '';
  
  MONTHLY_FEE = 200;
  segmentValue = 'overview';

  constructor(
    private membersService: MembersService,
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMemberDashboard();
  }

  loadMemberDashboard() {
    this.membersService.getCurrentMemberProfile().subscribe(member => {
      if (member) {
        this.currentMember = member;
        this.subscriptionStatus = member.subscriptionStatus || 'Pending';
        this.loadPaymentData();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadPaymentData() {
    if (this.currentMember) {
      this.paymentService.getMemberPaymentHistory(this.currentMember.id).subscribe(payments => {
        this.recentPayments = payments.slice(0, 5);
        
        // Calculate total paid
        this.totalPaid = payments.reduce((sum, p) => {
          if (p.status === 'Verified') {
            return sum + p.amount;
          }
          return sum;
        }, 0);

        // Calculate months due
        if (this.currentMember) {
          this.monthsDue = this.membersService.calculateMonthsDue(this.currentMember);
          this.totalDue = this.monthsDue * this.MONTHLY_FEE;
        }

        // Get last payment date
        const verifiedPayments = payments.filter(p => p.status === 'Verified');
        if (verifiedPayments.length > 0) {
          this.lastPaymentDate = new Date(verifiedPayments[0].date).toLocaleDateString('en-IN');
        }
      });
    }
  }

  goToPayments() {
    this.router.navigate(['/tabs/tab2']);
  }

  viewPaymentHistory() {
    this.router.navigate(['/tabs/tab1']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'unverified':
        return 'danger';
      default:
        return 'medium';
    }
  }

  logout() {
    this.membersService.logout();
    this.router.navigate(['/login']);
  }
}
