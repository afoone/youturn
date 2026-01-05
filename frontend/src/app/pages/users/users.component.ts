import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [TableModule, ButtonModule, CommonModule, TooltipModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading: boolean = true;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading = false;
      }
    });
  }

  editUser(id: string): void {
    this.router.navigate([`/users/${id}`]);
  }

  addUser(): void {
    this.router.navigate(['/users/new']);
  }

  deleteUser(id: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.getUsers(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error deleting user:', err);
        }
      });
    }
  }

  getEnterpriseName(enterprise: any): string {
    if (!enterprise) return '-';
    if (typeof enterprise === 'string') return enterprise;
    return enterprise.name || enterprise._id || 'N/A';
  }
}

