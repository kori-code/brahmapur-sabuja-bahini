import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { PaymentService, PaymentTransaction } from '../services/payment.service';
import { MembersService, MemberProfile } from '../services/members.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page implements OnInit {
  paymentAmount: number | null = null;
  paymentPurpose: string = 'Monthly Subscription';
  paymentNote: string = '';
  currentMember: MemberProfile | null = null;
  
  // States for the UI
  showQrScreen: boolean = false;
  showPendingScreen: boolean = false;
  showSuccessScreen: boolean = false;
  currentTransactionId: string = '';
  paymentMethod: 'upi' | 'phonepe' = 'phonepe';
  
  myUpiId: string = 'berhampursabujabahini@sbi'; 
  orgName: string = 'Brahmapur Sabuja Bahini';
  merchantId: string = 'BSBNGO001';

  paymentHistory: PaymentTransaction[] = [];
  donationStats: any = {};

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private paymentService: PaymentService,
    private membersService: MembersService
  ) {}

  ngOnInit() {
    this.getCurrentMember();
    this.loadPaymentHistory();
    this.loadDonationStats();
  }

  getCurrentMember() {
    this.membersService.getCurrentMemberProfile().subscribe(member => {
      this.currentMember = member;
      if (member) {
        this.loadPaymentHistory();
      }
    });
  }

  loadPaymentHistory() {
    if (this.currentMember) {
      this.paymentService.getMemberPaymentHistory(this.currentMember.id).subscribe(
        (history) => {
          this.paymentHistory = history;
        }
      );
    }
  }

  loadDonationStats() {
    this.paymentService.getDonationStats().subscribe(
      (stats) => {
        this.donationStats = stats;
      }
    );
  }

  async payNow() {
    if (!this.paymentAmount || this.paymentAmount < 10) {
      await this.showAlert('Invalid Amount', 'Minimum payment amount is ₹10');
      return;
    }

    if (!this.currentMember) {
      await this.showAlert('Error', 'Member information not found. Please login again.');
      return;
    }

    if (this.paymentMethod === 'phonepe') {
      await this.initiatePhonePePayment();
    } else {
      await this.initiateUpiPayment();
    }
  }

  async initiatePhonePePayment() {
    const loading = await this.loadingController.create({
      message: 'Initiating payment...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const response = await this.paymentService.initiatePayment({
        amount: this.paymentAmount || 0,
        purpose: this.paymentPurpose,
        phone: this.currentMember?.phone || '',
        email: this.currentMember?.email || '',
        memberId: this.currentMember?.id
      });

      await loading.dismiss();

      if (response.success) {
        this.currentTransactionId = response.transactionId || '';
        this.showPendingScreen = true;
        
        const toast = await this.toastController.create({
          message: 'Payment submitted for verification',
          duration: 3000,
          position: 'bottom',
          color: 'warning'
        });
        await toast.present();
      } else {
        await this.showAlert('Payment Failed', response.message);
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showAlert('Error', error.message || 'Payment initiation failed');
    }
  }

  async initiateUpiPayment() {
    const upiUrl = `upi://pay?pa=${this.myUpiId}&pn=${encodeURIComponent(this.orgName)}&am=${this.paymentAmount}&tn=${encodeURIComponent(this.paymentPurpose)}&cu=INR`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = upiUrl;
      
      // After some time, initiate the payment record in Firestore
      setTimeout(async () => {
        const response = await this.paymentService.initiatePayment({
          amount: this.paymentAmount || 0,
          purpose: this.paymentPurpose,
          phone: this.currentMember?.phone || '',
          email: this.currentMember?.email || '',
          memberId: this.currentMember?.id
        });
        
        if (response.success) {
          this.currentTransactionId = response.transactionId || '';
          this.showPendingScreen = true;
        }
      }, 3000);
    } else {
      // Generate QR and show the desktop UI
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;
      this.showQRDialog(qrUrl);
    }
  }

  async showQRDialog(qrUrl: string) {
    const alert = await this.alertController.create({
      header: 'Scan QR Code',
      cssClass: 'qr-alert',
      message: `
        <div style="text-align: center; padding: 20px;">
          <img src="${qrUrl}" alt="UPI QR Code" style="width: 250px; height: 250px; margin: 20px 0;">
          <p>Scan this QR code with your UPI app to complete the payment</p>
        </div>
      `,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'I have paid',
          handler: async () => {
            // Record payment attempt
            const response = await this.paymentService.initiatePayment({
              amount: this.paymentAmount || 0,
              purpose: this.paymentPurpose,
              phone: this.currentMember?.phone || '',
              email: this.currentMember?.email || '',
              memberId: this.currentMember?.id
            });
            
            if (response.success) {
              this.currentTransactionId = response.transactionId || '';
              this.showPendingScreen = true;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async verifyPaymentStatus() {
    if (!this.currentTransactionId) return;

    const loading = await this.loadingController.create({
      message: 'Checking payment status...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const transaction = await this.paymentService.getPaymentStatus(this.currentTransactionId);
      await loading.dismiss();

      if (transaction) {
        if (transaction.status === 'Verified') {
          this.showPendingScreen = false;
          this.showSuccessScreen = true;
          
          const toast = await this.toastController.create({
            message: 'Payment verified successfully!',
            duration: 3000,
            position: 'bottom',
            color: 'success'
          });
          await toast.present();
        } else if (transaction.status === 'Rejected') {
          this.showPendingScreen = false;
          await this.showAlert('Payment Rejected', 'Your payment has been rejected. Please contact admin.');
          this.resetForm();
        } else {
          await this.showAlert('Pending', 'Your payment is still pending admin verification. Please wait or contact admin.');
        }
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showAlert('Error', error.message || 'Failed to check status');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  downloadReceipt() {
    // This will be implemented in the receipt generation component
    const toast = this.toastController.create({
      message: 'Receipt download feature coming soon!',
      duration: 2000,
      position: 'bottom'
    });
    toast.then(t => t.present());
  }

  resetForm() {
    this.showSuccessScreen = false;
    this.showPendingScreen = false;
    this.paymentAmount = null;
    this.paymentPurpose = 'Monthly Subscription';
    this.currentTransactionId = '';
  }
}