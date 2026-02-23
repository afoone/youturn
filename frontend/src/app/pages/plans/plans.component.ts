import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme, themeQuartz } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PlanService } from '../../services/plan.service';
import { AuthService } from '../../services/auth.service';
import { Plan } from '../../models/plan.model';

@Component({
  selector: 'afoone-plans',
  standalone: true,
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  imports: [CommonModule, AgGridAngular, ButtonModule, TooltipModule],
})
export class PlansComponent implements OnInit {
  plans: Plan[] = [];
  loading: boolean = true;
  isAdmin: boolean = false;

  // AG Grid config
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
  };
  myTheme: Theme | "legacy" = themeQuartz;

  constructor(
    private planService: PlanService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verificar si el usuario es admin
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.admin === true;
      this.setupColumns();
      this.getPlans();
    });
  }

  setupColumns() {
    this.columnDefs = [
      { field: 'codigo', headerName: 'Código', cellClass: 'plan-codigo' },
      { field: 'descripcion', headerName: 'Descripción' },
      { field: 'precio', headerName: 'Precio', valueFormatter: params => this.formatPrice(params.value) },
      { field: 'maxTicketPoints', headerName: 'Max Kioscos' },
      { field: 'maxUsuarios', headerName: 'Max Usuarios' },
      { field: 'maxServicios', headerName: 'Max Servicios' },
      {
        headerName: 'Acciones',
        width: 120,
        flex: 0,
        sortable: false,
        filter: false,
        cellRenderer: this.actionCellRenderer.bind(this)
      }
    ];
  }

  actionCellRenderer(params: any): HTMLElement {
    const div = document.createElement('div');
    div.className = 'action-buttons';

    if (!this.isAdmin) {
      div.innerHTML = '<span class="text-muted">-</span>';
      return div;
    }

    const editBtn = document.createElement('button');
    editBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
    editBtn.innerHTML = '<span class="pi pi-pencil"></span>';
    editBtn.onclick = () => this.editPlan(params.data._id);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'p-button-sm p-button-text action-button p-button-danger p-button p-component';
    deleteBtn.innerHTML = '<span class="pi pi-trash"></span>';
    deleteBtn.onclick = () => this.deletePlan(params.data._id);

    div.appendChild(editBtn);
    div.appendChild(deleteBtn);
    return div;
  }

  getPlans() {
    this.planService.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching plans', err);
        this.loading = false;
      },
    });
  }

  editPlan(id: string) {
    this.router.navigate([`/plans/${id}`]);
  }

  addPlan() {
    this.router.navigate(['/plans/new']);
  }

  deletePlan(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      this.planService.deletePlan(id).subscribe({
        next: () => {
          this.getPlans();
        },
        error: (err) => {
          console.error('Error deleting plan:', err);
        }
      });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}

