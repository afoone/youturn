import { Component, OnInit } from '@angular/core';
import { OperatorService } from '../../services/operator.service';
import { Operator } from '../../models/operator.type';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';

@Component({
  selector: 'afoone-operator-board',
  imports: [DropdownModule, FormsModule, Button],
  templateUrl: './operator.component.html',
  styleUrls: ['./operator.component.css'],
})
export class OperatorBoardComponent implements OnInit {
  operators: Operator[] = [];

  selectedOperator?: Operator;

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
    // Aquí puedes agregar la lógica para manejar el cambio de operador seleccionado
  }

  nextCustomer(): void {
    if (this.selectedOperator?._id) {
      this.operatorService
        .nextCustomer(this.selectedOperator._id)
        .subscribe((response) => {
          console.log('Next customer response:', response);
          // Aquí puedes agregar la lógica para manejar la respuesta del servidor
        });
    } else {
      console.warn('No operator selected');
    }
  }
}
