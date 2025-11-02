import { Component, OnInit } from '@angular/core';
import { ServiceService } from '../../services/service.service';
import { Dropdown, DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { QueueService } from '../../services/queue.service';

@Component({
  selector: 'afoone-queue',
  imports: [DropdownModule, FormsModule],
  templateUrl: './queue.component.html',
  styleUrl: './queue.component.css',
})
export class QueueComponent implements OnInit {
  serviceOptions: { label: string; value: string }[] = [];
  // queue.component.ts
  selectedService: string = ''; // No undefined, usa string vacío

  createdCustomer: any = null;

  constructor(
    private _serviceService: ServiceService,
    private _queueService: QueueService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  addToQueue(): void {
    if (this.selectedService) {
      this._queueService
        .addToQueue(this.selectedService)
        .subscribe((response) => {
          console.log('Customer added to queue:', response);
          this.createdCustomer = response;
        });
    }
  }

  loadServices(): void {
    this._serviceService.getServices().subscribe((services) => {
      this.serviceOptions = services.map((service) => ({
        label: service.name,
        value: service._id,
      }));
    });
  }
}
