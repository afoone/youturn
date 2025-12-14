import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table'; // Importar el módulo de tabla de PrimeNG
import { ButtonModule } from 'primeng/button';
import { EnterpriseService } from '../../services/enterprise.service';
import { Enterprise } from '../../models/enterprise.model';

@Component({
  selector: 'afoone-enterprises',
  standalone: true,
  templateUrl: './enterprises.component.html',
  styleUrls: ['./enterprises.component.css'],
  imports: [TableModule, ButtonModule],
})
export class EnterprisesComponent implements OnInit {
  enterprises: Enterprise[] = []; // Almacenará la lista de clientes
  loading: boolean = true; // Indicador para mostrar el loading

  constructor(
    private enterpriseService: EnterpriseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getEnterprises();
  }

  // Obtener la lista de clientes
  getEnterprises() {
    this.enterpriseService.getEnterprises().subscribe({
      next: (data) => {
        this.enterprises = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching enterprises', err);
        this.loading = false;
      },
    });
  }

  // Navegar a la página de edición
  editEnterprise(id: string) {
    this.router.navigate([`/enterprises/${id}`]);
  }

  // Navegar a la página para agregar un nuevo enterprise
  addEnterprise() {
    this.router.navigate(['/enterprises/new']);
  }

  // Eliminar un enterprise
  deleteEnterprise(id: string) {
    if (confirm('Are you sure you want to delete this enterprise?')) {
      this.enterpriseService.deleteEnterprise(id).subscribe({
        next: () => {
          this.getEnterprises(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error deleting enterprise:', err);
        }
      });
    }
  }
}
