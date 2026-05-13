import { Component, Input, ViewChild, ElementRef } from '@angular/core';

export interface ReceiptData {
  receiptNo: string;
  date: Date;
  memberName: string;
  memberPhone: string;
  amount: number;
  amountInWords: string;
  paymentMethod: 'UPI' | 'PhonePe' | 'Bank Transfer';
  transactionId: string;
  purpose: string;
  approvedBy?: string;
  approvalDate?: Date;
}

@Component({
  selector: 'app-receipt-generator',
  templateUrl: './receipt-generator.component.html',
  styleUrls: ['./receipt-generator.component.scss'],
  standalone: false
})
export class ReceiptGeneratorComponent {
  @Input() receiptData: ReceiptData | null = null;
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  organizationName = 'BRAHMAPUR SABUJA BAHINI';
  odiaText = 'ବ୍ରହ୍ମପୁର ସବୁଜ ବାହିନୀ';
  registeredNo = 'GJM 8937-83 of 2019-2020';
  address = 'Ganesh Nagar 5th Lane, Near Old Berhampur High School, BRAHMAPUR- 760 002 (Gm.) Odisha';
  contacts = [
    { name: 'Sibaram', phone: '9777377039' },
    { name: 'Dilip', phone: '7789092442' },
    { name: 'Susil', phone: '9090915747' }
  ];

  primaryColor = '#2E7D32'; // Forest Green

  /**
   * Convert number to words in English
   */
  numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convert = (n: number): string => {
      if (n === 0) {
        return '';
      } else if (n < 10) {
        return ones[n];
      } else if (n < 20) {
        return teens[n - 10];
      } else if (n < 100) {
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      } else if (n < 1000) {
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
      } else if (n < 100000) {
        return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
      } else if (n < 10000000) {
        return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
      }
      return '';
    };

    return convert(num);
  }

  /**
   * Download receipt as PDF
   */
  async downloadAsPDF() {
    if (!this.receiptContent) return;

    // Dynamic import html2pdf
    const html2pdf = (await import('html2pdf.js')).default;

    const element = this.receiptContent.nativeElement;
    const opt = {
      margin: 10,
      filename: `Receipt_${this.receiptData?.receiptNo}.pdf`,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
  }

  /**
   * Print receipt
   */
  printReceipt() {
    const printContent = this.receiptContent.nativeElement.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
  }

  /**
   * Share receipt via email
   */
  shareViaEmail() {
    const email = `mailto:?subject=Brahmapur%20Sabuja%20Bahini%20Receipt&body=Receipt%20No:%20${this.receiptData?.receiptNo}%0AAmount:%20₹${this.receiptData?.amount}`;
    window.location.href = email;
  }
}
