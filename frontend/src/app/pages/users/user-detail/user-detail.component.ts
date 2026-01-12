import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../services/user.service';
import { EnterpriseService } from '../../../services/enterprise.service';
import { ServiceService } from '../../../services/service.service';
import { OperatorService } from '../../../services/operator.service';
import { AuthService } from '../../../services/auth.service';
import { Enterprise } from '../../../models/enterprise.model';
import { Service } from '../../../models/service.model';
import { Operator } from '../../../models/operator.type';
import { VALID_ROLES } from '../../../models/user.model';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { Select } from 'primeng/select';
import { MultiSelect } from 'primeng/multiselect';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-user-detail',
  standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      InputTextModule,
      InputTextarea,
      ButtonModule,
      CardModule,
      CheckboxModule,
      Select,
      MultiSelect,
      MessageModule
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
  availableServices: Service[] = [];
  filteredServices: Service[] = [];
  availableOperators: Operator[] = [];
  filteredOperators: Operator[] = [];
  validRoles = VALID_ROLES.map(role => ({ label: role, value: role }));
  
  // Controles para checkboxes de roles
  enterpriseAdminControl!: ReturnType<FormBuilder['control']>;
  operatorControl!: ReturnType<FormBuilder['control']>;
  
  // Información del usuario actual
  currentUser: any = null;
  isEnterpriseAdmin: boolean = false;
  canCreateAdmin: boolean = false;
  canEditAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private userService: UserService,
    private enterpriseService: EnterpriseService,
    private serviceService: ServiceService,
    private operatorService: OperatorService,
    private authService: AuthService
  ) {
    // Inicializar controles de checkboxes
    this.enterpriseAdminControl = this.fb.control(false);
    this.operatorControl = this.fb.control(false);
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [''], // Opcional para actualización
      nombre: [''],
      apellidos: [''],
      comentario: [''],
      admin: [false],
      enterpriseId: [''],
      roles: [[]],
      services: [[]],
      operatorId: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
    // Obtener información del usuario actual
    this.authService.currentUser$.subscribe(user => {
      if (!user) return;
      
      this.currentUser = user;
      this.isEnterpriseAdmin = (user?.roles?.includes('ENTERPRISE_ADMIN') ?? false) && !user?.admin;
      this.canCreateAdmin = user?.admin === true;
      this.canEditAdmin = user?.admin === true;
    });
    
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    this.loadEnterprises();
    this.loadServices();
    this.loadOperators();
    if (this.userId) {
      this.loadUser();
    }
    // Validación condicional: enterprise requerido si no es admin
    this.userForm.get('admin')?.valueChanges.subscribe(isAdmin => {
      const enterpriseControl = this.userForm.get('enterpriseId');
      if (isAdmin) {
        enterpriseControl?.clearValidators();
        enterpriseControl?.setValue('');
        this.userForm.get('services')?.setValue([]);
      } else {
        enterpriseControl?.setValidators([Validators.required]);
      }
      enterpriseControl?.updateValueAndValidity();
    });

    // Filtrar servicios y operators cuando cambia la enterprise
    this.userForm.get('enterpriseId')?.valueChanges.subscribe(enterpriseId => {
      this.filterServicesByEnterprise(enterpriseId);
      this.filterOperatorsByEnterprise(enterpriseId);
    });

    // Sincronizar checkboxes con el array de roles
    this.enterpriseAdminControl.valueChanges.subscribe(checked => {
      this.updateRolesFromCheckboxes();
    });
    
    this.operatorControl.valueChanges.subscribe(checked => {
      this.updateRolesFromCheckboxes();
      // Limpiar servicios y operator si se desmarca OPERATOR
      if (!checked) {
        this.userForm.get('services')?.setValue([]);
        const operatorControl = this.userForm.get('operatorId');
        operatorControl?.setValue('');
        operatorControl?.clearValidators();
        operatorControl?.updateValueAndValidity();
      } else if (!this.userForm.get('admin')?.value) {
        // Validar operator si es OPERATOR y no admin
        const operatorControl = this.userForm.get('operatorId');
        operatorControl?.setValidators([Validators.required]);
        operatorControl?.updateValueAndValidity();
      }
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

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (services) => {
        this.availableServices = services;
        this.filterServicesByEnterprise(this.userForm.get('enterpriseId')?.value);
      },
      error: (error) => {
        console.error('Error loading services:', error);
      }
    });
  }

  loadOperators(): void {
    this.operatorService.getOperators().subscribe({
      next: (operators) => {
        this.availableOperators = operators;
        this.filterOperatorsByEnterprise(this.userForm.get('enterpriseId')?.value);
      },
      error: (error) => {
        console.error('Error loading operators:', error);
      }
    });
  }

  filterOperatorsByEnterprise(enterpriseId: string | null): void {
    if (!enterpriseId) {
      this.filteredOperators = [];
      return;
    }

    // Filtrar operators - por ahora mostrar todos, ya que Operator no tiene campo enterprise
    // Si en el futuro se agrega, aplicar el mismo filtro que con services
    this.filteredOperators = this.availableOperators;
  }

  filterServicesByEnterprise(enterpriseId: string | null): void {
    if (!enterpriseId) {
      this.filteredServices = [];
      return;
    }

    // Filtrar servicios que pertenecen a la enterprise seleccionada
    this.filteredServices = this.availableServices.filter(service => {
      const serviceEnterpriseId = (service as any).enterprise;
      if (typeof serviceEnterpriseId === 'string') {
        return serviceEnterpriseId === enterpriseId;
      } else if (serviceEnterpriseId && typeof serviceEnterpriseId === 'object') {
        return serviceEnterpriseId._id === enterpriseId || serviceEnterpriseId.id === enterpriseId;
      }
      return false;
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

        // Extraer IDs de servicios
        let serviceIds: string[] = [];
        if (user.services && user.services.length > 0) {
          serviceIds = user.services.map(service => {
            if (typeof service === 'string') {
              return service;
            } else {
              return (service as any)._id || (service as any).id || '';
            }
          });
        }

        // Extraer ID de operator
        let operatorId = '';
        if (user.operator) {
          if (typeof user.operator === 'string') {
            operatorId = user.operator;
          } else {
            operatorId = (user.operator as any)._id || (user.operator as any).id || '';
          }
        }

        // Asegurar que roles sea un array válido, filtrando nulls y undefined
        const userRoles = (user.roles || []).filter(role => role != null && role !== '');

        // Si es ENTERPRISE_ADMIN, verificar que solo puede editar usuarios de su empresa
        if (this.isEnterpriseAdmin && this.currentUser?.enterprise) {
          const currentEnterpriseId = typeof this.currentUser.enterprise === 'string' 
            ? this.currentUser.enterprise 
            : (this.currentUser.enterprise as any)._id || (this.currentUser.enterprise as any).id;
          
          if (enterpriseId && enterpriseId !== currentEnterpriseId) {
            this.errorMessage = 'No tienes permiso para editar usuarios de otras empresas';
            return;
          }
          
          // Asignar automáticamente la empresa del usuario actual
          enterpriseId = currentEnterpriseId;
        }

        this.userForm.patchValue({
          email: user.email,
          nombre: user.nombre || '',
          apellidos: user.apellidos || '',
          comentario: user.comentario || '',
          admin: user.admin || false,
          enterpriseId: enterpriseId,
          roles: userRoles,
          services: serviceIds,
          operatorId: operatorId,
          active: user.active
        });

        // Actualizar checkboxes basado en los roles del usuario
        this.enterpriseAdminControl.setValue(userRoles.includes('ENTERPRISE_ADMIN'), { emitEvent: false });
        this.operatorControl.setValue(userRoles.includes('OPERATOR'), { emitEvent: false });

        // Filtrar servicios después de cargar el usuario
        if (enterpriseId) {
          this.filterServicesByEnterprise(enterpriseId);
        }
        // No cargar password, se deja vacío para actualización opcional
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.errorMessage = 'Error al cargar el usuario';
      }
    });
  }

  updateRolesFromCheckboxes(): void {
    const roles: string[] = [];
    if (this.enterpriseAdminControl.value) {
      roles.push('ENTERPRISE_ADMIN');
    }
    if (this.operatorControl.value) {
      roles.push('OPERATOR');
    }
    this.userForm.patchValue({ roles }, { emitEvent: false });
  }

  isOperator(): boolean {
    return this.operatorControl.value === true;
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
      email: formValue.email,
      nombre: formValue.nombre || undefined,
      apellidos: formValue.apellidos || undefined,
      comentario: formValue.comentario || undefined,
      admin: this.canEditAdmin ? (formValue.admin || false) : false, // Solo admins pueden hacer usuarios admin
      roles: formValue.roles || [],
      active: formValue.active
    };

    // Si es ENTERPRISE_ADMIN, usar su empresa automáticamente
    if (this.isEnterpriseAdmin && this.currentUser?.enterprise) {
      const enterpriseId = typeof this.currentUser.enterprise === 'string' 
        ? this.currentUser.enterprise 
        : (this.currentUser.enterprise as any)._id || (this.currentUser.enterprise as any).id;
      userData.enterprise = enterpriseId;
    } else if (!userData.admin && formValue.enterpriseId) {
      // Solo incluir enterprise si no es admin
      // El servidor espera 'enterprise' no 'enterpriseId'
      userData.enterprise = formValue.enterpriseId;
    } else if (userData.admin) {
      userData.enterprise = undefined;
    }

    // Incluir servicios y operator si el usuario es OPERATOR
    if (this.isOperator()) {
      if (formValue.services && formValue.services.length > 0) {
        userData.services = formValue.services;
      } else {
        userData.services = [];
      }
      if (formValue.operatorId) {
        userData.operator = formValue.operatorId;
      } else {
        userData.operator = undefined;
      }
    } else {
      userData.services = [];
      userData.operator = undefined;
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

