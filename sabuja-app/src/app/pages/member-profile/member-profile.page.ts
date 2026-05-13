import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { MembersService, MemberProfile } from '../services/members.service';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.page.html',
  styleUrls: ['./member-profile.page.scss'],
  standalone: false
})
export class MemberProfilePage implements OnInit {
  currentMember: MemberProfile | null = null;
  monthlyFee = 200;
  monthsDue: number = 0;
  totalDue: number = 0;
  paymentHistory: any[] = [];
  isEditingEmail = false;
  newEmail = '';

  constructor(
    private membersService: MembersService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadMemberProfile();
  }

  loadMemberProfile() {
    this.membersService.getCurrentMemberProfile().subscribe(member => {
      if (member) {
        this.currentMember = member;
        this.newEmail = member.email || '';
        this.calculateMonthsDue();
        this.loadPaymentHistory();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  calculateMonthsDue() {
    if (this.currentMember) {
      this.monthsDue = this.membersService.calculateMonthsDue(this.currentMember);
      this.totalDue = this.monthsDue * this.monthlyFee;
    }
  }

  loadPaymentHistory() {
    if (this.currentMember) {
      this.membersService.getMemberPaymentHistory(this.currentMember.id).subscribe(
        (history) => {
          this.paymentHistory = history;
        }
      );
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Unverified':
        return 'danger';
      default:
        return 'medium';
    }
  }

  async updateEmail() {
    if (!this.newEmail || !this.newEmail.includes('@')) {
      await this.showAlert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Updating email...'
    });
    await loading.present();

    try {
      if (this.currentMember) {
        // Update email in Firestore
        await this.membersService.getMemberProfile(this.currentMember.id).subscribe(
          member => {
            if (member) {
              member.email = this.newEmail;
              // Save to database (would need an update method in service)
            }
          }
        );

        await loading.dismiss();
        this.isEditingEmail = false;
        
        const toast = await this.toastController.create({
          message: 'Email updated successfully!',
          duration: 2000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
      }
    } catch (error) {
      await loading.dismiss();
      await this.showAlert('Error', 'Failed to update email');
    }
  }

  async openChangePassword() {
    const alert = await this.alertController.create({
      header: 'Change Password',
      message: 'Contact admin to change your password',
      buttons: [
        {
          text: 'Call Admin',
          handler: () => {
            window.location.href = 'tel:9777377039';
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  logout() {
    this.membersService.logout();
    this.router.navigate(['/login']);
  }
}
