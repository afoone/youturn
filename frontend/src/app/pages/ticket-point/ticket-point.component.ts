import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../services/service.service';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { QueueService } from '../../services/queue.service';
import { ActivatedRoute } from '@angular/router';
import { ServiceCardComponent } from '../../components/ticket/service-card/service-card.component';
import { Service } from '../../models/service.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afoone-ticket-point',
  imports: [DropdownModule, FormsModule, ServiceCardComponent, CommonModule],
  templateUrl: './ticket-point.component.html',
  styleUrls: ['./ticket-point.component.css'],
})
export class TicketPointComponent implements OnInit {
  serviceOptions: { label: string; value: string }[] = [];
  services: Service[] = [];
  selectedService: string = ''; // No undefined, usa string vacío

  createdCustomer: any = null;

  constructor(
    private _serviceService: ServiceService,
    private _queueService: QueueService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // get id from route params if needed
    const id = this.route.snapshot.paramMap.get('id');
    // You can use the id for any specific logic if required
    this.loadServices();
  }

  addToQueue(service: Service): void {
    if (service) {
      this._queueService
        .addToQueue(service._id)
        .subscribe((response) => {
          console.log('Customer added to queue:', response);
          this.createdCustomer = response;
        });
    }
  }

  loadServices(): void {
    this._serviceService.getServices().subscribe((services) => {
      this.services = services;
      this.serviceOptions = services.map((service) => ({
        label: service.name,
        value: service._id,
      }));
    });
  }
}
