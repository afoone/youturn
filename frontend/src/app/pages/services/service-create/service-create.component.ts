import { Component } from '@angular/core';
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
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ServiceService } from '../../../services/service.service';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'afoone-service-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessagesModule,
    MessageModule,
  ],
  templateUrl: './service-create.component.html',
  styleUrls: ['./service-create.component.css'],
})
export class ServiceCreateComponent {
  serviceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private router: Router
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      prefix: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.serviceForm.invalid) return;

    const enterpriseData: Service = {
      ...this.serviceForm.value,
      id: '',
    };

    this.serviceService.createService(enterpriseData).subscribe({
      next: () => this.router.navigate(['/services']),
      error: (error) => console.error('Error creating service:', error),
    });
  }
}
