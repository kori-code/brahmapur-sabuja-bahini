import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  // --- PASTE EMAILS HERE ---
  superAdminEmail = "susilsfriends10@gmail.com"; 
  presidentEmail = "president@bsb-testing.com"; 

  pendingPayments: any[] = [];
  isAdminLoggedIn = false;
  userRole: 'super' | 'president' | null = null;
  adminEmail = "";
  adminPassword = "";

  constructor(private afs: AngularFirestore, public afAuth: AngularFireAuth) {}

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
    console.log("Login Success:", res.user?.email);
    this.checkRole(res.user?.email || '');
  } catch (error: any) {
    // This will tell you if it's "auth/user-not-found" or "auth/wrong-password"
    console.error("Firebase Error:", error.code);
    if (error.code === 'auth/user-not-found') {
      alert("This email is not registered in Firebase.");
    } else if (error.code === 'auth/wrong-password') {
      alert("Incorrect password. Please try again.");
    } else {
      alert(""Error: " + error.message);
    }
  }

  checkRole(email: string | null) {
    if (email === this.superAdminEmail) {
      this.userRole = 'super';
      this.isAdminLoggedIn = true;
      this.loadData();
    } else if (email === this.presidentEmail) {
      this.userRole = 'president';
      this.isAdminLoggedIn = true;
      this.loadData();
    }
  }

  loadData() {
    this.afs.collection('contributions', ref => ref.where('status', '==', 'pending'))
      .valueChanges({ idField: 'id' })
      .subscribe(data => this.pendingPayments = data);
  }

  async approve(id: string) {
    await this.afs.collection('contributions').doc(id).update({ status: 'verified' });
  }

  async deletePermanently(id: string) {
    if(confirm("Are you sure you want to delete this record permanently?")) {
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