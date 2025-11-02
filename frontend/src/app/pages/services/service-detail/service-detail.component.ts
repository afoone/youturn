import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceService } from '../../../services/service.service';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'afoone-service-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.css'],
})
export class ServiceDetailComponent implements OnInit {
  serviceForm!: FormGroup;
  serviceId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private serviceService: ServiceService
  ) {}

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id') || '';

    this.serviceForm = this.fb.group({
      uuid: ['', Validators.required],
      name: ['', Validators.required],
      prefix: ['', Validators.required],
      description: [''],
    });

    if (this.serviceId) {
      this.serviceService.getServiceById(this.serviceId).subscribe({
        next: (data) => this.serviceForm.patchValue(data),
        error: (err) => console.error('Error fetching service:', err),
      });
    }
  }

  onSubmit() {
    if (this.serviceForm.invalid) return;

    const updatedService: Service = {
      _id: this.serviceId,
      ...this.serviceForm.value,
    };

    this.serviceService.updateService(updatedService).subscribe({
      next: () => this.router.navigate(['/services']),
      error: (err: any) => console.error('Error updating service:', err),
    });
  }
}
