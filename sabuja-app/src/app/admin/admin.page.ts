import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  // --- CONFIGURE EMAILS HERE ---
  superAdminEmail = "your-personal-email@gmail.com"; 
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
    try {
      const res = await this.afAuth.signInWithEmailAndPassword(this.adminEmail, this.adminPassword);
      this.checkRole(res.user?.email || '');
    } catch (error: any) {
      console.error("Login Error:", error);
      alert("Error: " + error.message);
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
      // Not an admin email
      this.isAdminLoggedIn = false;
      this.userRole = null;
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
    try {
      await this.afs.collection('contributions').doc(id).update({ 
        status: 'verified',
        verifiedAt: new Date().toISOString()
      });
      alert("Contribution verified successfully!");
    } catch (error: any) {
      alert("Error approving: " + error.message);
    }
  }

  async deletePermanently(id: string) {
    if (confirm("Are you sure? This will permanently delete the BSB record.")) {
      try {
        await this.afs.collection('contributions').doc(id).delete();
        alert("Record deleted.");
      } catch (error: any) {
        alert("Error deleting: " + error.message);
      }
    }
  }

  logout() {
    this.afAuth.signOut().then(() => {
      this.isAdminLoggedIn = false;
      this.userRole = null;
      this.adminEmail = "";
      this.adminPassword = "";
    });
  }
}