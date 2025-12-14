import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { EnterpriseService } from '../../../services/enterprise.service';
import { Enterprise } from '../../../models/enterprise.model';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-user-create',
  standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      InputTextModule,
      ButtonModule,
      CardModule,
      CheckboxModule,
      DropdownModule,
      MessageModule,
      MessagesModule
    ],
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  errorMessage = '';
  enterprises: Enterprise[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private enterpriseService: EnterpriseService,
    public router: Router
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      admin: [false],
      enterpriseId: [''],
      roles: [[]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.loadEnterprises();
    // Validación condicional: enterprise requerido si no es admin
    this.userForm.get('admin')?.valueChanges.subscribe(isAdmin => {
      const enterpriseControl = this.userForm.get('enterpriseId');
      if (isAdmin) {
        enterpriseControl?.clearValidators();
        enterpriseControl?.setValue('');
      } else {
        enterpriseControl?.setValidators([Validators.required]);
      }
      enterpriseControl?.updateValueAndValidity();
    });
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
    const roles = this.userForm.get('roles')?.value || [];
    return Array.isArray(roles) ? roles.join(', ') : '';
  }

  updateRolesFromString(event: any): void {
    const value = event.target.value || '';
    const roles = value.split(',').map((r: string) => r.trim()).filter((r: string) => r.length > 0);
    this.userForm.patchValue({ roles });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.userForm.value;
    const userData: any = {
      username: formValue.username,
      email: formValue.email,
      password: formValue.password,
      admin: formValue.admin || false,
      roles: formValue.roles || [],
      active: formValue.active
    };

    // Solo incluir enterpriseId si no es admin
    if (!userData.admin && formValue.enterpriseId) {
      userData.enterpriseId = formValue.enterpriseId;
    }

    this.userService.createUser(userData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al crear usuario';
      }
    });
  }
}

