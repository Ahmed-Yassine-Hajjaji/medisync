import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PrimeNGConfig } from 'primeng/api';
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
    <main [class.with-navbar]="showNavbar" [class.no-padding]="noPadding">
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
  noPadding = false;

  /** Routes des espaces authentifiés : pas de navbar publique + pas de padding global (layout dédié). */
  private readonly dashboardPrefixes = ['/patient', '/medecin', '/secretaire', '/admin'];
  /** Routes publiques sans padding (gèrent elles-mêmes leur hero). */
  private readonly publicNoPad = ['/', '/login', '/register', '/medecins'];

  constructor(private router: Router, private primengConfig: PrimeNGConfig) {
    // Traductions PrimeNG en français (datatables, dropdown, calendar, etc.)
    this.primengConfig.setTranslation({
      emptyMessage: 'Aucun résultat',
      emptyFilterMessage: 'Aucun résultat correspondant',
      emptySearchMessage: 'Aucun résultat correspondant',
      accept: 'Oui',
      reject: 'Non',
      choose: 'Choisir',
      upload: 'Téléverser',
      cancel: 'Annuler',
      clear: 'Effacer',
      apply: 'Appliquer',
      matchAll: 'Tout valider',
      matchAny: 'Au moins un',
      addRule: 'Ajouter une règle',
      removeRule: 'Supprimer la règle',
      dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      dayNamesShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      dayNamesMin: ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
      monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                   'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      monthNamesShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
                        'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
      today: 'Aujourd\'hui',
      weekHeader: 'Sem',
      firstDayOfWeek: 1,
      dateFormat: 'dd/mm/yy',
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.urlAfterRedirects || event.url;
      const path = this.currentRoute.split('?')[0];

      const inDashboard = this.dashboardPrefixes.some(p => path === p || path.startsWith(p + '/'));

      // Pas de navbar publique sur dashboards ni sur login/register
      this.showNavbar = !inDashboard && path !== '/login' && path !== '/register';

      // Pas de padding global sur dashboards (gèrent leur layout) ni sur publicNoPad
      this.noPadding = inDashboard
        || this.publicNoPad.includes(path)
        || path.startsWith('/medecins');
    });
  }
}
