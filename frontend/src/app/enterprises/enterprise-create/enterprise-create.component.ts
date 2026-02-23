import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EnterpriseService } from '../../services/enterprise.service';
import { Enterprise } from '../../models/enterprise.model';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'afoone-enterprise-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, MessageModule],
  templateUrl: './enterprise-create.component.html',
  styleUrls: ['./enterprise-create.component.css']
})
export class EnterpriseCreateComponent {
  enterpriseForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private enterpriseService: EnterpriseService,
    private router: Router
  ) {
    this.enterpriseForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required]  // 👈 Address agregado como requerido
    });
  }

  onSubmit() {
    if (this.enterpriseForm.invalid) return;
    const enterpriseData: Omit<Enterprise, '_id'> = { ...this.enterpriseForm.value };
    this.enterpriseService.createEnterprise(enterpriseData).subscribe({
      next: () => this.router.navigate(['/enterprises']),
      error: (error) => console.error('Error creating enterprise:', error)
    });
  }

  onCancel() {
    this.router.navigate(['/enterprises']);
  }
}
