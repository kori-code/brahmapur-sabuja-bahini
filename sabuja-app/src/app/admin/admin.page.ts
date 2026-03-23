import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  pendingPayments: any[] = [];

  constructor(private afs: AngularFirestore) {}

  ngOnInit() {
    // This matches your AngularFirestoreModule in AppModule
    this.afs.collection('contributions', ref => ref.where('status', '==', 'pending'))
      .valueChanges({ idField: 'id' })
      .subscribe(data => {
        this.pendingPayments = data;
        console.log("Pending BSB Payments:", data);
      });
  }

  async approve(id: string) {
    try {
      await this.afs.collection('contributions').doc(id).update({ 
        status: 'verified',
        verifiedAt: new Date().toISOString()
      });
      alert("Verified! Fund added to BSB records.");
    } catch (error) {
      alert("Error: " + error);
    }
  }

  async reject(id: string) {
    if (confirm("Reject this fake UTR?")) {
      await this.afs.collection('contributions').doc(id).update({ status: 'rejected' });
    }
  }
}