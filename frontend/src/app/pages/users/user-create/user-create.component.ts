import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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
  selector: 'app-user-create',
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
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
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

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private enterpriseService: EnterpriseService,
    private serviceService: ServiceService,
    private operatorService: OperatorService,
    private authService: AuthService,
    public router: Router
  ) {
    // Inicializar controles de checkboxes
    this.enterpriseAdminControl = this.fb.control(false);
    this.operatorControl = this.fb.control(false);
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
      this.currentUser = user;
      this.isEnterpriseAdmin = (user?.roles?.includes('ENTERPRISE_ADMIN') ?? false) && !user?.admin;
      this.canCreateAdmin = user?.admin === true;
      
      // Si es ENTERPRISE_ADMIN, asignar automáticamente su empresa
      if (this.isEnterpriseAdmin && user?.enterprise) {
        const enterpriseId = typeof user.enterprise === 'string' 
          ? user.enterprise 
          : (user.enterprise as any)._id || (user.enterprise as any).id;
        this.userForm.patchValue({ enterpriseId }, { emitEvent: false });
        this.filterServicesByEnterprise(enterpriseId);
      }
    });
    
    this.loadEnterprises();
    this.loadServices();
    this.loadOperators();
    
    // Validación condicional: enterprise requerido si no es admin
    this.userForm.get('admin')?.valueChanges.subscribe(isAdmin => {
      const enterpriseControl = this.userForm.get('enterpriseId');
      if (isAdmin) {
        enterpriseControl?.clearValidators();
        enterpriseControl?.setValue('');
        this.userForm.get('services')?.setValue([]);
        this.userForm.get('operatorId')?.setValue('');
      } else {
        enterpriseControl?.setValidators([Validators.required]);
      }
      enterpriseControl?.updateValueAndValidity();
      // Actualizar validación de operator cuando cambia admin
      this.updateOperatorValidation();
    });

    // Filtrar servicios y operators cuando cambia la enterprise
    this.userForm.get('enterpriseId')?.valueChanges.subscribe(enterpriseId => {
      this.filterServicesByEnterprise(enterpriseId);
      this.filterOperatorsByEnterprise(enterpriseId);
      // Actualizar validación de operator cuando cambia la enterprise
      this.updateOperatorValidation();
    });

    // Sincronizar checkboxes con el array de roles
    this.enterpriseAdminControl.valueChanges.subscribe(checked => {
      this.updateRolesFromCheckboxes();
    });
    
    // Validación condicional: operator requerido si es OPERATOR
    this.operatorControl.valueChanges.subscribe(checked => {
      this.updateRolesFromCheckboxes();
      this.updateOperatorValidation();
      if (!checked) {
        // Si se desmarca OPERATOR, limpiar
        const operatorControl = this.userForm.get('operatorId');
        operatorControl?.setValue('');
        this.userForm.get('services')?.setValue([]);
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
    // Nota: Asumiendo que los servicios tienen un campo enterprise
    // Si no existe, necesitaremos agregarlo al modelo de Service
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

  private updateOperatorValidation(): void {
    const operatorControl = this.userForm.get('operatorId');
    const isOperator = this.isOperator();
    const isAdmin = this.userForm.get('admin')?.value;
    const hasEnterprise = !!this.userForm.get('enterpriseId')?.value;
    
    // Solo requerir operator si: es OPERATOR, no es admin, y tiene enterprise seleccionada
    if (isOperator && !isAdmin && hasEnterprise) {
      operatorControl?.setValidators([Validators.required]);
    } else {
      operatorControl?.clearValidators();
    }
    operatorControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const formValue = this.userForm.value;
    const userData: any = {
      email: formValue.email,
      password: formValue.password,
      nombre: formValue.nombre || undefined,
      apellidos: formValue.apellidos || undefined,
      comentario: formValue.comentario || undefined,
      admin: this.canCreateAdmin ? (formValue.admin || false) : false, // Solo admins pueden crear admins
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
    }

    // Incluir servicios y operator si el usuario es OPERATOR
    if (this.isOperator()) {
      if (formValue.services && formValue.services.length > 0) {
        userData.services = formValue.services;
      }
      if (formValue.operatorId) {
        userData.operator = formValue.operatorId;
      }
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

  onCancel() {
    this.router.navigate(['/users']);
  }
}

