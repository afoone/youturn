import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'afoone-service-card',
  imports: [],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.css',
})
export class ServiceCardComponent {
  @Input() service: Service | null = null;
  @Output() selectService = new EventEmitter<Service>();

  onSelectService(): void {
    if (this.service) {
      this.selectService.emit(this.service);
    }
  }
}
