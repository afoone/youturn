import { Component, OnInit } from '@angular/core';
import { Service } from '../../../models/service.model';
import { ServiceService } from '../../../services/service.service';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css'],
  imports: [TableModule, ButtonModule, TooltipModule],
})
export class ServiceComponent implements OnInit {
  services: Service[] = [];
  loading: boolean = true;

  constructor(private serviceService: ServiceService, private router: Router) {}

  ngOnInit(): void {
    this.getServices();
  }

  getServices() {
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.services = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching enterprises', err);
        this.loading = false;
      },
    });
  }

  // Navegar a la página de edición
  editService(id: string) {
    this.router.navigate([`/services/${id}`]);
  }

  // Navegar a la página para agregar un nuevo servicio
  addService() {
    this.router.navigate(['/services/new']);
  }
}
