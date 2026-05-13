import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { PaymentService, PaymentTransaction } from '../services/payment.service';
import { MembersService } from '../services/members.service';

@Component({
  selector: 'app-admin-fees',
  templateUrl: './admin-fees.page.html',
  styleUrls: ['./admin-fees.page.scss'],
  standalone: false
})
export class AdminFeesPage implements OnInit {
  selectedTab: 'pending' | 'verified' | 'rejected' | 'members' = 'pending';
  
  pendingPayments: PaymentTransaction[] = [];
  verifiedPayments: PaymentTransaction[] = [];
  rejectedPayments: PaymentTransaction[] = [];
  
  allMembers: any[] = [];
  totalRevenue: number = 0;
  monthlyTarget: number = 0;
  
  selectedPaymentId: string = '';
  rejectReason: string = '';
  
  constructor(
    private paymentService: PaymentService,
    private membersService: MembersService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadPayments();
    this.loadMembers();
    this.calculateStatistics();
  }

  loadPayments() {
    this.paymentService.getPendingPayments().subscribe(payments => {
      this.pendingPayments = payments;
    });

    // Load verified payments (would need additional method in service)
    this.verifiedPayments = [];
    
    // Load rejected payments
    this.rejectedPayments = [];
  }

  loadMembers() {
    this.membersService.getAllMembers().subscribe(members => {
      this.allMembers = members;
    });
  }

  calculateStatistics() {
    // Calculate total revenue and monthly target
    let total = 0;
    this.verifiedPayments.forEach(p => {
      total += p.amount;
    });
    this.totalRevenue = total;
    this.monthlyTarget = this.allMembers.length * 200; // 200 per member
  }

  async approvePayment(payment: PaymentTransaction) {
    const loading = await this.loadingController.create({
      message: 'Approving payment...'
    });
    await loading.present();

    try {
      const result = await this.paymentService.verifyPayment(payment.id, 'admin');
      await loading.dismiss();

      if (result.success) {
        this.pendingPayments = this.pendingPayments.filter(p => p.id !== payment.id);
        this.verifiedPayments.push(payment);
        this.calculateStatistics();
        
        const toast = await this.toastController.create({
          message: 'Payment approved successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showAlert('Error', error.message || 'Failed to approve payment');
    }
  }

  async rejectPaymentWithReason(payment: PaymentTransaction) {
    const alert = await this.alertController.create({
      header: 'Reject Payment',
      message: 'Please provide a reason for rejection',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Enter rejection reason',
          value: this.rejectReason
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Reject',
          handler: async (data) => {
            await this.rejectPayment(payment, data.reason);
          }
        }
      ]
    });
    await alert.present();
  }

  async rejectPayment(payment: PaymentTransaction, reason: string = '') {
    const loading = await this.loadingController.create({
      message: 'Rejecting payment...'
    });
    await loading.present();

    try {
      const result = await this.paymentService.rejectPayment(payment.id, reason);
      await loading.dismiss();

      if (result.success) {
        this.pendingPayments = this.pendingPayments.filter(p => p.id !== payment.id);
        this.rejectedPayments.push(payment);
        
        const toast = await this.toastController.create({
          message: 'Payment rejected',
          duration: 2000,
          position: 'bottom',
          color: 'warning'
        });
        await toast.present();
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showAlert('Error', error.message || 'Failed to reject payment');
    }
  }

  getMemberDetails(memberId: string) {
    return this.allMembers.find(m => m.id === memberId);
  }

  exportReport() {
    const csv = this.generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `membership_fees_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(): string {
    let csv = 'Member ID,Name,Amount,Date,Status,Transaction ID\n';
    
    [...this.pendingPayments, ...this.verifiedPayments, ...this.rejectedPayments].forEach(p => {
      const member = this.getMemberDetails(p.memberId);
      csv += `${p.memberId},"${member?.name || 'Unknown'}",${p.amount},"${new Date(p.date).toLocaleDateString()}",${p.status},${p.transactionId}\n`;
    });
    
    return csv;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  getProgressPercentage(): number {
    return Math.min((this.totalRevenue / this.monthlyTarget) * 100, 100);
  }
}
