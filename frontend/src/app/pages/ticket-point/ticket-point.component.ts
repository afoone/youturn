import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../services/service.service';
import { TicketPointService } from '../../services/ticket-point.service';
import { FormsModule } from '@angular/forms';
import { QueueService } from '../../services/queue.service';
import { ActivatedRoute } from '@angular/router';
import { ServiceCardComponent } from '../../components/ticket/service-card/service-card.component';
import { Service } from '../../models/service.model';
import { TicketPoint } from '../../models/ticket-point.model';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';

@Component({
  selector: 'afoone-ticket-point',
  imports: [FormsModule, ServiceCardComponent, CommonModule],
  templateUrl: './ticket-point.component.html',
  styleUrls: ['./ticket-point.component.css'],
})
export class TicketPointComponent implements OnInit {
  serviceOptions: { label: string; value: string }[] = [];
  services: Service[] = [];
  selectedService: string = '';
  ticketPoint: TicketPoint | null = null;
  ticketPointId: string | null = null;
  servicePriorityMap: Map<string, boolean> = new Map();

  createdCustomer: any = null;
  selectedServiceData: Service | null = null;

  constructor(
    private _serviceService: ServiceService,
    private _ticketPointService: TicketPointService,
    private _queueService: QueueService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const ticketPointId = this.route.snapshot.paramMap.get('id');
    this.ticketPointId = ticketPointId;
    // Bloquear acceso a "default"
    if (ticketPointId === 'default') {
      console.error('Invalid ticket point ID: default');
      return;
    }
    if (ticketPointId) {
      this.loadTicketPoint(ticketPointId);
    } else {
      // Fallback: cargar todos los servicios si no hay ticket point
      this.loadServices();
    }
  }

  loadTicketPoint(id: string): void {
    this.ticketPointId = id;
    
    // Primero cargar el ticket point para crear el mapa de prioridades
    this._ticketPointService.getTicketPointById(id).subscribe({
      next: (ticketPoint) => {
        this.ticketPoint = ticketPoint;
        
        // Crear mapa de prioridades
        this.servicePriorityMap.clear();
        if (ticketPoint.services && ticketPoint.services.length > 0) {
          const firstService = ticketPoint.services[0];
          
          // Verificar si es la nueva estructura (con prioridad)
          if (typeof firstService === 'object' && 'service' in firstService && 'priority' in firstService) {
            // Nueva estructura con prioridad
            ticketPoint.services.forEach((s: any) => {
              const serviceId = typeof s.service === 'string' 
                ? s.service 
                : (s.service?._id?.toString() || s.service?.toString());
              if (serviceId) {
                this.servicePriorityMap.set(serviceId, s.priority || false);
              }
            });
          }
        }
        
        // Cargar servicios filtrados por ticket point desde el backend
        this._serviceService.getServices(id).subscribe({
          next: (services) => {
            this.services = services;
            this.serviceOptions = this.services.map((service) => ({
              label: service.name,
              value: service._id,
            }));
          },
          error: (err) => {
            console.error('Error loading services:', err);
          },
        });
      },
      error: (err) => {
        console.error('Error loading ticket point:', err);
        // Fallback: cargar todos los servicios
        this.loadServices();
      },
    });
  }

  addToQueue(service: Service): void {
    if (service) {
      this.selectedServiceData = service;
      this._queueService
        .addToQueue(service._id, this.ticketPointId || undefined)
        .subscribe((response) => {
          console.log('Customer added to queue:', response);
          this.createdCustomer = response;
        });
    }
  }

  isServicePriority(service: Service): boolean {
    return this.servicePriorityMap.get(service._id) || false;
  }

  loadServices(): void {
    this._serviceService.getServices().subscribe((services) => {
      this.services = services;
      this.serviceOptions = services.map((service) => ({
        label: service.name,
        value: service._id,
      }));
    });
  }

  goBack(): void {
    this.createdCustomer = null;
    this.selectedServiceData = null;
  }

  generatePDF(): void {
    if (!this.createdCustomer || !this.selectedServiceData) {
      console.error('No hay datos del ticket disponibles');
      return;
    }

    // Tamaño de ticket térmico: 80mm de ancho x altura suficiente
    const ticketWidth = 80; // mm (tamaño estándar de impresoras térmicas)
    const ticketHeight = 150; // mm (altura suficiente para el contenido)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [ticketWidth, ticketHeight]
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    let yPosition = 10; // Margen superior

    // Línea separadora superior
    doc.setLineWidth(0.3);
    doc.line(5, yPosition, pageWidth - 5, yPosition);
    yPosition += 8;

    // Título
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TICKET', centerX, yPosition, { align: 'center' });
    yPosition += 8;

    // Nombre del servicio
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const serviceName = this.selectedServiceData.name;
    // Dividir el nombre si es muy largo para que quepa en el ancho del ticket
    const maxWidth = pageWidth - 10;
    const serviceLines = doc.splitTextToSize(serviceName, maxWidth);
    doc.text(serviceLines, centerX, yPosition, { align: 'center' });
    yPosition += serviceLines.length * 5 + 5;

    // Línea separadora
    doc.line(5, yPosition, pageWidth - 5, yPosition);
    yPosition += 8;

    // Número de ticket
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Número de Ticket:', centerX, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    const ticketNumber = this.createdCustomer.ticketNumber || 'N/A';
    doc.text(ticketNumber, centerX, yPosition, { align: 'center' });
    yPosition += 12;

    // Línea separadora
    doc.line(5, yPosition, pageWidth - 5, yPosition);
    yPosition += 8;

    // Fecha
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const date = new Date(this.createdCustomer.queuedTime || Date.now());
    const formattedDate = date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Fecha: ${formattedDate}`, centerX, yPosition, { align: 'center' });
    yPosition += 7;

    // Línea separadora inferior
    doc.line(5, yPosition, pageWidth - 5, yPosition);
    yPosition += 8;

    // Mensaje final
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text('Conserve este ticket', centerX, yPosition, { align: 'center' });

    // Descargar el PDF
    const fileName = `ticket-${ticketNumber}.pdf`;
    doc.save(fileName);
  }

  generatePKPass(): void {
    // PKPass requiere certificados de Apple y no se puede generar completamente en el frontend
    alert('La generación de PKPass requiere configuración en el servidor con certificados de Apple. Por favor, use el PDF como alternativa.');
  }
}
