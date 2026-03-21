import { Component, OnInit } from '@angular/core';
import { Firestore, collection, query, where, onSnapshot, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-admin',
  template: `
    <ion-header>
      <ion-toolbar color="dark">
        <ion-title>BSB Admin Panel</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <h2 style="font-weight: bold; color: #2e7d32;">Pending Contributions</h2>
      <p style="color: #666;">Check your SBI Bank App for these UTR numbers.</p>

      <ion-card *ngFor="let p of pendingPayments" style="border-left: 5px solid orange;">
        <ion-card-header>
          <ion-card-title>₹{{ p.amount }} - {{ p.userName }}</ion-card-title>
          <ion-card-subtitle>UTR: {{ p.utrNumber }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <p>Purpose: {{ p.purpose }}</p>
          <p>Date: {{ p.date }}</p>
          <div style="margin-top: 15px;">
            <ion-button color="success" size="small" (click)="approve(p.id)">APPROVE</ion-button>
            <ion-button color="danger" fill="outline" size="small" (click)="reject(p.id)">REJECT</ion-button>
          </div>
        </ion-card-content>
      </ion-card>

      <div *ngIf="pendingPayments.length === 0" class="ion-text-center" style="margin-top: 50px;">
        <ion-icon name="checkmark-done-circle" style="font-size: 64px; color: #ccc;"></ion-icon>
        <p>No pending payments. All clear!</p>
      </div>
    </ion-content>
  `
})
export class AdminPage implements OnInit {
  pendingPayments: any[] = [];

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    const q = query(collection(this.firestore, 'contributions'), where('status', '==', 'pending'));
    onSnapshot(q, (snapshot) => {
      this.pendingPayments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    });
  }

  async approve(id: string) {
    const ref = doc(this.firestore, 'contributions', id);
    await updateDoc(ref, { status: 'verified' });
    alert("Verified! The member can now download their receipt.");
  }

  async reject(id: string) {
    if(confirm("Are you sure this is a fake payment?")) {
      const ref = doc(this.firestore, 'contributions', id);
      await updateDoc(ref, { status: 'rejected' });
    }
  }
}