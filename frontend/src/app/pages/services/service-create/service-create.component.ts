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
import { ServiceService } from '../../../services/service.service';
import { EnterpriseService } from '../../../services/enterprise.service';
import { AuthService } from '../../../services/auth.service';
import { Service } from '../../../models/service.model';
import { Enterprise } from '../../../models/enterprise.model';

@Component({
  selector: 'afoone-service-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    SelectModule,
  ],
  templateUrl: './service-create.component.html',
  styleUrls: ['./service-create.component.css'],
})
export class ServiceCreateComponent implements OnInit {
  serviceForm: FormGroup;
  enterprises: Enterprise[] = [];
  currentUser: any = null;
  isEnterpriseAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private enterpriseService: EnterpriseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      prefix: ['', Validators.required],
      enterprise: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Verificar si es ENTERPRISE_ADMIN
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isEnterpriseAdmin = (user?.roles?.includes('ENTERPRISE_ADMIN') && !user?.admin) ?? false;
      
      if (this.isEnterpriseAdmin && user?.enterprise) {
        // Si es ENTERPRISE_ADMIN, asignar automáticamente su empresa
        this.serviceForm.patchValue({ enterprise: user.enterprise });
        this.serviceForm.get('enterprise')?.disable();
      }
    });

    this.loadEnterprises();
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
    const serviceData: Partial<Service> = {
      ...formValue,
      enterprise: formValue.enterprise,
    };

    this.serviceService.createService(serviceData as Service).subscribe({
      next: () => this.router.navigate(['/services']),
      error: (error) => console.error('Error creating service:', error),
    });
  }

  onCancel() {
    this.router.navigate(['/services']);
  }
}
