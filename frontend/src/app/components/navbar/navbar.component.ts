import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { OperatorService } from '../../services/operator.service';
import { Operator } from '../../models/operator.type';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { Subject, takeUntil } from 'rxjs';

interface MenuItemWithRoute extends MenuItem {
  route?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule, CommonModule, ButtonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  items: MenuItemWithRoute[] = [];
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private operatorService: OperatorService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Suscribirse al usuario actual
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
        this.initializeMenuItems();
      });

    // Inicializar el menú con items básicos primero
    this.initializeMenuItems();
    
    // Cargar operadores para el submenú
    this.loadOperators();
    
    // Actualizar el estado activo cuando cambia la ruta
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.updateActiveItem();
      });

    this.updateActiveItem();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  private initializeMenuItems() {
    // Inicializar el menú con items básicos (sin operadores aún)
    this.items = [
      {
        label: 'Operator Board',
        route: '/operator-dashboard',
        command: () => this.router.navigate(['/operators']),
        items: []
      },
      {
        label: 'Ticket Points',
        route: '/ticket-points',
        command: () => this.router.navigate(['/ticket-points'])
      },
      {
        label: 'Services',
        route: '/services',
        command: () => this.router.navigate(['/services'])
      },
      {
        label: 'Operators',
        route: '/operators',
        command: () => this.router.navigate(['/operators'])
      },
      {
        label: 'Screens',
        route: '/screens',
        command: () => this.router.navigate(['/screens'])
      }
    ];

    // Solo agregar Enterprises, Plans y Users si es admin
    if (this.currentUser && this.authService.isAdmin()) {
      this.items.push(
        {
          label: 'Enterprises',
          route: '/enterprises',
          command: () => this.router.navigate(['/enterprises'])
        },
        {
          label: 'Plans',
          route: '/plans',
          command: () => this.router.navigate(['/plans'])
        },
        {
          label: 'Users',
          route: '/users',
          command: () => this.router.navigate(['/users'])
        }
      );
    }
  }

  private loadOperators() {
    // Cargar operadores para el submenú
    this.operatorService.getOperators().subscribe({
      next: (operators) => {
        const operatorItems: MenuItemWithRoute[] = operators.map(operator => ({
          label: operator.positionName || `Operator ${operator._id}`,
          route: `/operator-dashboard/${operator._id}`,
          command: () => this.router.navigate([`/operator-dashboard/${operator._id}`])
        }));

        // Actualizar el submenú de Operator Board
        const operatorBoardItem = this.items.find(item => item.label === 'Operator Board');
        if (operatorBoardItem) {
          operatorBoardItem.items = operatorItems;
        }

        this.updateActiveItem();
      },
      error: (error) => {
        console.error('Error loading operators for menu:', error);
        // El menú ya está inicializado, así que se mostrará sin el submenú de operadores
      }
    });
  }

  private updateActiveItem() {
    const currentUrl = this.router.url;
    this.items.forEach(item => {
      item.styleClass = '';
      if (item['route'] && currentUrl.startsWith(item['route'])) {
        item.styleClass = 'active-menu-item';
      }
      // También actualizar items del submenú si existen
      if (item.items) {
        item.items.forEach(subItem => {
          const subItemWithRoute = subItem as MenuItemWithRoute;
          if (subItemWithRoute['route'] && currentUrl.startsWith(subItemWithRoute['route'])) {
            subItemWithRoute.styleClass = 'active-menu-item';
            // Marcar el padre como activo también
            item.styleClass = 'active-menu-item';
          } else {
            subItemWithRoute.styleClass = '';
          }
        });
      }
    });
  }
}

