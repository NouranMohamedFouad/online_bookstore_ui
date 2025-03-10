import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  selectedSection: string = 'profile';

  constructor(
  ) {}

  switchSection(section: string) {
    this.selectedSection = section;
  }

}
