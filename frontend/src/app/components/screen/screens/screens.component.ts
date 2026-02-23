import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme, themeQuartz } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { ScreenService } from '../../../services/screen.service';
import { Screen } from '../../../models/screen.type';

@Component({
  selector: 'afoone-screens',
  templateUrl: './screens.component.html',
  styleUrls: ['./screens.component.css'],
  imports: [CommonModule, AgGridAngular, ButtonModule, TooltipModule],
})
export class ScreensComponent implements OnInit {
  screens: Screen[] = []; // Almacenará la lista de pantallas
  loading: boolean = true; // Indicador para mostrar el loading

  // AG Grid config
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    sortable: true,
    filter: true,
  };
  myTheme: Theme | "legacy" = themeQuartz;

  constructor(private screensService: ScreenService, private router: Router) { }

  ngOnInit(): void {
    this.setupColumns();
    this.getScreens();
  }

  setupColumns() {
    this.columnDefs = [
      { field: 'name', headerName: 'Nombre' },
      { field: 'description', headerName: 'Descripción', valueFormatter: params => params.value || '-' },
      {
        field: 'services',
        headerName: 'Servicios',
        cellRenderer: this.servicesCellRenderer.bind(this)
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

  servicesCellRenderer(params: any): HTMLElement {
    const div = document.createElement('div');
    div.className = 'services-list';

    const services = params.value;
    if (!services || services.length === 0) {
      div.innerHTML = '<span class="text-muted">-</span>';
      return div;
    }

    services.forEach((srv: string) => {
      const span = document.createElement('span');
      span.className = 'service-tag';
      span.innerText = srv;
      div.appendChild(span);
    });

    return div;
  }

  actionCellRenderer(params: any): HTMLElement {
    const div = document.createElement('div');
    div.className = 'action-buttons';

    const editBtn = document.createElement('button');
    editBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
    editBtn.innerHTML = '<span class="pi pi-pencil"></span>';
    editBtn.onclick = () => this.editScreen(params.data._id);

    const viewBtn = document.createElement('button');
    viewBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
    viewBtn.innerHTML = '<span class="pi pi-eye"></span>';
    viewBtn.onclick = () => this.viewScreen(params.data._id);

    div.appendChild(editBtn);
    div.appendChild(viewBtn);
    return div;
  }

  // Obtener la lista de clientes
  getScreens() {
    this.screensService.getScreens().subscribe({
      next: (data) => {
        this.screens = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching screens', err);
        this.loading = false;
      },
    });
  }

  // Navegar a la página de edición
  editScreen(id: string) {
    this.router.navigate([`/screens/${id}`]);
  }

  // Navegar a la página de visualización
  viewScreen(id: string) {
    this.router.navigate([`/screens/${id}/view`]);
  }

  // Navegar a la página para agregar un nuevo operador
  addScreen() {
    this.router.navigate(['/screens/new']);
  }
}
