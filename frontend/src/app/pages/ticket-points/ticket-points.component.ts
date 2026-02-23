import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, Theme, themeQuartz } from 'ag-grid-community';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { TicketPointService } from '../../services/ticket-point.service';
import { AuthService } from '../../services/auth.service';
import { TicketPoint } from '../../models/ticket-point.model';
import { Enterprise } from '../../models/enterprise.model';
import * as QRCode from 'qrcode';

@Component({
  selector: 'afoone-ticket-points',
  standalone: true,
  templateUrl: './ticket-points.component.html',
  styleUrls: ['./ticket-points.component.css'],
  imports: [CommonModule, AgGridAngular, ButtonModule, TooltipModule, DialogModule],
})
export class TicketPointsComponent implements OnInit {
  ticketPoints: TicketPoint[] = [];
  loading: boolean = true;
  isAdmin: boolean = false;
  canCreate: boolean = false;
  showQrDialog: boolean = false;
  qrCodeUrl: string = '';
  selectedTicketPoint: TicketPoint | null = null;

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
    private ticketPointService: TicketPointService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Verificar permisos
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.admin === true;
      this.canCreate = user?.admin === true || (user?.roles?.includes('ENTERPRISE_ADMIN') ?? false);
      this.setupColumns();
      this.getTicketPoints();
    });
  }

  setupColumns() {
    this.columnDefs = [
      { field: 'name', headerName: 'Nombre', cellClass: 'ticket-point-name' },
      { field: 'location', headerName: 'Ubicación', valueFormatter: params => params.value || '-' },
      {
        field: 'enterprise',
        headerName: 'Empresa',
        cellRenderer: (params: any) => {
          return `<span class="enterprise-name">${this.getEnterpriseName(params.value)}</span>`;
        }
      },
      {
        field: 'services',
        headerName: 'Servicios',
        cellRenderer: (params: any) => {
          return `<span class="services-count">${this.getServicesCount(params.value)} servicio(s)</span>`;
        }
      },
      {
        headerName: 'Acciones',
        width: 160,
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

    const viewBtn = document.createElement('button');
    viewBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
    viewBtn.innerHTML = '<span class="pi pi-eye"></span>';
    viewBtn.onclick = () => this.viewTicketPoint(params.data._id);
    div.appendChild(viewBtn);

    const qrBtn = document.createElement('button');
    qrBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
    qrBtn.innerHTML = '<span class="pi pi-qrcode"></span>';
    qrBtn.onclick = () => this.showQR(params.data);
    div.appendChild(qrBtn);

    if (this.canCreate) {
      const editBtn = document.createElement('button');
      editBtn.className = 'p-button-sm p-button-text action-button p-button p-component';
      editBtn.innerHTML = '<span class="pi pi-pencil"></span>';
      editBtn.onclick = () => this.editTicketPoint(params.data._id);

      const delBtn = document.createElement('button');
      delBtn.className = 'p-button-sm p-button-text p-button-danger action-button p-button p-component';
      delBtn.innerHTML = '<span class="pi pi-trash"></span>';
      delBtn.onclick = () => this.deleteTicketPoint(params.data._id);

      div.appendChild(editBtn);
      div.appendChild(delBtn);
    }
    return div;
  }

  getTicketPoints() {
    this.ticketPointService.getTicketPoints().subscribe({
      next: (data) => {
        this.ticketPoints = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching ticket points', err);
        this.loading = false;
      },
    });
  }

  editTicketPoint(id: string) {
    this.router.navigate([`/ticket-points/${id}`]);
  }

  addTicketPoint() {
    this.router.navigate(['/ticket-points/new']);
  }

  deleteTicketPoint(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este punto de ticket?')) {
      this.ticketPointService.deleteTicketPoint(id).subscribe({
        next: () => {
          this.getTicketPoints();
        },
        error: (err) => {
          console.error('Error deleting ticket point:', err);
        }
      });
    }
  }

  getEnterpriseName(enterprise: Enterprise | string): string {
    if (typeof enterprise === 'string') return enterprise;
    return enterprise?.name || '-';
  }

  getServicesCount(services: any[]): number {
    return services?.length || 0;
  }

  viewTicketPoint(id: string) {
    // Navegar a la vista pública del ticket point
    this.router.navigate([`/ticket-point/${id}`]);
  }

  showQR(ticketPoint: TicketPoint) {
    this.selectedTicketPoint = ticketPoint;
    const ticketPointUrl = `${window.location.origin}/ticket-point/${ticketPoint._id}`;

    // Generar QR code
    QRCode.toDataURL(ticketPointUrl, { width: 300, margin: 2 })
      .then(url => {
        this.qrCodeUrl = url;
        this.showQrDialog = true;
      })
      .catch(err => {
        console.error('Error generating QR code:', err);
        alert('Error al generar el código QR');
      });
  }

  closeQrDialog() {
    this.showQrDialog = false;
    this.qrCodeUrl = '';
    this.selectedTicketPoint = null;
  }

  copyQrLink() {
    if (this.selectedTicketPoint) {
      const ticketPointUrl = `${window.location.origin}/ticket-point/${this.selectedTicketPoint._id}`;
      navigator.clipboard.writeText(ticketPointUrl).then(() => {
        alert('Enlace copiado al portapapeles');
      }).catch(err => {
        console.error('Error copying to clipboard:', err);
      });
    }
  }
}

