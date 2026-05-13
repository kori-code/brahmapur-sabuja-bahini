import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MemberDashboardPageRoutingModule } from './member-dashboard-routing.module';

import { MemberDashboardPage } from './member-dashboard.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MemberDashboardPageRoutingModule
  ],
  declarations: [ MemberDashboardPage ]
})
export class MemberDashboardPageModule { }
