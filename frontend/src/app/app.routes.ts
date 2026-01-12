import { Routes } from '@angular/router';
import { EnterprisesComponent } from './enterprises/enterprises/enterprises.component';
import { EnterpriseDetailComponent } from './enterprises/enterprise-detail/enterprise-detail.component';
import { EnterpriseCreateComponent } from './enterprises/enterprise-create/enterprise-create.component';
import { ServiceComponent } from './pages/services/service/service.component';
import { ServiceCreateComponent } from './pages/services/service-create/service-create.component';
import { ServiceDetailComponent } from './pages/services/service-detail/service-detail.component';
import { OperatorBoardComponent } from './pages/operator/operator.component';
import { OperatorDetailComponent } from './components/operators/operator-detail/operator-detail.component';
import { OperatorsComponent } from './components/operators/operators/operators.component';
import { OperatorCreateComponent } from './components/operators/operator-create/operator-create.component';
import { ScreenCreateComponent } from './components/screen/screen-create/screen-create.component';
import { ScreensComponent } from './components/screen/screens/screens.component';
import { ScreenViewComponent } from './components/screen/screen-view/screen-view.component';
import { TicketPointComponent } from './pages/ticket-point/ticket-point.component';
import { TicketPointsComponent } from './pages/ticket-points/ticket-points.component';
import { TicketPointCreateComponent } from './pages/ticket-points/ticket-point-create/ticket-point-create.component';
import { TicketPointDetailComponent } from './pages/ticket-points/ticket-point-detail/ticket-point-detail.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { UsersComponent } from './pages/users/users.component';
import { UserCreateComponent } from './pages/users/user-create/user-create.component';
import { UserDetailComponent } from './pages/users/user-detail/user-detail.component';
import { PlansComponent } from './pages/plans/plans.component';
import { PlanCreateComponent } from './pages/plans/plan-create/plan-create.component';
import { PlanDetailComponent } from './pages/plans/plan-detail/plan-detail.component';
import { LandingComponent } from './pages/landing/landing.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';
import { userManagementGuard } from './guards/user-management.guard';

export const routes: Routes = [
  // ========== RUTAS PÚBLICAS (sin autenticación, sin menú) ==========
  // Landing page
  { path: '', component: LandingComponent },

  // Auth routes
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },

  // Public screens and ticket point
  { path: 'screens/:id/view', component: ScreenViewComponent },
  // Bloquear acceso a ticket-point/default
  { path: 'ticket-point/default', redirectTo: '/ticket-points', pathMatch: 'full' },
  { path: 'ticket-point/:id', component: TicketPointComponent },

  // ========== RUTAS DE ADMINISTRACIÓN (requieren autenticación, con menú) ==========
  // Enterprises (solo admin)
  { path: 'enterprises', component: EnterprisesComponent, canActivate: [authGuard, adminGuard] },
  {
    path: 'enterprises/new',
    component: EnterpriseCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard, adminGuard],
  },
  { path: 'enterprises/:id', component: EnterpriseDetailComponent, canActivate: [authGuard, adminGuard] },

  // Services
  { path: 'services', component: ServiceComponent, canActivate: [authGuard] },
  {
    path: 'services/new',
    component: ServiceCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  { path: 'services/:id', component: ServiceDetailComponent, canActivate: [authGuard] },

  // Operator Dashboard
  { path: 'operator-dashboard/:id', component: OperatorBoardComponent, canActivate: [authGuard] },

  // Operators
  {
    path: 'operators/new',
    component: OperatorCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  { path: 'operators/:id', component: OperatorDetailComponent, canActivate: [authGuard] },
  { path: 'operators', component: OperatorsComponent, canActivate: [authGuard] },

  // Screens (admin only - creación y lista)
  { path: 'screens/new', component: ScreenCreateComponent, pathMatch: 'full', canActivate: [authGuard] },
  { path: 'screens', component: ScreensComponent, canActivate: [authGuard] },

  // Ticket Points (admin y ENTERPRISE_ADMIN pueden crear/editar)
  { path: 'ticket-points', component: TicketPointsComponent, canActivate: [authGuard] },
  {
    path: 'ticket-points/new',
    component: TicketPointCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard, userManagementGuard],
  },
  { path: 'ticket-points/:id', component: TicketPointDetailComponent, canActivate: [authGuard, userManagementGuard] },

  // Users CRUD (admin o ENTERPRISE_ADMIN)
  { path: 'users', component: UsersComponent, canActivate: [authGuard, userManagementGuard] },
  {
    path: 'users/new',
    component: UserCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard, userManagementGuard]
  },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [authGuard, userManagementGuard] },

  // Plans CRUD (solo admin)
  { path: 'plans', component: PlansComponent, canActivate: [authGuard, adminGuard] },
  {
    path: 'plans/new',
    component: PlanCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard, adminGuard],
  },
  { path: 'plans/:id', component: PlanDetailComponent, canActivate: [authGuard, adminGuard] },

  // Default redirect (si no está autenticado, ir a landing)
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
