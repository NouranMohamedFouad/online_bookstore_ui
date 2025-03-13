import { User } from './../../interfaces/user';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpRequestsService } from '../../services/requests/http-requests.service';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../auth/login/login.service';
@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  selectedSection: string = 'profile';
  isDeleting = false;
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
  constructor(private httpRequestsService: HttpRequestsService, private router: Router,private loginService:LoginService) {}

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
    console.log(this.user);
    if (userId === undefined) {
      console.error('User ID is undefined');
      return;
    }
    const userData = {
      userId: this.user.userId,
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      address: this.user.address,
    };

    this.httpRequestsService.updateUserData(userId, userData).subscribe(
      (response) => {
        console.log('Profile updated successfully:', response);
        alert('Profile updated!');
          localStorage.removeItem('userData');
          localStorage.setItem('userData', JSON.stringify(response));
          window.location.href = "/user-profile";
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
  confirmDelete(){
    this.isDeleting = true;
    const userId = this.user.userId;
    if (userId === undefined) {
      console.error('User ID is undefined');
      this.isDeleting = false;
      return;
    }


    this.httpRequestsService.deleteUser(userId).subscribe({
      next: (response) => {
        console.log('Account deleted successfully:', response);
        localStorage.clear();
        sessionStorage.clear();

        alert('Your account has been deleted.');
      },
      error: (error) => {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again.');
        this.isDeleting = false;
      }
    });
  }
}
