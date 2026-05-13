import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { MembersService } from '../services/members.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
})
export class LoginPage implements OnInit {
  loginType: 'phone' | 'email' = 'phone'; // Default to phone login
  phone: string = '';
  email: string = '';
  password: string = '';
  showPassword: boolean = false;

  private readonly superAdminUser = 'susilsfriends10@gmail.com';
  private readonly superAdminPassword = 'Admin@2024'; // Change this to actual secure password

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private membersService: MembersService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Auto-initialize member database
    this.membersService.initializeMemberDatabase();
  }

  async login() {
    if (this.loginType === 'phone') {
      await this.loginWithPhone();
    } else {
      await this.loginWithEmail();
    }
  }

  async loginWithPhone() {
    if (!this.phone.trim() || !this.password.trim()) {
      await this.showAlert('Missing Information', 'Please enter both phone number and password');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Logging in...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const result = await this.membersService.loginWithPhoneNumber(this.phone, this.password);
      
      if (result.success) {
        await loading.dismiss();
        const member = result.member;

        if (member.isFirstLogin) {
          // Navigate to password change page
          this.router.navigate(['/change-password-first-login'], {
            queryParams: { memberId: member.id }
          });
        } else {
          // Navigate to member dashboard
          this.router.navigate(['/member-dashboard']);
        }
      } else {
        await loading.dismiss();
        await this.showAlert('Login Failed', result.message || 'Invalid phone number or password');
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showAlert('Login Error', error.message || 'An error occurred during login');
    }
  }

  async loginWithEmail() {
    if (!this.email.trim() || !this.password.trim()) {
      await this.showAlert('Missing Information', 'Please enter both email and password');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Logging in...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Check if super admin
      if (this.email === this.superAdminUser && this.password === this.superAdminPassword) {
        await loading.dismiss();
        this.router.navigate(['/admin']);
        return;
      }

      // Regular member email login
      await this.afAuth.signInWithEmailAndPassword(this.email, this.password);
      await loading.dismiss();
      this.router.navigate(['/tabs/tab1']);
    } catch (error: any) {
      await loading.dismiss();
      await this.showAlert('Login Error', error.message || 'Invalid email or password');
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}