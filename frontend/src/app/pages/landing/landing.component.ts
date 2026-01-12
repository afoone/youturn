import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlanService } from '../../services/plan.service';
import { Plan } from '../../models/plan.model';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'afoone-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  plans: Plan[] = [];
  loading = true;
  showKickstarterOffer = true; // Activar/desactivar la oferta de Kickstarter
  kickstarterPrice = 30; // Precio especial de Kickstarter en USD

  constructor(
    private planService: PlanService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  loadPlans(): void {
    this.planService.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading plans:', err);
        this.loading = false;
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  scrollTo(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

