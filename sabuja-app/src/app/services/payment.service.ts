import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PhonePePaymentRequest {
  amount: number;
  purpose: string;
  phone: string;
  email: string;
  userEmail?: string;
  memberId?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  status?: 'Pending' | 'Verified' | 'Rejected';
}

export interface PaymentTransaction {
  id: string;
  memberId: string;
  amount: number;
  purpose: string;
  date: Date;
  status: 'Pending' | 'Verified' | 'Rejected';
  transactionId: string;
  paymentMethod: 'UPI' | 'PhonePe' | 'Bank Transfer';
  upiTransactionId?: string;
  approvedBy?: string;
  approvalDate?: Date;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  
  private readonly PHONEPE_API_KEY = 'PROD_API_KEY';
  private readonly MERCHANT_ID = 'BSBNGO001';
  private readonly REDIRECT_URL = 'https://berhampursabujabahini.in/payment-success';
  
  private pendingPayments = new BehaviorSubject<PaymentTransaction[]>([]);
  public pendingPayments$ = this.pendingPayments.asObservable();

  constructor(
    private http: HttpClient,
    private firestore: AngularFirestore
  ) {
    this.loadPendingPayments();
  }

  /**
   * Load all pending payments (for admin verification)
   */
  private loadPendingPayments() {
    this.firestore.collection<PaymentTransaction>('payments', 
      ref => ref.where('status', '==', 'Pending')
    ).valueChanges({ idField: 'id' }).subscribe(payments => {
      this.pendingPayments.next(payments);
    });
  }

  /**
   * Initiate PhonePe payment
   * Creates a pending transaction that awaits admin verification
   */
  async initiatePayment(request: PhonePePaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = 'BSB_' + Date.now() + '_' + Math.random().toString(36).substring(7);
      
      const transaction: PaymentTransaction = {
        id: transactionId,
        memberId: request.memberId || 'unknown',
        amount: request.amount,
        purpose: request.purpose,
        date: new Date(),
        status: 'Pending',
        transactionId: transactionId,
        paymentMethod: 'PhonePe',
        notes: `Payment initiated - awaiting verification`
      };

      // Save transaction to Firestore
      await this.firestore.collection('payments').doc(transactionId).set(transaction);

      // Also record in member's payment history
      if (request.memberId) {
        await this.recordMemberPayment(request.memberId, transaction);
      }

      return {
        success: true,
        transactionId: transactionId,
        status: 'Pending',
        message: 'Payment initiated successfully. Awaiting verification by admin.'
      };
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        message: 'Failed to initiate payment: ' + error.message
      };
    }
  }

  /**
   * Record payment in member's profile
   */
  private async recordMemberPayment(memberId: string, transaction: PaymentTransaction) {
    try {
      const memberRef = this.firestore.collection('members').doc(memberId);
      const memberDoc = await memberRef.get().toPromise();
      
      if (memberDoc && memberDoc.exists) {
        const member = memberDoc.data() as any;
        member.paymentHistory = member.paymentHistory || [];
        member.paymentHistory.push(transaction);
        
        await memberRef.update({
          paymentHistory: member.paymentHistory
        });
      }
    } catch (error) {
      console.error('Error recording member payment:', error);
    }
  }

  /**
   * Get payment status for a transaction
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentTransaction | null> {
    try {
      const doc = await this.firestore.collection('payments').doc(transactionId).get().toPromise();
      if (doc && doc.exists) {
        return doc.data() as PaymentTransaction;
      }
      return null;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      return null;
    }
  }

  /**
   * Verify payment (Admin only)
   */
  async verifyPayment(transactionId: string, approvedBy: string = 'admin'): Promise<PaymentResponse> {
    try {
      const transaction = await this.getPaymentStatus(transactionId);
      
      if (!transaction) {
        return {
          success: false,
          message: 'Transaction not found'
        };
      }

      // Update payment status to Verified
      await this.firestore.collection('payments').doc(transactionId).update({
        status: 'Verified',
        approvedBy: approvedBy,
        approvalDate: new Date()
      });

      // Update member's subscription status if payment is for membership
      if (transaction.purpose.includes('Membership') || transaction.purpose.includes('Monthly')) {
        await this.updateMemberSubscription(transaction.memberId, 'Active');
      }

      return {
        success: true,
        message: 'Payment verified successfully',
        status: 'Verified'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Verification failed: ' + error.message
      };
    }
  }

  /**
   * Reject payment (Admin only)
   */
  async rejectPayment(transactionId: string, reason: string = ''): Promise<PaymentResponse> {
    try {
      await this.firestore.collection('payments').doc(transactionId).update({
        status: 'Rejected',
        notes: reason || 'Payment rejected by admin'
      });

      return {
        success: true,
        message: 'Payment rejected',
        status: 'Rejected'
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Rejection failed: ' + error.message
      };
    }
  }

  /**
   * Update member subscription status
   */
  private async updateMemberSubscription(memberId: string, status: 'Active' | 'Pending' | 'Unverified') {
    try {
      await this.firestore.collection('members').doc(memberId).update({
        subscriptionStatus: status
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
    }
  }

  /**
   * Get payment history for a user
   */
  getMemberPaymentHistory(memberId: string): Observable<PaymentTransaction[]> {
    return this.firestore.collection<PaymentTransaction>('payments',
      ref => ref.where('memberId', '==', memberId).orderBy('date', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  /**
   * Get all pending payments (for admin dashboard)
   */
  getPendingPayments(): Observable<PaymentTransaction[]> {
    return this.firestore.collection<PaymentTransaction>('payments',
      ref => ref.where('status', '==', 'Pending').orderBy('date', 'desc')
    ).valueChanges({ idField: 'id' });
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

  /**
   * Get payment history (legacy - for compatibility)
   */
  getPaymentHistory(email: string): Observable<any[]> {
    return new Observable(observer => {
      const mockHistory = [
        {
          id: 1,
          amount: 500,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          status: 'Success',
          transactionId: 'TXN001'
        }
      ];
      observer.next(mockHistory);
      observer.complete();
    });
  }
}
