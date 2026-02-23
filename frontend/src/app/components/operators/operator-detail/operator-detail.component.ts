import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelect } from 'primeng/multiselect';
import { OperatorService } from '../../../services/operator.service';
import { ServiceService } from '../../../services/service.service';
import { Operator } from '../../../models/operator.type';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'afoone-operator-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    MultiSelect,
  ],
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.css'],
})
export class OperatorDetailComponent implements OnInit {
  operatorForm!: FormGroup;
  operatorId!: string;
  operatorIdFromRoute!: string;
  availableServices: Service[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private operatorService: OperatorService,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.operatorIdFromRoute = this.route.snapshot.paramMap.get('id') || '';

    // Cargar servicios disponibles
    this.serviceService.getServices().subscribe({
      next: (services) => {
        this.availableServices = services;
      },
      error: (err) => console.error('Error loading services:', err),
    });

    this.operatorForm = this.fb.group({
      positionName: ['', Validators.required],
      description: [''],
      services: [[]],
      pathDescription: [''],
    });

    if (this.operatorIdFromRoute && this.operatorIdFromRoute !== 'new') {
      this.operatorService.getOperatorById(this.operatorIdFromRoute).subscribe({
        next: (data) => {
          // Guardar el _id del operador
          this.operatorId = data._id || this.operatorIdFromRoute;
          
          // Asegurar que services sea un array de IDs
          const servicesIds = data.services?.map((s: any) => 
            typeof s === 'string' ? s : s._id || s.id
          ) || [];
          this.operatorForm.patchValue({
            ...data,
            services: servicesIds
          });
        },
        error: (err) => console.error('Error fetching operator:', err),
      });
    }
  }

  onSubmit() {
    if (this.operatorForm.invalid) return;

    // Usar el _id del operador que se cargó, o el ID de la ruta como fallback
    const operatorIdToUse = this.operatorId || this.operatorIdFromRoute;
    
    if (!operatorIdToUse || operatorIdToUse === 'new') {
      console.error('Invalid operator ID');
      return;
    }

    const updatedOperator: Operator = {
      _id: operatorIdToUse,
      ...this.operatorForm.value,
    };

    this.operatorService.updateOperator(updatedOperator).subscribe({
      next: () => this.router.navigate(['/operators']),
      error: (err) => console.error('Error updating operator:', err),
    });
  }

  onCancel() {
    this.router.navigate(['/operators']);
  }
}
