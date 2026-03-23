import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  // Use your real email here
  superAdminEmail = "susilsfriends10@gmail.com"; 
  presidentEmail = "president@bsb-testing.com"; 

  pendingPayments: any[] = [];
  isAdminLoggedIn = false;
  userRole: 'super' | 'president' | null = null;
  adminEmail = "";
  adminPassword = "";

  constructor(
    private afs: AngularFirestore, 
    public afAuth: AngularFireAuth
  ) {}

  ngOnInit() {
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.checkRole(user.email);
      }
    });
  }

  async login() {
    console.log("Login button clicked for:", this.adminEmail);
    if (!this.adminEmail || !this.adminPassword) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const res = await this.afAuth.signInWithEmailAndPassword(this.adminEmail, this.adminPassword);
      console.log("Firebase Auth Success");
      this.checkRole(res.user?.email || '');
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      alert("Login Failed: " + error.message);
    }
  }

  checkRole(email: string | null) {
    if (email === this.superAdminEmail) {
      this.userRole = 'super';
      this.isAdminLoggedIn = true;
      this.loadData();
    } else if (this.presidentEmail && email === this.presidentEmail) {
      this.userRole = 'president';
      this.isAdminLoggedIn = true;
      this.loadData();
    } else {
      alert("Access Denied: You are not authorized as an Admin.");
      this.afAuth.signOut();
    }
  }

  loadData() {
    this.afs.collection('contributions', ref => ref.where('status', '==', 'pending'))
      .valueChanges({ idField: 'id' })
      .subscribe(data => {
        this.pendingPayments = data;
      });
  }

  async approve(id: string) {
    await this.afs.collection('contributions').doc(id).update({ status: 'verified' });
    alert("Verified!");
  }

  async deletePermanently(id: string) {
    if (confirm("Delete this record?")) {
      await this.afs.collection('contributions').doc(id).delete();
    }
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.isAdminLoggedIn = false;
      this.userRole = null;
    });
  }
}