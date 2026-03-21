import { Component } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  paymentAmount: number | null = null;
  paymentPurpose: string = 'Monthly Subscription';
  paymentNote: string = '';
  
  // States for the UI
  showQrScreen: boolean = false;
  showSuccessScreen: boolean = false;
  qrCodeUrl: string = '';

  myUpiId: string = 'berhampursabujabahini@sbi'; 
  orgName: string = 'Brahmapur Sabuja Bahini';

  constructor(
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  async payNow() {
    if (!this.paymentAmount || this.paymentAmount <= 0) {
      const alert = await this.alertController.create({
        header: 'Amount Required',
        message: 'Please enter a valid amount.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

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

    setTimeout(() => {
      this.showQrScreen = false;
      this.showSuccessScreen = true;
    }, 2000);
  }

  downloadInvoice() {
    const invoice = `
      -----------------------------------------
      OFFICIAL PAYMENT RECEIPT
      BRAHMAPUR SABUJA BAHINI (BSB)
      -----------------------------------------
      Date: ${new Date().toLocaleDateString()}
      UPI ID: ${this.myUpiId}
      Organization: ${this.orgName}
      Amount: ₹${this.paymentAmount}
      Purpose: ${this.paymentPurpose}
      Status: SUCCESSFUL
      -----------------------------------------
      Thank you for your contribution!
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