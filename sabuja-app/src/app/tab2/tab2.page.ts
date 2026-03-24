import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { PaymentService } from '../services/payment.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page implements OnInit {
  paymentAmount: number | null = null;
  paymentPurpose: string = 'Monthly Contribution';
  paymentNote: string = '';
  userEmail: string = '';
  userPhone: string = '';
  
  // States for the UI
  showQrScreen: boolean = false;
  showSuccessScreen: boolean = false;
  qrCodeUrl: string = '';
  paymentMethod: 'upi' | 'phonepe' = 'phonepe'; // Default to PhonePe

  myUpiId: string = 'berhampursabujabahini@sbi'; 
  orgName: string = 'Brahmapur Sabuja Bahini';
  merchantId: string = 'BSBNGO001';

  paymentHistory: any[] = [];
  donationStats: any = {};

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private paymentService: PaymentService,
    private afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.getCurrentUser();
    this.loadPaymentHistory();
    this.loadDonationStats();
  }

  getCurrentUser() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userEmail = user.email || '';
      }
    });
  }

  loadPaymentHistory() {
    this.paymentService.getPaymentHistory(this.userEmail).subscribe(
      (history) => {
        this.paymentHistory = history;
      }
    );
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
      const alert = await this.alertController.create({
        header: 'Invalid Amount',
        message: 'Minimum donation amount is ₹10',
        buttons: ['OK']
      });
      await alert.present();
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
      message: 'Initiating PhonePe payment...',
    });
    await loading.present();

    const paymentRequest = {
      amount: this.paymentAmount || 0,
      purpose: this.paymentPurpose,
      phone: this.userPhone,
      email: this.userEmail,
      userEmail: this.userEmail
    };

    this.paymentService.initiatePayment(paymentRequest).subscribe(
      async (response) => {
        await loading.dismiss();
        if (response.success) {
          this.showSuccessScreen = true;
          const toast = await this.toastController.create({
            message: 'PhonePe payment initiated successfully!',
            duration: 3000,
            position: 'bottom'
          });
          await toast.present();
        }
      },
      async (error) => {
        await loading.dismiss();
        const alert = await this.alertController.create({
          header: 'Payment Failed',
          message: error.message || 'Unable to process payment',
          buttons: ['OK']
        });
        await alert.present();
      }
    );
  }

  async initiateUpiPayment() {
    const upiUrl = `upi://pay?pa=${this.myUpiId}&pn=${encodeURIComponent(this.orgName)}&am=${this.paymentAmount}&tn=${encodeURIComponent(this.paymentPurpose)}&cu=INR`;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      window.location.href = upiUrl;
    } else {
      // Generate QR and show the desktop UI
      this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;
      this.showQrScreen = true;
    }
  }

  async verifyPayment() {
    const loading = await this.loadingController.create({
      message: 'Verifying payment with bank...',
      duration: 2000
    });
    await loading.present();

    setTimeout(async () => {
      await loading.dismiss();
      this.showQrScreen = false;
      this.showSuccessScreen = true;
    }, 2000);
  }

  downloadInvoice() {
    const invoice = `
      -----------------------------------------
      OFFICIAL DONATION RECEIPT
      BRAHMAPUR SABUJA BAHINI (BSB)
      -----------------------------------------
      Date: ${new Date().toLocaleDateString()}
      Organization: ${this.orgName}
      Donor Email: ${this.userEmail}
      Amount: ₹${this.paymentAmount}
      Purpose: ${this.paymentPurpose}
      Payment Method: ${this.paymentMethod.toUpperCase()}
      Status: SUCCESSFUL
      Transaction ID: BSB_${Date.now()}
      -----------------------------------------
      Thank you for your generous contribution!
      Your support helps us create a greener Berhampur.
      -----------------------------------------
    `;
    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BSB_Receipt_${Date.now()}.txt`;
    a.click();
  }

  resetForm() {
    this.showSuccessScreen = false;
    this.paymentAmount = null;
    this.showQrScreen = false;
  }
}