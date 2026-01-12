import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { TicketPointService } from '../../../services/ticket-point.service';
import { ServiceService } from '../../../services/service.service';
import { EnterpriseService } from '../../../services/enterprise.service';
import { AuthService } from '../../../services/auth.service';
import { Service } from '../../../models/service.model';
import { Enterprise } from '../../../models/enterprise.model';
import { TicketPoint, ServiceWithPriority } from '../../../models/ticket-point.model';

@Component({
  selector: 'afoone-ticket-point-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    SelectModule,
    MultiSelect,
    TableModule,
    CheckboxModule,
  ],
  templateUrl: './ticket-point-create.component.html',
  styleUrls: ['./ticket-point-create.component.css'],
})
export class TicketPointCreateComponent implements OnInit {
  ticketPointForm: FormGroup;
  availableEnterprises: Enterprise[] = [];
  availableServices: Service[] = [];
  filteredServices: Service[] = [];
  currentUser: any = null;
  isEnterpriseAdmin: boolean = false;
  selectedServicesWithPriority: Array<{ service: Service; priority: boolean }> = [];

  constructor(
    private fb: FormBuilder,
    private ticketPointService: TicketPointService,
    private serviceService: ServiceService,
    private enterpriseService: EnterpriseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.ticketPointForm = this.fb.group({
      name: ['', Validators.required],
      location: [''],
      enterprise: ['', Validators.required],
      services: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    // Verificar si es ENTERPRISE_ADMIN
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isEnterpriseAdmin = (user?.roles?.includes('ENTERPRISE_ADMIN') && !user?.admin) ?? false;
      
      if (this.isEnterpriseAdmin && user?.enterprise) {
        // Si es ENTERPRISE_ADMIN, asignar automáticamente su empresa
        this.ticketPointForm.patchValue({ enterprise: user.enterprise });
        this.ticketPointForm.get('enterprise')?.disable();
      }
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

  filterServicesByEnterprise(enterpriseId: string): void {
    if (!enterpriseId) {
      this.filteredServices = [];
      this.ticketPointForm.patchValue({ services: [] });
      this.selectedServicesWithPriority = [];
      return;
    }

    this.filteredServices = this.availableServices.filter(service => {
      const serviceEnterpriseId = typeof service.enterprise === 'string' 
        ? service.enterprise 
        : service.enterprise?._id;
      return serviceEnterpriseId === enterpriseId;
    });
  }

  updateServicesWithPriority(selectedServiceIds: string[]): void {
    if (!selectedServiceIds || selectedServiceIds.length === 0) {
      this.selectedServicesWithPriority = [];
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

    this.ticketPointService.createTicketPoint(ticketPointData).subscribe({
      next: () => this.router.navigate(['/ticket-points']),
      error: (error) => console.error('Error creating ticket point:', error),
    });
  }

  onCancel() {
    this.router.navigate(['/ticket-points']);
  }
}

