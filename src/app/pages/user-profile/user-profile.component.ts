import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpRequestsService } from '../../services/requests/http-requests.service';
import { User } from '../../interfaces/user';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  selectedSection: string = 'profile';
  user: User = {
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      buildingNo: '',
      floorNo: '',
      flatNo: '',
    },
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  constructor(private httpRequestsService:HttpRequestsService) {}

  switchSection(section: string) {
    this.selectedSection = section;
  }
  ngOnInit() {
    try {
      const storedUser = this.httpRequestsService.getUserData();
      console.log("User Data:", storedUser);

      if (storedUser) {
        this.user = {
          ...this.user,
          ...storedUser,
          address: {
            ...this.user.address,
            ...(storedUser.address || {})
          }
        };
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  updateProfile() {
    const userId = this.user.userId;
    if (userId === undefined) {
      console.error('User ID is undefined');
      return;
    }
    const userData = {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      address: this.user.address,
    };

    this.httpRequestsService.updateUserData(userId, userData).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        alert('Profile updated!');
      },
      (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile.');
      }
    );
  }

  updatePassword() {
    const userId = this.user.userId;
    if (userId === undefined) {
      console.error('User ID is undefined');
      return;
    }
    const passwordData = {
      oldPassword: this.user.oldPassword,
      password: this.user.newPassword,
      passwordConfirm: this.user.confirmPassword,
    };

    this.httpRequestsService.updateUserData(userId, passwordData).subscribe(
      (response) => {
        console.log('Password updated successfully:', response);
        alert('Password updated!');
        this.user.oldPassword = '';
        this.user.newPassword = '';
        this.user.confirmPassword = '';
      },
      (error) => {
        console.error('Error updating password:', error);
        alert('Failed to update password.');
      }
    );
  }
}
