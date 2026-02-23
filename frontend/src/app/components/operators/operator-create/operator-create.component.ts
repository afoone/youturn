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
import { OperatorService } from '../../../services/operator.service';
import { Operator } from '../../../models/operator.type';
import { Service } from '../../../models/service.model';
import { ServiceService } from '../../../services/service.service';
import { MultiSelect } from 'primeng/multiselect';

@Component({
  selector: 'afoone-operator-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    MultiSelect,
  ],
  templateUrl: './operator-create.component.html',
  styleUrls: ['./operator-create.component.css'],
})
export class OperatorCreateComponent implements OnInit {
  operatorForm: FormGroup;

  public availableServices: Service[] = [];

  constructor(
    private fb: FormBuilder,
    private operatorService: OperatorService,
    private router: Router,
    private serviceService: ServiceService
  ) {
    this.operatorForm = this.fb.group({
      positionName: ['', Validators.required],
      description: [''],
      services: [[]],
      pathDescription: [''],
    });
  }

  ngOnInit(): void {
    this.serviceService.getServices().subscribe({
      next: (services) => (this.availableServices = services),
      error: (error) => console.error('Error loading services:', error),
    });
  }

  onSubmit() {
    if (this.operatorForm.invalid) return;

    const operatorData: Operator = {
      ...this.operatorForm.value,
      id: '',
    };

    this.operatorService.createOperator(operatorData).subscribe({
      next: () => this.router.navigate(['/operators']),
      error: (error) => console.error('Error creating operator:', error),
    });
  }

  onCancel() {
    this.router.navigate(['/operators']);
  }
}
