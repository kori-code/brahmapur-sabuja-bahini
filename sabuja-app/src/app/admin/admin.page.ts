import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, onSnapshot, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
})
export class AdminPage implements OnInit {
  pendingPayments: any[] = [];

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    try {
      const q = query(collection(this.firestore, 'contributions'), where('status', '==', 'pending'));
      onSnapshot(q, (snapshot) => {
        this.pendingPayments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      });
    } catch (error) {
      console.error("Firestore Error:", error);
    }
  }

  async approve(id: string) {
    const ref = doc(this.firestore, 'contributions', id);
    await updateDoc(ref, { status: 'verified' });
    alert("Payment Verified Successfully!");
  }

  async reject(id: string) {
    if(confirm("Reject this transaction?")) {
      const ref = doc(this.firestore, 'contributions', id);
      await updateDoc(ref, { status: 'rejected' });
    }
  }
}