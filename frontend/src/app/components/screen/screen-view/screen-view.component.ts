import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table'; // Importar el módulo de tabla de PrimeNG
import { ButtonModule } from 'primeng/button';

import { ScreenService } from '../../../services/screen.service';
import { Screen } from '../../../models/screen.type';

@Component({
  selector: 'afoone-screens',
  templateUrl: './screen-view.component.html',
  styleUrls: ['./screen-view.component.css'],
  imports: [TableModule, ButtonModule],
})
export class ScreenViewComponent implements OnInit {
  screen?: Screen;
  loading: boolean = true; // Indicador para mostrar el loading

  constructor(
    private screensService: ScreenService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // get screen id from route params
    this.route.paramMap.subscribe((params) => {
      const screenId = params.get('id');
      this.getScreen(screenId!);
    });
  }

  getScreen(id: string) {
    this.screensService.getScreenById(id).subscribe({
      next: (data) => {
        this.screen = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching screen', err);
        this.loading = false;
      },
    });
  }
}
