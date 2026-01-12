import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Service } from '../../../models/service.model';

@Component({
  selector: 'afoone-service-card',
  imports: [CommonModule],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.css',
})
export class ServiceCardComponent {
  @Input() service: Service | null = null;
  @Input() isPriority: boolean = false;
  @Output() selectService = new EventEmitter<Service>();

  onSelectService(): void {
    if (this.service) {
      this.selectService.emit(this.service);
    }
  }
}
