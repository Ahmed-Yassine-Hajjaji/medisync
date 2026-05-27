import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    @if (showNavbar) {
      <app-navbar></app-navbar>
    }
    <main [class.with-navbar]="showNavbar" [class.no-padding]="noPaddingRoutes.includes(currentRoute)">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      min-height: 100vh;

      &.with-navbar {
        min-height: calc(100vh - 70px);
      }

      &:not(.no-padding) {
        padding: 2rem 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'MediSync';
  currentRoute = '';
  showNavbar = true;

  // Routes that don't need navbar or have their own padding
  hiddenNavbarRoutes = ['/login', '/register', '/patient', '/medecin', '/secretaire', '/admin'];
  noPaddingRoutes = ['/', '/login', '/register', '/medecins'];

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;

      // Hide navbar for dashboard routes (they have sidebar)
      this.showNavbar = !this.hiddenNavbarRoutes.some(route =>
        this.currentRoute.startsWith(route) && route !== '/' && route !== '/medecins'
      );

      // Special case: show navbar for login and register
      if (this.currentRoute === '/login' || this.currentRoute === '/register') {
        this.showNavbar = false;
      }
    });
  }
}
