import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PhonePePaymentRequest {
  amount: number;
  purpose: string;
  phone: string;
  email: string;
  userEmail?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  // PhonePe Integration - Sample Configuration
  // In production, replace with actual PhonePe merchant credentials
  private readonly PHONEPE_API_KEY = 'PROD_API_KEY'; // Replace with actual key
  private readonly MERCHANT_ID = 'BSBNGO001'; // Replace with actual merchant ID
  private readonly REDIRECT_URL = 'https://berhampursabujabahini.in/payment-success';
  
  constructor(private http: HttpClient) { }

  /**
   * Initiate PhonePe payment
   * For production, you'll need to integrate with PhonePe's actual API
   */
  initiatePayment(request: PhonePePaymentRequest): Observable<PaymentResponse> {
    // This is a mock implementation
    // In production, make actual API call to PhonePe
    return new Observable(observer => {
      // Simulate payment processing
      setTimeout(() => {
        const transactionId = 'BSB_' + Date.now() + '_' + Math.random().toString(36).substring(7);
        observer.next({
          success: true,
          transactionId: transactionId,
          message: 'Payment initiated successfully'
        });
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Verify payment status
   */
  verifyPayment(transactionId: string): Observable<PaymentResponse> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          success: true,
          message: 'Payment verified successfully'
        });
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Get payment history for a user
   */
  getPaymentHistory(email: string): Observable<any[]> {
    return new Observable(observer => {
      // Mock data - in production, fetch from backend
      const mockHistory = [
        {
          id: 1,
          amount: 500,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'Success',
          transactionId: 'TXN001'
        },
        {
          id: 2,
          amount: 1000,
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          status: 'Success',
          transactionId: 'TXN002'
        }
      ];
      observer.next(mockHistory);
      observer.complete();
    });
  }

  /**
   * Calculate donation statistics
   */
  getDonationStats(): Observable<any> {
    return new Observable(observer => {
      observer.next({
        totalDonations: 250000,
        totalDonors: 1200,
        thisMonthDonations: 45000,
        thisMonthDonors: 280
      });
      observer.complete();
    });
  }
}
