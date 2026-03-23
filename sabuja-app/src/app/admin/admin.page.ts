import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, onSnapshot, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  // This array will hold the pending transactions from Firebase
  pendingPayments: any[] = [];

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    // 1. Create a reference to the 'contributions' collection
    const contributionsRef = collection(this.firestore, 'contributions');
    
    // 2. Query only for 'pending' status
    const q = query(contributionsRef, where('status', '==', 'pending'));

    // 3. Listen for real-time updates
    onSnapshot(q, (snapshot) => {
      this.pendingPayments = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      console.log("Current pending payments:", this.pendingPayments);
    });
  }

  // Function to Approve Payment
  async approve(id: string) {
    try {
      const docRef = doc(this.firestore, 'contributions', id);
      await updateDoc(docRef, { 
        status: 'verified',
        verifiedAt: new Date() 
      });
      alert("Payment Verified! The donor can now see their receipt.");
    } catch (error) {
      console.error("Error approving:", error);
      alert("Failed to approve. Check your internet connection.");
    }
  }

  // Function to Reject Fake Payment
  async reject(id: string) {
    const confirmation = confirm("Are you sure you want to reject this UTR? Use this for fake entries only.");
    if (confirmation) {
      try {
        const docRef = doc(this.firestore, 'contributions', id);
        await updateDoc(docRef, { status: 'rejected' });
      } catch (error) {
        console.error("Error rejecting:", error);
      }
    }
  }
}