import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Verificar ruta inicial
    this.updateNavbarVisibility(this.router.url);

    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateNavbarVisibility(event.url);
      });
  }

  private updateNavbarVisibility(url: string): void {
    // Rutas públicas (sin navbar)
    const isPublicRoute = 
      url === '/' ||  // Landing page exacta
      url === '/login' ||  // Login exacto
      url === '/register' ||  // Register exacto
      /^\/screens\/[^\/]+\/view$/.test(url) ||  // /screens/:id/view (pantalla pública)
      /^\/ticket-point\/[^\/]+$/.test(url);  // /ticket-point/:id (punto de ticket público, sin 's')

    // El navbar se muestra si NO es una ruta pública
    this.showNavbar = !isPublicRoute;
  }
}
