import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceService } from '../../../services/service.service';
import { EnterpriseService } from '../../../services/enterprise.service';
import { AuthService } from '../../../services/auth.service';
import { Service } from '../../../models/service.model';
import { Enterprise } from '../../../models/enterprise.model';

@Component({
  selector: 'afoone-service-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css'],
})
export class ServiceDetailComponent implements OnInit {
  serviceForm!: FormGroup;
  serviceId!: string;
  enterprises: Enterprise[] = [];
  currentUser: any = null;
  isEnterpriseAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService,
    private enterpriseService: EnterpriseService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id') || '';
    
    // Verificar si es ENTERPRISE_ADMIN
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isEnterpriseAdmin = (user?.roles?.includes('ENTERPRISE_ADMIN') && !user?.admin) ?? false;
      
      if (this.isEnterpriseAdmin && user?.enterprise) {
        // Si es ENTERPRISE_ADMIN, asignar automáticamente su empresa
        if (this.serviceForm) {
          this.serviceForm.patchValue({ enterprise: user.enterprise });
          this.serviceForm.get('enterprise')?.disable();
        }
      }
    });

    this.loadEnterprises();

    this.serviceForm = this.fb.group({
      uuid: ['', Validators.required],
      name: ['', Validators.required],
      prefix: ['', Validators.required],
      description: [''],
      enterprise: ['', Validators.required],
    });

    if (this.serviceId) {
      this.serviceService.getServiceById(this.serviceId).subscribe({
        next: (data) => {
          const enterpriseId = typeof data.enterprise === 'object' && data.enterprise?._id 
            ? data.enterprise._id 
            : data.enterprise;
          this.serviceForm.patchValue({
            ...data,
            enterprise: enterpriseId
          });

          // Si es ENTERPRISE_ADMIN, deshabilitar el selector de empresa
          if (this.isEnterpriseAdmin) {
            this.serviceForm.get('enterprise')?.disable();
          }
        },
        error: (err) => console.error('Error fetching service:', err),
      });
    } else if (this.isEnterpriseAdmin && this.currentUser?.enterprise) {
      // Si es creación y es ENTERPRISE_ADMIN, asignar automáticamente su empresa
      this.serviceForm.patchValue({ enterprise: this.currentUser.enterprise });
      this.serviceForm.get('enterprise')?.disable();
    }
  }

  loadEnterprises(): void {
    this.enterpriseService.getEnterprises().subscribe({
      next: (data) => {
        this.enterprises = data;
      },
      error: (err) => {
        console.error('Error loading enterprises:', err);
      }
    });
  }

  onSubmit() {
    if (this.serviceForm.invalid) return;

    const formValue = this.serviceForm.getRawValue();
    const updatedService: Service = {
      _id: this.serviceId,
      ...formValue,
      enterprise: formValue.enterprise,
    };

    this.serviceService.updateService(updatedService).subscribe({
      next: () => this.router.navigate(['/services']),
      error: (err: any) => console.error('Error updating service:', err),
    });
  }

  onCancel() {
    this.router.navigate(['/services']);
  }
}
