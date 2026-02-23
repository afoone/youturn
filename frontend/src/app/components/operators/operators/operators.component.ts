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
  operators: Operator[] = [];
  loading = true;

  constructor(
    private operatorsService: OperatorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getOperators();
  }

  getOperators() {
    this.operatorsService.getOperators().subscribe({
      next: (data) => {
        this.operators = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching operators', err);
        this.loading = false;
      },
    });
  }

  editOperator(id: string) {
    this.router.navigate([`/operators/${id}`]);
  }

  viewOperatorBoard(id: string) {
    this.router.navigate([`/operator-dashboard/${id}`]);
  }

  addOperator() {
    this.router.navigate(['/operators/new']);
  }
}
