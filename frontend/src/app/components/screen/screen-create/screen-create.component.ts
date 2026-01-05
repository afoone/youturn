import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { Service } from '../../../models/service.model';
import { ServiceService } from '../../../services/service.service';
import { MultiSelect } from 'primeng/multiselect';
import { ScreenService } from '../../../services/screen.service';
import { Screen } from '../../../models/screen.type';

@Component({
  selector: 'afoone-screen-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    MessageModule,
    MultiSelect,
  ],
  templateUrl: './screen-create.component.html',
  styleUrls: ['./screen-create.component.css'],
})
export class ScreenCreateComponent implements OnInit {
  screenForm: FormGroup;

  public availableServices: Service[] = [];

  constructor(
    private fb: FormBuilder,
    private screenService: ScreenService,
    private router: Router,
    private serviceService: ServiceService
  ) {
    this.screenForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      services: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.serviceService.getServices().subscribe({
      next: (services) => (this.availableServices = services),
      error: (error) => console.error('Error loading services:', error),
    });
  }

  onSubmit() {
    if (this.screenForm.invalid) return;

    const screenData: Screen = {
      ...this.screenForm.value,
      id: '',
    };

    this.screenService.createScreen(screenData).subscribe({
      next: () => this.router.navigate(['/enterprises']),
      error: (error) => console.error('Error creating screen:', error),
    });
  }
}
