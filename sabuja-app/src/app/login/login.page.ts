import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(private afAuth: AngularFireAuth, private router: Router) {}

  async login() {
    try {
      const user = await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      if (user) {
        alert('Login Successful!');
        this.router.navigate(['/tabs/tab1']); // Takes them back to Home
      }
    } catch (err: any) {
      alert('Login Failed: ' + err.message);
    }
  }
}