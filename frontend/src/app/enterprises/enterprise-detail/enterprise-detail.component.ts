import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EnterpriseService } from '../../services/enterprise.service';
import { Enterprise } from '../../models/enterprise.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'afoone-enterprise-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './enterprise-detail.component.html',
  styleUrls: ['./enterprise-detail.component.css']
})
export class EnterpriseDetailComponent implements OnInit {
  enterpriseForm!: FormGroup;
  enterpriseId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private enterpriseService: EnterpriseService
  ) {}

  ngOnInit(): void {
    this.enterpriseId = this.route.snapshot.paramMap.get('id') || '';

    this.enterpriseForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required]
    });

    if (this.enterpriseId) {
      this.enterpriseService.getEnterpriseById(this.enterpriseId).subscribe({
        next: (data) => this.enterpriseForm.patchValue(data),
        error: (err) => console.error('Error fetching enterprise:', err)
      });
    }
  }

  onSubmit() {
    if (this.enterpriseForm.invalid) return;
    const updatedEnterprise: Enterprise = { _id: this.enterpriseId, ...this.enterpriseForm.value };
    this.enterpriseService.updateEnterprise(updatedEnterprise).subscribe({
      next: () => this.router.navigate(['/enterprises']),
      error: (err) => console.error('Error updating enterprise:', err)
    });
  }

  onCancel() {
    this.router.navigate(['/enterprises']);
  }
}
