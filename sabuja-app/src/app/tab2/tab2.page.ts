import { Component } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  paymentAmount: number | null = null;
  paymentPurpose: string = 'Monthly Subscription';
  paymentNote: string = '';

  // REPLACE THIS WITH YOUR REAL UPI ID
  myUpiId: string = 'berhampursabujabahini@sbi'; 
  merchantName: string = 'Brahmapur Sabuja Bahini';

  constructor(private alertController: AlertController) {}

  async payNow() {
    if (!this.paymentAmount || this.paymentAmount <= 0) {
      const alert = await this.alertController.create({
        header: 'Amount Required',
        message: 'Please enter the amount to contribute.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const encodedName = encodeURIComponent(this.merchantName);
    const encodedNote = encodeURIComponent(this.paymentPurpose);
    const upiUrl = `upi://pay?pa=${this.myUpiId}&pn=${encodedName}&am=${this.paymentAmount}&tn=${encodedNote}&cu=INR`;

    // Check if user is on Mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Direct deep link for phones
      window.location.href = upiUrl;
    } else {
      // Show QR Code for Desktop
      this.showQrModal(upiUrl);
    }
  }

  async showQrModal(upiUrl: string) {
    // We use a public QR API to generate the image based on the UPI string
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    const alert = await this.alertController.create({
      header: 'Scan to Pay',
      subHeader: `Amount: ₹${this.paymentAmount}`,
      message: `
        <div style="text-align: center;">
          <p>Please scan this QR code using Google Pay, PhonePe, or BHIM.</p>
          <img src="${qrImageUrl}" style="margin: 20px auto; display: block; border: 5px solid #fff; border-radius: 10px;" />
          <p>Once paid, click "I have Paid" to generate your receipt.</p>
        </div>
      `,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'I have Paid',
          handler: () => {
            this.generateInvoice();
          }
        }
      ]
    });

    await alert.present();
  }

  generateInvoice() {
    // Simple logic to simulate success and download
    const invoiceContent = `
      BRAHMAPUR SABUJA BAHINI - RECEIPT
      ---------------------------------
      Purpose: ${this.paymentPurpose}
      Amount Paid: ₹${this.paymentAmount}
      Date: ${new Date().toLocaleDateString()}
      Status: SUCCESSFUL
      
      Thank you for keeping Brahmapur green!
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BSB_Receipt_${Date.now()}.txt`;
    a.click();
    
    alert("Payment confirmed! Your receipt has been downloaded.");
  }
}