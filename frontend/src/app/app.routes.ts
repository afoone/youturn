import { Routes } from '@angular/router';
import { EnterprisesComponent } from './enterprises/enterprises/enterprises.component';
import { EnterpriseDetailComponent } from './enterprises/enterprise-detail/enterprise-detail.component';
import { EnterpriseCreateComponent } from './enterprises/enterprise-create/enterprise-create.component';
import { ServiceComponent } from './pages/services/service/service.component';
import { ServiceCreateComponent } from './pages/services/service-create/service-create.component';
import { ServiceDetailComponent } from './pages/services/service-detail/service-detail.component';
import { QueueComponent } from './pages/queue/queue.component';
import { OperatorBoardComponent } from './pages/operator/operator.component';
import { OperatorDetailComponent } from './components/operators/operator-detail/operator-detail.component';
import { OperatorsComponent } from './components/operators/operators/operators.component';
import { OperatorCreateComponent } from './components/operators/operator-create/operator-create.component';
import { ScreenCreateComponent } from './components/screen/screen-create/screen-create.component';
import { ScreensComponent } from './components/screen/screens/screens.component';
import { ScreenViewComponent } from './components/screen/screen-view/screen-view.component';
import { TicketPointComponent } from './pages/ticket-point/ticket-point.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { UsersComponent } from './pages/users/users.component';
import { UserCreateComponent } from './pages/users/user-create/user-create.component';
import { UserDetailComponent } from './pages/users/user-detail/user-detail.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // ========== RUTAS PÚBLICAS (sin autenticación, sin menú) ==========
  // Auth routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Public screens and ticket point
  { path: 'screens/:id/view', component: ScreenViewComponent },
  { path: 'ticket-point/:id', component: TicketPointComponent },

  // ========== RUTAS DE ADMINISTRACIÓN (requieren autenticación, con menú) ==========
  // Enterprises
  { path: 'enterprises', component: EnterprisesComponent, canActivate: [authGuard] },
  {
    path: 'enterprises/new',
    component: EnterpriseCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  { path: 'enterprises/:id', component: EnterpriseDetailComponent, canActivate: [authGuard] },

  // Services
  { path: 'services', component: ServiceComponent, canActivate: [authGuard] },
  {
    path: 'services/new',
    component: ServiceCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard],
  },
  { path: 'services/:id', component: ServiceDetailComponent, canActivate: [authGuard] },

  // Queue
  { path: 'queue', component: QueueComponent, canActivate: [authGuard] },

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

  // Users CRUD (solo admin)
  { path: 'users', component: UsersComponent, canActivate: [authGuard, adminGuard] },
  {
    path: 'users/new',
    component: UserCreateComponent,
    pathMatch: 'full',
    canActivate: [authGuard, adminGuard]
  },
  { path: 'users/:id', component: UserDetailComponent, canActivate: [authGuard, adminGuard] },

  // Default redirect
  { path: '', redirectTo: '/queue', pathMatch: 'full' },
];
