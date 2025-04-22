import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const expectedRoles: string[] = route.data['expectedRoles'] || [];

    const userRole = this.authService.getUserRole();
    console.log('User Role:', userRole); 
    console.log('Expected Roles:', expectedRoles); 


    if (userRole && expectedRoles.map(r => r.toLowerCase()).includes(userRole.toLowerCase())) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }

}
