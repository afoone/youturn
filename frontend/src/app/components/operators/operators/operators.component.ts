import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme, themeQuartz } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Operator } from '../../../models/operator.type';
import { OperatorService } from '../../../services/operator.service';

@Component({
  selector: 'afoone-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css'],
  imports: [CommonModule, AgGridAngular, ButtonModule, TooltipModule],
})
export class OperatorsComponent implements OnInit {
  operators: Operator[] = []; // Almacenará la lista de clientes
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

  constructor(
    private operatorsService: OperatorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.setupColumns();
    this.getOperators();
  }

  setupColumns() {
    this.columnDefs = [
      { field: 'positionName', headerName: 'Nombre del Puesto' },
      { field: 'description', headerName: 'Descripción', valueFormatter: params => params.value || '-' },
      {
        field: 'services',
        headerName: 'Servicios',
        cellRenderer: this.servicesCellRenderer.bind(this)
      },
      { field: 'pathDescription', headerName: 'Descripción de Ruta', valueFormatter: params => params.value || '-' },
      { field: 'customer.name', headerName: 'Cliente', valueFormatter: params => params.value || '-' },
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

    const viewBtn = document.createElement('button');
    viewBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
    viewBtn.innerHTML = '<span class="pi pi-desktop"></span>';
    viewBtn.onclick = () => this.viewOperatorBoard(params.data._id);

    const editBtn = document.createElement('button');
    editBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
    editBtn.innerHTML = '<span class="pi pi-pencil"></span>';
    editBtn.onclick = () => this.editOperator(params.data._id);

    div.appendChild(viewBtn);
    div.appendChild(editBtn);
    return div;
  }

  // Obtener la lista de clientes
  getOperators() {
    this.operatorsService.getOperators().subscribe({
      next: (data) => {
        this.operators = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching enterprises', err);
        this.loading = false;
      },
    });
  }

  // Navegar a la página de edición
  editOperator(id: string) {
    this.router.navigate([`/operators/${id}`]);
  }

  // Navegar al dashboard del operador
  viewOperatorBoard(id: string) {
    this.router.navigate([`/operator-dashboard/${id}`]);
  }

  // Navegar a la página para agregar un nuevo operador
  addOperator() {
    this.router.navigate(['/operators/new']);
  }
}
