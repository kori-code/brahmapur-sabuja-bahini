import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { AdminPage } from './admin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // This defines the route for the admin page
    RouterModule.forChild([
      {
        path: '',
        component: AdminPage
      }
    ])
  ],
  declarations: [AdminPage]
})
export class AdminPageModule {}
