import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OperatorService } from '../../services/operator.service';
import { ServiceService } from '../../services/service.service';
import { Operator } from '../../models/operator.type';
import { Service } from '../../models/service.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Customer } from '../../models/customer.type';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';

interface WaitingService {
  label: string;
  count: number;
}

@Component({
  selector: 'afoone-operator-board',
  imports: [
    ButtonModule,
    CardModule,
    BadgeModule,
    ProgressSpinnerModule,
    Select,
    CommonModule,
    FormsModule
  ],
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css'],
})
export class OperatorBoardComponent implements OnInit, OnDestroy {
  selectedOperator?: Operator;
  selectedCustomer?: Customer;
  waitingServices: WaitingService[] = [];
  loading = true;
  loadingCustomer = false;
  totalWaiting = 0;
  services: Service[] = [];
  selectedNewService?: Service;

  private destroy$ = new Subject<void>();
  private readonly POLLING_INTERVAL = 10000; // 10 segundos

  constructor(
    private operatorService: OperatorService,
    private serviceService: ServiceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const operatorId = this.route.snapshot.paramMap.get('id');
    if (operatorId) {
      this.loadOperator(operatorId);
    }
    this.loadServices();
  }

  loadServices(): void {
    this.serviceService
      .getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.services = services || [];
        },
        error: (error) => {
          console.error('Error loading services:', error);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOperator(operatorId: string): void {
    this.loading = true;
    this.operatorService
      .getOperatorById(operatorId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (operator) => {
          this.selectedOperator = operator;
          this.loading = false;
          this.initWaitingRoomPolling();
          this.getInServiceCustomer();
        },
        error: (error) => {
          console.error('Error loading operator:', error);
          this.loading = false;
        }
      });
  }

  getInServiceCustomer(): void {
    if (!this.selectedOperator?._id) return;

    this.operatorService
      .getInServiceCustomer(this.selectedOperator._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (customer) => {
          this.selectedCustomer = customer;
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          this.selectedCustomer = undefined;
        }
      });
  }

  initWaitingRoomPolling(): void {
    // Cargar inmediatamente
    this.getWaitingRoom();

    // Configurar polling cada 10 segundos
    interval(this.POLLING_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getWaitingRoom();
      });
  }

  getWaitingRoom(): void {
    if (!this.selectedOperator?._id) return;

    this.operatorService
      .waitingRoom(this.selectedOperator._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.waitingServices = services || [];
          this.totalWaiting = this.waitingServices.reduce(
            (sum, service) => sum + (service.count || 0),
            0
          );
        },
        error: (error) => {
          console.error('Error loading waiting room:', error);
        }
      });
  }

  nextCustomer(): void {
    if (!this.selectedOperator?._id) {
      console.warn('No operator selected');
      return;
    }

    this.loadingCustomer = true;
    this.operatorService
      .nextCustomer(this.selectedOperator._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.selectedCustomer = response;
          this.loadingCustomer = false;
          this.getWaitingRoom();
        },
        error: (error) => {
          console.error('Error getting next customer:', error);
          this.loadingCustomer = false;
        }
      });
  }

  attendCustomer(): void {
    if (!this.selectedCustomer?._id) {
      console.warn('No customer selected');
      return;
    }

    this.loadingCustomer = true;
    this.operatorService
      .attendCustomer(this.selectedCustomer._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.selectedCustomer = response;
          this.loadingCustomer = false;
          this.getWaitingRoom();
        },
        error: (error) => {
          console.error('Error attending customer:', error);
          this.loadingCustomer = false;
        }
      });
  }

  completeService(): void {
    if (!this.selectedCustomer?._id) {
      console.warn('No customer selected');
      return;
    }

    this.loadingCustomer = true;
    this.operatorService
      .completeService(this.selectedCustomer._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.selectedCustomer = response;
          this.loadingCustomer = false;
          this.getWaitingRoom();
          // Si el servicio está completado, limpiar el cliente actual
          if (response.status === 'COMPLETED') {
            setTimeout(() => {
              this.selectedCustomer = undefined;
              this.getInServiceCustomer();
            }, 2000);
          }
        },
        error: (error) => {
          console.error('Error completing service:', error);
          this.loadingCustomer = false;
        }
      });
  }

  recallCustomer(): void {
    if (!this.selectedCustomer?._id) {
      console.warn('No customer selected');
      return;
    }

    this.loadingCustomer = true;
    this.operatorService
      .recallCustomer(this.selectedCustomer._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.selectedCustomer = response;
          this.loadingCustomer = false;
          // El cliente vuelve a estado CALLING, se actualizará automáticamente
        },
        error: (error) => {
          console.error('Error recalling customer:', error);
          this.loadingCustomer = false;
        }
      });
  }

  changeCustomerService(): void {
    if (!this.selectedCustomer?._id || !this.selectedNewService?._id) {
      console.warn('No customer or service selected');
      return;
    }

    // No permitir cambiar al mismo servicio
    if (this.selectedCustomer.serviceId === this.selectedNewService._id) {
      console.warn('Customer is already in this service');
      return;
    }

    this.loadingCustomer = true;
    this.operatorService
      .changeCustomerService(this.selectedCustomer._id, this.selectedNewService._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          // El cliente ha sido movido a otro servicio con prioridad
          // Limpiar el cliente actual ya que ya no está en servicio
          this.selectedCustomer = undefined;
          this.selectedNewService = undefined;
          this.loadingCustomer = false;
          this.getWaitingRoom();
          this.getInServiceCustomer();
        },
        error: (error) => {
          console.error('Error changing customer service:', error);
          this.loadingCustomer = false;
        }
      });
  }

  getStatusBadgeClass(status?: string): string {
    switch (status) {
      case 'CALLING':
        return 'status-calling';
      case 'IN_SERVICE':
        return 'status-in-service';
      case 'COMPLETED':
        return 'status-completed';
      case 'QUEUED':
        return 'status-queued';
      default:
        return 'status-default';
    }
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'CALLING':
        return 'Llamando';
      case 'IN_SERVICE':
        return 'En Servicio';
      case 'COMPLETED':
        return 'Completado';
      case 'QUEUED':
        return 'En Cola';
      default:
        return status || 'Desconocido';
    }
  }

  getWaitingTime(queuedTime?: number): string {
    if (!queuedTime) return 'N/A';
    const now = Date.now();
    const diff = now - queuedTime;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}
