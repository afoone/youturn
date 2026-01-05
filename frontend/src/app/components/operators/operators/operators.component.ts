import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Operator } from '../../../models/operator.type';
import { OperatorService } from '../../../services/operator.service';

@Component({
  selector: 'afoone-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css'],
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
})
export class OperatorsComponent implements OnInit {
  operators: Operator[] = []; // Almacenará la lista de clientes
  loading: boolean = true; // Indicador para mostrar el loading

  constructor(
    private operatorsService: OperatorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getOperators();
  }

  // Obtener la lista de clientes
  getOperators() {
    this.operatorsService.getOperators().subscribe({
      next: (data) => {
        this.operators = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching enterprises', err);
        this.loading = false;
      },
    });
  }

  // Navegar a la página de edición
  editOperator(id: string) {
    this.router.navigate([`/operators/${id}`]);
  }

  // Navegar al dashboard del operador
  viewOperatorBoard(id: string) {
    this.router.navigate([`/operator-dashboard/${id}`]);
  }

  // Navegar a la página para agregar un nuevo operador
  addOperator() {
    this.router.navigate(['/operators/new']);
  }
}
