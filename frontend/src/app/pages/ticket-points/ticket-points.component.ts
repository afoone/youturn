import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
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
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule, DialogModule],
})
export class TicketPointsComponent implements OnInit {
  ticketPoints: TicketPoint[] = [];
  loading: boolean = true;
  isAdmin: boolean = false;
  canCreate: boolean = false;
  showQrDialog: boolean = false;
  qrCodeUrl: string = '';
  selectedTicketPoint: TicketPoint | null = null;

  constructor(
    private ticketPointService: TicketPointService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getTicketPoints();
    // Verificar permisos
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.admin === true;
      this.canCreate = user?.admin === true || (user?.roles?.includes('ENTERPRISE_ADMIN') ?? false);
    });
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

