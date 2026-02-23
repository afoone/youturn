import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TicketPointService } from '../../../services/ticket-point.service';
import { ServiceService } from '../../../services/service.service';
import { EnterpriseService } from '../../../services/enterprise.service';
import { AuthService } from '../../../services/auth.service';
import { TicketPoint, ServiceWithPriority } from '../../../models/ticket-point.model';
import { Service } from '../../../models/service.model';
import { Enterprise } from '../../../models/enterprise.model';

@Component({
  selector: 'afoone-ticket-point-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    MultiSelect,
    TableModule,
    CheckboxModule,
  ],
  templateUrl: './ticket-point-detail.component.html',
  styleUrls: ['./ticket-point-detail.component.css'],
})
export class TicketPointDetailComponent implements OnInit {
  ticketPointForm!: FormGroup;
  ticketPointId!: string;
  availableEnterprises: Enterprise[] = [];
  availableServices: Service[] = [];
  filteredServices: Service[] = [];
  currentUser: any = null;
  isEnterpriseAdmin: boolean = false;
  selectedServicesWithPriority: Array<{ service: Service; priority: boolean }> = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private ticketPointService: TicketPointService,
    private serviceService: ServiceService,
    private enterpriseService: EnterpriseService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.ticketPointId = this.route.snapshot.paramMap.get('id') || '';

