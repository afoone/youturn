import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
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
  canCreate: boolean = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // #region agent log
    console.log('[DEBUG] UsersComponent.ngOnInit called');
    // #endregion
    
    // Subscribe to currentUser$ to update permissions
    this.authService.currentUser$.subscribe(user => {
      // #region agent log
      console.log('[DEBUG] currentUser$ emitted:', { user: user?.email, admin: user?.admin, roles: user?.roles });
      // #endregion
      
      // Update canCreate based on user permissions
      // If user can access this page (via userManagementGuard), they can create users
      // The guard already ensures only admin or ENTERPRISE_ADMIN can access this page
      this.canCreate = user?.admin === true || (user?.roles?.includes('ENTERPRISE_ADMIN') ?? false);
      
      // #region agent log
      console.log('[DEBUG] Permissions check:', { isAdmin: user?.admin, isEnterpriseAdmin: user?.roles?.includes('ENTERPRISE_ADMIN'), canCreate: this.canCreate });
      try {
        fetch('http://127.0.0.1:7244/ingest/978b0113-0d0e-4cef-9216-986136378b2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.component.ts:38',message:'UsersComponent - check permissions',data:{isAdmin:user?.admin,isEnterpriseAdmin:user?.roles?.includes('ENTERPRISE_ADMIN'),canCreate:this.canCreate,userRoles:user?.roles||[],userEmail:user?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(err => console.error('[DEBUG] Log fetch error:', err));
      } catch (e) {
        console.error('[DEBUG] Log send error:', e);
      }
      // #endregion
    });
    
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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/978b0113-0d0e-4cef-9216-986136378b2d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'users.component.ts:58',message:'addUser called',data:{canCreate:this.canCreate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
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

