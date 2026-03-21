import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  paymentAmount: number | null = null;
  paymentPurpose: string = 'Monthly Subscription';
  paymentNote: string = '';

  constructor() {}

  payNow() {
    if (!this.paymentAmount || this.paymentAmount <= 0) {
      alert("Please enter a valid amount to continue.");
      return;
    }
    // Logic for payment gateway goes here
    console.log("Processing:", this.paymentAmount, this.paymentPurpose, this.paymentNote);
  }
}