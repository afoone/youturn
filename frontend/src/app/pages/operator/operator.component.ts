import { Component, OnInit } from '@angular/core';
import { OperatorService } from '../../services/operator.service';
import { Operator } from '../../models/operator.type';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Customer } from '../../models/customer.type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'afoone-operator-board',
  imports: [DropdownModule, FormsModule, Button, CommonModule],
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css'],
})
export class OperatorBoardComponent implements OnInit {
  operators: Operator[] = [];

  selectedOperator?: Operator;

  selectedCustomer?: Customer;

  waitingRoomPollingInterval: any;

  waitingServices?: { label: string; count: number }[] = [];

  constructor(private operatorService: OperatorService) {}

  ngOnInit(): void {
    this.loadOperators();
  }

  loadOperators(): void {
    this.operatorService.getOperators().subscribe((data) => {
      this.operators = data;
    });
  }

  onOperatorChange(selectedOperator: Operator): void {
    console.log('Selected Operator:', selectedOperator);
    this.initWaitingRoomPolling();
    this.getInServiceCustomer();
  }

  getInServiceCustomer(): void {
    if (this.selectedOperator?._id) {
      this.operatorService
        .getInServiceCustomer(this.selectedOperator._id)
        .subscribe((customer) => {
          this.selectedCustomer = customer;
        });
    }
  }

  initWaitingRoomPolling(): void {
    // Clear any existing interval
    if (this.waitingRoomPollingInterval) {
      clearInterval(this.waitingRoomPollingInterval);
    }
    // Initial fetch TODO: refactor to avoid code duplication
    this._getWaitingRoom();
    this.waitingRoomPollingInterval = setInterval(() => {
      this._getWaitingRoom();
    }, 10000); // Actualiza cada 10 segundos
  }

  _getWaitingRoom(): void {
    if (this.selectedOperator?._id) {
      this.operatorService
        .waitingRoom(this.selectedOperator._id)
        .subscribe((services) => {
          this.waitingServices = services;
        });
    }
  }

  nextCustomer(): void {
    if (this.selectedOperator?._id) {
      this.operatorService
        .nextCustomer(this.selectedOperator._id)
        .subscribe((response) => {
          console.log('Next customer response:', response);
          this.selectedCustomer = response;
        });
    } else {
      console.warn('No operator selected');
    }
  }

  attendCustomer(): void {
    console.log('Attending customer:', this.selectedCustomer?._id);
    if (this.selectedCustomer?._id) {
      this.operatorService
        .attendCustomer(this.selectedCustomer._id)
        .subscribe((response) => {
          console.log('Attend customer response:', response);
          this.selectedCustomer = response;
          this._getWaitingRoom();
        });
    } else {
      console.warn('No customer selected');
    }
  }

  completeService(): void {
    console.log('Completing service for customer:', this.selectedCustomer?._id);
    if (this.selectedCustomer?._id) {
      this.operatorService
        .completeService(this.selectedCustomer._id)
        .subscribe((response) => {
          console.log('Complete service response:', response);
          this.selectedCustomer = response;
        });
    } else {
      console.warn('No customer selected');
    }
    // Aquí puedes agregar la lógica para completar el servicio
  }
}
