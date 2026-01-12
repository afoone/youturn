import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextarea } from 'primeng/inputtextarea';
import { PlanService } from '../../../services/plan.service';
import { Plan } from '../../../models/plan.model';

@Component({
  selector: 'afoone-plan-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
  ],
  templateUrl: './plan-detail.component.html',
  styleUrls: ['./plan-detail.component.css'],
})
export class PlanDetailComponent implements OnInit {
  planForm!: FormGroup;
  planId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService
  ) {}

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id') || '';

    this.planForm = this.fb.group({
      codigo: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      precio: [0, [Validators.min(0)]], // No es requerido, puede ser 0 (gratis)
      detalles: [''],
      maxTicketPoints: [0, [Validators.required, Validators.min(0)]],
      maxUsuarios: [0, [Validators.required, Validators.min(0)]],
      maxServicios: [0, [Validators.required, Validators.min(0)]],
    });

    if (this.planId) {
      this.loadPlan();
    }
  }

  loadPlan(): void {
    this.planService.getPlanById(this.planId).subscribe({
      next: (data) => {
        this.planForm.patchValue({
          codigo: data.codigo,
          descripcion: data.descripcion,
          precio: data.precio,
          detalles: data.detalles || '',
          maxTicketPoints: data.maxTicketPoints,
          maxUsuarios: data.maxUsuarios,
          maxServicios: data.maxServicios,
        });
      },
      error: (err) => console.error('Error fetching plan:', err),
    });
  }

  onSubmit() {
    if (this.planForm.invalid) return;

    const formValue = this.planForm.value;
    const planData: Partial<Plan> = {
      codigo: formValue.codigo,
      descripcion: formValue.descripcion,
      precio: formValue.precio !== null && formValue.precio !== undefined ? Number(formValue.precio) : 0, // Si no se especifica, es 0 (gratis)
      detalles: formValue.detalles || undefined,
      maxTicketPoints: Number(formValue.maxTicketPoints),
      maxUsuarios: Number(formValue.maxUsuarios),
      maxServicios: Number(formValue.maxServicios),
    };

    this.planService.updatePlan(this.planId, planData).subscribe({
      next: () => this.router.navigate(['/plans']),
      error: (err) => console.error('Error updating plan:', err),
    });
  }

  onCancel() {
    this.router.navigate(['/plans']);
  }
}

