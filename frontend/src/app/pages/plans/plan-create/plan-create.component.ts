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
import { InputTextarea } from 'primeng/inputtextarea';
import { PlanService } from '../../../services/plan.service';
import { Plan } from '../../../models/plan.model';

@Component({
  selector: 'afoone-plan-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    InputTextarea,
  ],
  templateUrl: './plan-create.component.html',
  styleUrls: ['./plan-create.component.css'],
})
export class PlanCreateComponent implements OnInit {
  planForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private router: Router
  ) {
    this.planForm = this.fb.group({
      codigo: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      precio: [0, [Validators.min(0)]], // No es requerido, puede ser 0 (gratis)
      detalles: [''],
      maxTicketPoints: [null, [Validators.required, Validators.min(0)]],
      maxUsuarios: [null, [Validators.required, Validators.min(0)]],
      maxServicios: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.planForm.invalid) {
      // Marcar todos los campos como touched para mostrar errores
      Object.keys(this.planForm.controls).forEach(key => {
        this.planForm.get(key)?.markAsTouched();
      });
      return;
    }

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

    this.planService.createPlan(planData).subscribe({
      next: () => this.router.navigate(['/plans']),
      error: (error) => {
        console.error('Error creating plan:', error);
        alert(error?.error?.message || 'Error al crear el plan. Por favor, verifica los datos e intenta nuevamente.');
      },
    });
  }

  onCancel() {
    this.router.navigate(['/plans']);
  }
}

