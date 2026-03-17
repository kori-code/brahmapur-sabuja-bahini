import { Component, Inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  name: string = '';
  email: string = '';
  password: string = '';

  constructor(
    @Inject(AngularFireAuth) private afAuth: AngularFireAuth,
    @Inject(AngularFirestore) private firestore: AngularFirestore,
    private router: Router
  ) {}

  async register() {
    try {
      const res = await this.afAuth.createUserWithEmailAndPassword(this.email, this.password);
      if (res.user) {
        await this.firestore.collection('members').doc(res.user.uid).set({
          name: this.name,
          email: this.email,
          role: 'member',
          paymentStatus: 'pending',
          createdAt: new Date()
        });
        alert('Registration Successful! Welcome to BSB.');
        this.router.navigate(['/tabs/tab1']);
      }
    } catch (error: any) {
      alert('Registration Failed: ' + error.message);
    }
  }
}