    // Verificar si es ENTERPRISE_ADMIN
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isEnterpriseAdmin = (user?.roles?.includes('ENTERPRISE_ADMIN') && !user?.admin) ?? false;
    });

    this.ticketPointForm = this.fb.group({
      name: ['', Validators.required],
      location: [''],
      enterprise: ['', Validators.required],
      services: [[], Validators.required],
    });

    this.loadEnterprises();
    this.loadServices();

    // Filtrar servicios cuando cambie la empresa
    this.ticketPointForm.get('enterprise')?.valueChanges.subscribe(enterpriseId => {
      this.filterServicesByEnterprise(enterpriseId);
    });

    // Actualizar tabla de prioridades cuando cambien los servicios seleccionados
    this.ticketPointForm.get('services')?.valueChanges.subscribe(selectedServiceIds => {
      this.updateServicesWithPriority(selectedServiceIds);
    });

    if (this.ticketPointId !== 'new') {
      this.loadTicketPoint();
    }
  }

  loadTicketPoint(): void {
    this.ticketPointService.getTicketPointById(this.ticketPointId).subscribe({
      next: (data) => {
        const enterpriseId = typeof data.enterprise === 'string'
          ? data.enterprise
          : data.enterprise?._id;

        // Manejar tanto la estructura antigua (array simple) como la nueva (con prioridad)
        let serviceIds: string[] = [];
        const servicesWithPriorityData: Array<{ serviceId: string; priority: boolean }> = [];

        if (data.services && data.services.length > 0) {
          // Verificar si es la nueva estructura (con prioridad)
          const firstService = data.services[0];
          if (typeof firstService === 'object' && 'service' in firstService && 'priority' in firstService) {
            // Nueva estructura con prioridad
            data.services.forEach((s: any) => {
              const serviceId = typeof s.service === 'string'
                ? s.service
                : (typeof s.service === 'object' && s.service?._id
                  ? s.service._id
                  : s.service);
              serviceIds.push(serviceId);
              servicesWithPriorityData.push({
                serviceId,
                priority: s.priority || false,
              });
            });
          } else {
            // Estructura antigua (array simple)
            serviceIds = data.services.map((s: any) =>
              typeof s === 'string' ? s : s._id
            );
          }
        }

        this.ticketPointForm.patchValue({
          name: data.name,
          location: data.location || '',
          enterprise: enterpriseId,
          services: serviceIds,
        });

        // Si es ENTERPRISE_ADMIN, deshabilitar el selector de empresa
        if (this.isEnterpriseAdmin) {
          this.ticketPointForm.get('enterprise')?.disable();
        }

        // Filtrar servicios después de cargar y luego mapear prioridades
        if (enterpriseId) {
          this.filterServicesByEnterprise(enterpriseId).then(() => {
            // Mapear servicios con prioridad usando los servicios cargados
            if (servicesWithPriorityData.length > 0) {
              this.selectedServicesWithPriority = servicesWithPriorityData
                .map(item => {
                  const service = this.filteredServices.find(s => s._id === item.serviceId);
                  if (!service) return null;
                  return {
                    service,
                    priority: item.priority,
                  };
                })
                .filter((item): item is { service: Service; priority: boolean } => item !== null);
            } else {
              this.updateServicesWithPriority(serviceIds);
            }
          });
        } else {
          this.updateServicesWithPriority(serviceIds);
        }
      },
      error: (err) => console.error('Error fetching ticket point:', err),
    });
  }

  loadEnterprises(): void {
    this.enterpriseService.getEnterprises().subscribe({
      next: (data) => {
        this.availableEnterprises = data;
      },
      error: (err) => {
        console.error('Error loading enterprises:', err);
      }
    });
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.availableServices = data;
        const enterpriseId = this.ticketPointForm.get('enterprise')?.value;
        if (enterpriseId) {
          this.filterServicesByEnterprise(enterpriseId);
        }
      },
      error: (err) => {
        console.error('Error loading services:', err);
      }
    });
  }

  filterServicesByEnterprise(enterpriseId: string): Promise<void> {
    return new Promise((resolve) => {
      if (!enterpriseId) {
        this.filteredServices = [];
        this.ticketPointForm.patchValue({ services: [] });
        this.selectedServicesWithPriority = [];
        resolve();
        return;
      }

      this.filteredServices = this.availableServices.filter(service => {
        const serviceEnterpriseId = typeof service.enterprise === 'string'
          ? service.enterprise
          : service.enterprise?._id;
        return serviceEnterpriseId === enterpriseId;
      });
      resolve();
    });
  }

  updateServicesWithPriority(selectedServiceIds: string[]): void {
    if (!selectedServiceIds || selectedServiceIds.length === 0) {
      this.selectedServicesWithPriority = [];
      this.selectedServicesWithPriority = [...this.selectedServicesWithPriority];
      return;
    }

    // Crear un mapa de servicios existentes para mantener las prioridades
    const existingPriorityMap = new Map<string, boolean>();
    this.selectedServicesWithPriority.forEach(item => {
      const serviceId = typeof item.service === 'string' ? item.service : item.service._id;
      existingPriorityMap.set(serviceId, item.priority);
    });

    // Actualizar la lista con los servicios seleccionados
    this.selectedServicesWithPriority = selectedServiceIds
      .map(serviceId => {
        const service = this.filteredServices.find(s => s._id === serviceId);
        if (!service) return null;

        return {
          service,
          priority: existingPriorityMap.get(serviceId) || false,
        };
      })
      .filter((item): item is { service: Service; priority: boolean } => item !== null);

    this.selectedServicesWithPriority = [...this.selectedServicesWithPriority];
  }

  getServiceName(item: { service: Service; priority: boolean }): string {
    return typeof item.service === 'string' ? item.service : (item.service?.name ?? '');
  }

  togglePriority(serviceId: string): void {
    const item = this.selectedServicesWithPriority.find(
      item => (typeof item.service === 'string' ? item.service : item.service._id) === serviceId
    );
    if (item) {
      item.priority = !item.priority;
    }
  }

  onSubmit() {
    if (this.ticketPointForm.invalid) return;

    const formValue = this.ticketPointForm.getRawValue();

    // Transformar servicios a la estructura con prioridad
    const servicesWithPriority: ServiceWithPriority[] = this.selectedServicesWithPriority.map(item => ({
      service: typeof item.service === 'string' ? item.service : item.service._id,
      priority: item.priority,
    }));

    const ticketPointData: Partial<TicketPoint> = {
      name: formValue.name,
      location: formValue.location,
      enterprise: formValue.enterprise,
      services: servicesWithPriority,
    };

    this.ticketPointService.updateTicketPoint(this.ticketPointId, ticketPointData).subscribe({
      next: () => this.router.navigate(['/ticket-points']),
      error: (err) => console.error('Error updating ticket point:', err),
    });
  }

  onCancel() {
    this.router.navigate(['/ticket-points']);
  }
}

