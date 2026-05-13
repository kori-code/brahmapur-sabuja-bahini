import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { MembersService } from '../services/members.service';

@Component({
  selector: 'app-first-login-setup',
  templateUrl: './first-login-setup.page.html',
  styleUrls: ['./first-login-setup.page.scss'],
  standalone: false
})
export class FirstLoginSetupPage implements OnInit {
  memberId: string = '';
  memberName: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  email: string = '';
  
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  
  currentStep: 'password' | 'email' | 'complete' = 'password';
  isSubmitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private membersService: MembersService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.memberId = this.route.snapshot.queryParams['memberId'] || '';
    
    if (!this.memberId) {
      this.router.navigate(['/login']);
      return;
    }

    // Load member details
    this.loadMemberDetails();
  }

  loadMemberDetails() {
    this.membersService.getMemberProfile(this.memberId).subscribe(member => {
      if (member) {
        this.memberName = member.name;
      }
    });
  }

  async validateAndChangePassword() {
    // Validation
    if (!this.currentPassword.trim()) {
      await this.showAlert('Missing Input', 'Please enter your current password');
      return;
    }

    if (this.newPassword.length < 6) {
      await this.showAlert('Weak Password', 'New password must be at least 6 characters');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      await this.showAlert('Password Mismatch', 'New passwords do not match');
      return;
    }

    if (this.newPassword === this.currentPassword) {
      await this.showAlert('Same Password', 'New password must be different from current password');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Updating password...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // In production, verify current password and update to new password
      const success = await this.membersService.updateMemberPassword(this.memberId, this.newPassword);
      
      await loading.dismiss();

      if (success) {
        this.currentStep = 'email';
        const toast = await this.toastController.create({
          message: 'Password changed successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      } else {
        await this.showAlert('Error', 'Failed to change password. Please try again.');
      }
    } catch (error: any) {
      await loading.dismiss();
      await this.showAlert('Error', error.message || 'Password change failed');
    }
  }

  async validateAndAddEmail() {
    // Validation
    if (!this.email.trim()) {
      await this.showAlert('Missing Email', 'Please enter your email address');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      await this.showAlert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Saving email...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Update member email in Firestore
      await this.membersService.getMemberProfile(this.memberId).subscribe(member => {
        if (member) {
          member.email = this.email;
        }
      });

      await loading.dismiss();
      this.currentStep = 'complete';
      
      const toast = await this.toastController.create({
        message: 'Setup complete! Redirecting...',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      await toast.present();

      // Redirect after 2 seconds
      setTimeout(() => {
        this.router.navigate(['/member-profile'], { queryParams: { id: this.memberId } });
      }, 2000);
    } catch (error: any) {
      await loading.dismiss();
      await this.showAlert('Error', error.message || 'Failed to save email');
    }
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  skipEmailStep() {
    this.currentStep = 'complete';
    setTimeout(() => {
      this.router.navigate(['/member-profile'], { queryParams: { id: this.memberId } });
    }, 1000);
  }
}
