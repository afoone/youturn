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

export const routes: Routes = [
  { path: 'enterprises', component: EnterprisesComponent },
  {
    path: 'enterprises/new',
    component: EnterpriseCreateComponent,
    pathMatch: 'full',
  },
  { path: 'enterprises/:id', component: EnterpriseDetailComponent },

  { path: 'services', component: ServiceComponent },
  {
    path: 'services/new',
    component: ServiceCreateComponent,
    pathMatch: 'full',
  },
  { path: 'services/:id', component: ServiceDetailComponent },
  { path: 'queue', component: QueueComponent },
  { path: 'operator-dashboard/:id', component: OperatorBoardComponent },

  {
    path: 'operators/new',
    component: OperatorCreateComponent,
    pathMatch: 'full',
  },
  { path: 'operators/:id', component: OperatorDetailComponent },
  { path: 'operators', component: OperatorsComponent },

  { path: 'screens/new', component: ScreenCreateComponent, pathMatch: 'full' },
  { path: 'screens', component: ScreensComponent },
  { path: 'screens/:id/view', component: ScreenViewComponent },

  { path: 'ticket-point/:id', component: TicketPointComponent },

  { path: '', redirectTo: '/queue', pathMatch: 'full' },
];
