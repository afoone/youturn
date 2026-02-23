import { Component, OnInit } from '@angular/core';
import { Service } from '../../../models/service.model';
import { ServiceService } from '../../../services/service.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme, themeQuartz } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css'],
  imports: [CommonModule, AgGridAngular, ButtonModule, TooltipModule],
})
export class ServiceComponent implements OnInit {
  services: Service[] = [];
  loading: boolean = true;

  // AG Grid config
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
  };
  myTheme: Theme | "legacy" = themeQuartz;

  constructor(private serviceService: ServiceService, private router: Router) { }

  ngOnInit(): void {
    this.setupColumns();
    this.getServices();
  }

  setupColumns() {
    this.columnDefs = [
      { field: 'name', headerName: 'Nombre', cellClass: 'service-name' },
      { field: 'description', headerName: 'Descripción', valueFormatter: params => params.value || '-' },
      {
        field: 'prefix',
        headerName: 'Prefijo',
        cellRenderer: (params: any) => {
          return `<span class="prefix-badge">${params.value}</span>`;
        }
      },
      {
        field: 'enterprise',
        headerName: 'Empresa',
        cellRenderer: (params: any) => {
          const enterprise = params.value;
          if (!enterprise) return '<span class="text-muted">-</span>';
          return `<span class="enterprise-name">${this.getEnterpriseName(enterprise)}</span>`;
        }
      },
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

    const editBtn = document.createElement('button');
    editBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
    editBtn.innerHTML = '<span class="pi pi-pencil"></span>';
    editBtn.onclick = () => this.editService(params.data._id);

    div.appendChild(editBtn);
    return div;
  }

  getServices() {
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.services = data;
        console.log('Services loaded:', data);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching services', err);
        this.loading = false;
      },
    });
  }

  // Navegar a la página de edición
  editService(id: string) {
    this.router.navigate([`/services/${id}`]);
  }

  // Navegar a la página para agregar un nuevo servicio
  addService() {
    this.router.navigate(['/services/new']);
  }

  getEnterpriseName(enterprise: any): string {
    if (!enterprise) {
      console.log('Enterprise is null or undefined');
      return '-';
    }
    if (typeof enterprise === 'string') {
      console.log('Enterprise is string:', enterprise);
      return enterprise;
    }
    const name = enterprise.name || enterprise._id || 'N/A';
    console.log('Enterprise object:', enterprise, 'Name:', name);
    return name;
  }
}
