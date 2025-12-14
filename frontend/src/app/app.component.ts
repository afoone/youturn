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

  // Rutas públicas (sin navbar)
  private publicRoutes = ['/login', '/register', '/screens/', '/ticket-point/'];

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
    // Verificar si la ruta actual es pública
    this.showNavbar = !this.publicRoutes.some(route => url.startsWith(route));
  }
}
