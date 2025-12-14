import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  selector: 'app-user-detail',
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
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  userForm: FormGroup;
  userId!: string;
  loading = false;
  errorMessage = '';
  enterprises: Enterprise[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private userService: UserService,
    private enterpriseService: EnterpriseService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Opcional para actualización
      admin: [false],
      enterpriseId: [''],
      roles: [[]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.loadEnterprises();
    if (this.userId) {
      this.loadUser();
    }
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

  loadUser(): void {
    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        let enterpriseId = '';
        if (user.enterprise) {
          if (typeof user.enterprise === 'string') {
            enterpriseId = user.enterprise;
          } else {
            enterpriseId = (user.enterprise as any)._id || (user.enterprise as any).id || '';
          }
        }

        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          admin: user.admin || false,
          enterpriseId: enterpriseId,
          roles: user.roles || [],
          active: user.active
        });
        // No cargar password, se deja vacío para actualización opcional
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.errorMessage = 'Error al cargar el usuario';
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
      _id: this.userId,
      username: formValue.username,
      email: formValue.email,
      admin: formValue.admin || false,
      roles: formValue.roles || [],
      active: formValue.active
    };

    // Solo incluir enterpriseId si no es admin
    if (!userData.admin && formValue.enterpriseId) {
      userData.enterpriseId = formValue.enterpriseId;
    } else if (userData.admin) {
      userData.enterpriseId = undefined;
    }

    // Solo incluir password si se proporcionó uno nuevo
    if (formValue.password && formValue.password.trim() !== '') {
      userData.password = formValue.password;
    }

    this.userService.updateUser(userData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/users']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Error al actualizar usuario';
      }
    });
  }
}

