import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { OperatorService } from '../../services/operator.service';
import { Operator } from '../../models/operator.type';

interface MenuItemWithRoute extends MenuItem {
  route?: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MenubarModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  items: MenuItemWithRoute[] = [];

  constructor(
    private router: Router,
    private operatorService: OperatorService
  ) {}

  ngOnInit() {
    // Inicializar el menú con items básicos primero
    this.initializeMenuItems();
    
    // Cargar operadores para el submenú
    this.loadOperators();
    
    // Actualizar el estado activo cuando cambia la ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveItem();
      });

    this.updateActiveItem();
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
        label: 'Old Queue',
        route: '/queue',
        command: () => this.router.navigate(['/queue'])
      },
      {
        label: 'Ticket Point',
        route: '/ticket-point',
        command: () => this.router.navigate(['/ticket-point/default'])
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
      },
      {
        label: 'Enterprises',
        route: '/enterprises',
        command: () => this.router.navigate(['/enterprises'])
      }
    ];
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

