import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PlanService } from '../../services/plan.service';
import { AuthService } from '../../services/auth.service';
import { Plan } from '../../models/plan.model';

@Component({
  selector: 'afoone-plans',
  standalone: true,
  templateUrl: './plans.component.html',
  styleUrls: ['./plans.component.css'],
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
})
export class PlansComponent implements OnInit {
  plans: Plan[] = [];
  loading = true;
  isAdmin = false;

  constructor(
    private planService: PlanService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAdmin = user?.admin === true;
      this.getPlans();
    });
  }

  getPlans() {
    this.planService.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching plans', err);
        this.loading = false;
      },
    });
  }

  editPlan(id: string) {
    this.router.navigate([`/plans/${id}`]);
  }

  addPlan() {
    this.router.navigate(['/plans/new']);
  }

  deletePlan(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este plan?')) {
      this.planService.deletePlan(id).subscribe({
        next: () => this.getPlans(),
        error: (err) => console.error('Error deleting plan:', err),
      });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price ?? 0);
  }
}
