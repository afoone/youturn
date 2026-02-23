import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ScreenService } from '../../../services/screen.service';
import { Screen } from '../../../models/screen.type';

@Component({
  selector: 'afoone-screens',
  templateUrl: './screens.component.html',
  styleUrls: ['./screens.component.css'],
  imports: [CommonModule, TableModule, ButtonModule, TooltipModule],
})
export class ScreensComponent implements OnInit {
  screens: Screen[] = [];
  loading = true;

  constructor(private screensService: ScreenService, private router: Router) {}

  ngOnInit(): void {
    this.getScreens();
  }

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

  editScreen(id: string) {
    this.router.navigate([`/screens/${id}`]);
  }

  viewScreen(id: string) {
    this.router.navigate([`/screens/${id}/view`]);
  }

  addScreen() {
    this.router.navigate(['/screens/new']);
  }
}
