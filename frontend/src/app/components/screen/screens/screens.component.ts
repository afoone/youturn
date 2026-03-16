import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SidebarModule } from 'primeng/sidebar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { MultiSelect } from 'primeng/multiselect';

import { ScreenService } from '../../../services/screen.service';
import { Screen } from '../../../models/screen.type';
import { Service } from '../../../models/service.model';
import { ServiceService } from '../../../services/service.service';

@Component({
  selector: 'afoone-screens',
  templateUrl: './screens.component.html',
  styleUrls: ['./screens.component.css'],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TooltipModule,
    SidebarModule,
    ReactiveFormsModule,
    InputTextModule,
    MessageModule,
    MultiSelect,
  ],
})
export class ScreensComponent implements OnInit {
  screens: Screen[] = []; // Almacenará la lista de pantallas
  loading: boolean = true; // Indicador para mostrar el loading
  sidebarVisible: boolean = false; // Controla la visibilidad del sidebar
  screenForm: FormGroup;
  availableServices: Service[] = [];
  errorMessage: string = '';

  constructor(
    private screensService: ScreenService,
    private router: Router,
    private fb: FormBuilder,
    private serviceService: ServiceService
  ) {
    this.screenForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      services: [[], Validators.required],
    });
  }

  ngOnInit(): void {
    this.getScreens();
    this.loadServices();
  }

  loadServices(): void {
    this.serviceService.getServices().subscribe({
      next: (services) => (this.availableServices = services),
      error: (error) => console.error('Error loading services:', error),
    });
  }

  // Obtener la lista de clientes
  getScreens() {
    this.screensService.getScreens().subscribe({
      next: (data) => {
        this.screens = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching screens', err);
        this.loading = false;
      },
    });
  }

  // Navegar a la página de edición
  editScreen(id: string) {
    this.router.navigate([`/screens/${id}`]);
  }

  // Navegar a la página de visualización
  viewScreen(id: string) {
    this.router.navigate([`/screens/${id}/view`]);
  }

  // Abrir el sidebar para crear una nueva pantalla
  addScreen() {
    this.screenForm.reset();
    this.errorMessage = '';
    this.sidebarVisible = true;
  }

  // Cerrar el sidebar
  closeSidebar() {
    this.sidebarVisible = false;
    this.screenForm.reset();
    this.errorMessage = '';
  }

  // Enviar el formulario
  onSubmitScreen(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.screenForm.invalid) {
      this.errorMessage = 'Por favor, completa todos los campos requeridos';
      return;
    }

    const screenData: Screen = {
      ...this.screenForm.value,
      id: '',
    };

    this.screensService.createScreen(screenData).subscribe({
      next: () => {
        this.closeSidebar();
        this.getScreens(); // Recargar la lista
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Error al crear la pantalla';
        console.error('Error creating screen:', error);
      },
    });
  }
}
