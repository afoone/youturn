import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem 
                *ngIf="!item.separator && shouldShowMenuItem(item)" 
                [item]="item" 
                [index]="i" 
                [root]="true">
            </li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];
    isAdmin: boolean = false;

    constructor(
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        // Verificar el estado inicial del usuario
        this.isAdmin = this.authService.isAdmin();

        // Inicializar el menú completo (incluyendo Enterprises y Plans)
        // El template filtrará qué mostrar basado en isAdmin
        this.model = [
            {
                label: 'Enterprises',
                icon: 'pi pi-fw pi-building',
                routerLink: ['/enterprises']
            },
            {
                label: 'Plans',
                icon: 'pi pi-fw pi-credit-card',
                routerLink: ['/plans']
            },
            {
                label: 'Services',
                icon: 'pi pi-fw pi-cog',
                routerLink: ['/services']
            },
            {
                label: 'Ticket Points',
                icon: 'pi pi-fw pi-ticket',
                routerLink: ['/ticket-points']
            },
            {
                label: 'Operators',
                icon: 'pi pi-fw pi-users',
                routerLink: ['/operators']
            },
            {
                label: 'Screens',
                icon: 'pi pi-fw pi-desktop',
                routerLink: ['/screens']
            },
            {
                label: 'Users',
                icon: 'pi pi-fw pi-user',
                routerLink: ['/users']
            }
        ];

        // Suscribirse al estado del usuario para actualizar isAdmin
        this.authService.currentUser$.subscribe(user => {
            this.isAdmin = user?.admin === true;
            this.cdr.detectChanges();
        });
    }

    shouldShowMenuItem(item: MenuItem): boolean {
        const route = item.routerLink?.[0];
        // Si es Enterprises o Plans, solo mostrar si es admin
        if (route === '/enterprises' || route === '/plans') {
            return this.isAdmin;
        }
        // Para todos los demás elementos, siempre mostrarlos
        return true;
    }
}
