import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../auth/login/login.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  userName = '';

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    // Subscribe to authentication state changes
    this.loginService.currentUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.userName = user?.name || '';
    });
  }

  logout(): void {
    this.loginService.logout();
  }
}
