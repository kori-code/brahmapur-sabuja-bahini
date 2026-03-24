import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SuperadminGuard implements CanActivate {
  private readonly superAdminEmail = 'susilsfriends10@gmail.com';

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.afAuth.authState.pipe(
      take(1),
      map(user => {
        if (user && user.email === this.superAdminEmail) {
          return true;
        } else {
          // Redirect to login or home page if not authorized
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
