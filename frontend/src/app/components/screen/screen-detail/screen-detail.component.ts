import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperatorService } from '../../../services/operator.service';
import { Operator } from '../../../models/operator.type';

@Component({
  selector: 'afoone-enterprise-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './screen-detail.component.html',
  styleUrls: ['./screen-detail.component.css'],
})
export class OperatorDetailComponent implements OnInit {
  operatorForm!: FormGroup;
  operatorId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private operatorService: OperatorService
  ) {}

  ngOnInit(): void {
    this.operatorId = this.route.snapshot.paramMap.get('id') || '';

    this.operatorForm = this.fb.group({
      positionName: ['', Validators.required],
      description: [''],
      services: [[]],
      pathDescription: [''],
    });

    if (this.operatorId !== 'new') {
      this.operatorService.getOperatorById(this.operatorId).subscribe({
        next: (data) => this.operatorForm.patchValue(data),
        error: (err) => console.error('Error fetching operator:', err),
      });
    }
  }

  onSubmit() {
    if (this.operatorForm.invalid) return;

    const updatedOperator: Operator = {
      id: this.operatorId,
      ...this.operatorForm.value,
    };

    this.operatorService.updateOperator(updatedOperator).subscribe({
      next: () => this.router.navigate(['/operators']),
      error: (err) => console.error('Error updating operator:', err),
    });
  }

  onCancel() {
    this.router.navigate(['/screens']);
  }
}
