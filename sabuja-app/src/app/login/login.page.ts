import { Component, Inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false, // <--- Add this line here
})
export class LoginPage {
  email: string = '';
  password: string = '';

  constructor(
    @Inject(AngularFireAuth) private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  async login() {
    try {
      await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      this.router.navigate(['/tabs/tab1']);
    } catch (error: any) {
      alert('Login Error: ' + error.message);
    }
  }
}