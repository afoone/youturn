import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { EnterpriseService } from '../../../services/enterprise.service';
import { Enterprise } from '../../../models/enterprise.model';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-register',
  standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      InputTextModule,
      InputTextarea,
      ButtonModule,
      CardModule,
      Select,
      MessageModule,
      RouterModule
    ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  enterprises: Enterprise[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private enterpriseService: EnterpriseService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      nombre: [''],
      apellidos: [''],
      comentario: [''],
      enterpriseId: ['', [Validators.required]],
      roles: [[]]
    });
  }

  ngOnInit(): void {
    this.loadEnterprises();
  }

  loadEnterprises(): void {
    this.enterpriseService.getEnterprises().subscribe({
      next: (enterprises) => {
        this.enterprises = enterprises;
      },
      error: (error) => {
        console.error('Error loading enterprises:', error);
      }
    });
  }

  getRolesAsString(): string {
    const roles = this.registerForm.get('roles')?.value || [];
    return Array.isArray(roles) ? roles.join(', ') : '';
  }

  updateRolesFromString(event: any): void {
    const value = event.target.value || '';
    const roles = value.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0);
    this.registerForm.patchValue({ roles });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.registerForm.value;
    // Solo enviar roles si hay alguno
    const data = {
      email: formValue.email,
      password: formValue.password,
      nombre: formValue.nombre || undefined,
      apellidos: formValue.apellidos || undefined,
      comentario: formValue.comentario || undefined,
      enterpriseId: formValue.enterpriseId,
      admin: false, // El registro público no puede crear admins
      ...(formValue.roles && formValue.roles.length > 0 ? { roles: formValue.roles } : {})
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/ticket-points']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al registrar usuario';
      }
    });
  }
}

