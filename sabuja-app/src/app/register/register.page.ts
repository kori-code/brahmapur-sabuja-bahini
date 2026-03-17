import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html'
})
export class RegisterPage {
  name: string = '';
  whatsapp: string = '';
  email: string = '';
  password: string = '';

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {}

  async register() {
    try {
      const res = await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);
      if (res.user) {
        await this.firestore.collection('members').doc(res.user.uid).set({
          fullName: this.name,
          phoneNumber: this.whatsapp,
          email: this.email,
          role: 'member',
          status: 'pending'
        });
        alert('Registered Successfully!');
        this.router.navigate(['/login']);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }
}