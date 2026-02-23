import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme, themeQuartz } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { EnterpriseService } from '../../services/enterprise.service';
import { AuthService } from '../../services/auth.service';
import { Enterprise } from '../../models/enterprise.model';

@Component({
  selector: 'afoone-enterprises',
  standalone: true,
  templateUrl: './enterprises.component.html',
  styleUrls: ['./enterprises.component.css'],
  imports: [CommonModule, AgGridAngular, ButtonModule, TooltipModule],
})
export class EnterprisesComponent implements OnInit {
  enterprises: Enterprise[] = []; // Almacenará la lista de clientes
  loading: boolean = true; // Indicador para mostrar el loading
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
    private enterpriseService: EnterpriseService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verificar si el usuario es admin
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.admin === true;
      this.setupColumns();
      this.getEnterprises();
    });
  }

  setupColumns() {
    this.columnDefs = [
      { field: 'name', headerName: 'Nombre' },
      { field: 'email', headerName: 'Email' },
      { field: 'phone', headerName: 'Teléfono', valueFormatter: params => params.value || '-' },
      { field: 'address', headerName: 'Dirección', valueFormatter: params => params.value || '-' },
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
    editBtn.onclick = () => this.editEnterprise(params.data._id);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'p-button-sm p-button-text action-button p-button-danger p-button p-component';
    deleteBtn.innerHTML = '<span class="pi pi-trash"></span>';
    deleteBtn.onclick = () => this.deleteEnterprise(params.data._id);

    div.appendChild(editBtn);
    div.appendChild(deleteBtn);
    return div;
  }

  // Obtener la lista de clientes
  getEnterprises() {
    this.enterpriseService.getEnterprises().subscribe({
      next: (data) => {
        this.enterprises = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching enterprises', err);
        this.loading = false;
      },
    });
  }

  // Navegar a la página de edición
  editEnterprise(id: string) {
    this.router.navigate([`/enterprises/${id}`]);
  }

  // Navegar a la página para agregar un nuevo enterprise
  addEnterprise() {
    this.router.navigate(['/enterprises/new']);
  }

  // Eliminar un enterprise
  deleteEnterprise(id: string) {
    if (confirm('Are you sure you want to delete this enterprise?')) {
      this.enterpriseService.deleteEnterprise(id).subscribe({
        next: () => {
          this.getEnterprises(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error deleting enterprise:', err);
        }
      });
    }
  }
}
