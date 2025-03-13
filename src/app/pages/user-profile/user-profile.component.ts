  import { User } from './../../interfaces/user';
  import { Component } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { RouterModule, Router } from '@angular/router';
  import { HttpRequestsService } from '../../services/requests/http-requests.service';
  import { FormsModule } from '@angular/forms';
  import { ChangeDetectorRef } from '@angular/core';
  import { CryptoHelper } from '../../helper/crypto-helper';

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

    validationErrors: { [key: string]: string } = {};

    constructor(private httpRequestsService: HttpRequestsService, private router: Router,private cdr: ChangeDetectorRef) {}

    switchSection(section: string) {
      this.selectedSection = section;
      this.validationErrors = {};
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

    validateForm(): boolean {
      this.validationErrors = {};

    if (!this.user.name || this.user.name.length < 3 || this.user.name.length > 50 || !/^[A-Za-z\s]+$/.test(this.user.name)) {
      this.validationErrors['name'] = "Name must be between 3-50 characters and contain only letters and spaces.";
    }

    if (!this.user.phone || !/^\d{7,15}$/.test(this.user.phone)) {
      this.validationErrors['phone'] = "Phone must be between 7:15 digits.";
    }

    if (!this.user.address.street || this.user.address.street.length < 3) {
      this.validationErrors['street'] = "Street must be at least 3 characters long.";
    }
    if (!this.user.address.city || !/^[A-Za-z\s]+$/.test(this.user.address.city)) {
      this.validationErrors['city'] = "City should contain only letters and spaces.";
    }
    if (!this.user.address.buildingNo || !/^\d+$/.test(this.user.address.buildingNo)) {
      this.validationErrors['buildingNo'] = "Building Number must contain only numbers.";
    }
    if (!this.user.address.floorNo || !/^\d+$/.test(this.user.address.floorNo)) {
      this.validationErrors['floorNo'] = "Floor Number must contain only numbers.";
    }
    if (!this.user.address.flatNo || !/^\d+$/.test(this.user.address.flatNo)) {
      this.validationErrors['flatNo'] = "Flat Number must contain only numbers.";
    }

    if (this.user.newPassword || this.user.confirmPassword) {
      if (!this.user.oldPassword) {
        this.validationErrors['oldPassword'] = "Old password is required.";
      }
      if (!this.user.newPassword || this.user.newPassword.length < 8 || !/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/.test(this.user.newPassword)) {
        this.validationErrors['newPassword'] = "Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character.";
      }
      if (this.user.newPassword !== this.user.confirmPassword) {
        this.validationErrors['confirmPassword'] = "Passwords do not match.";
      }
    }
    console.log(this.validationErrors);
    this.cdr.detectChanges();
    return Object.keys(this.validationErrors).length === 0;
}

    updateProfile() {
      if (!this.validateForm()) {
        console.error('Validation failed:', this.validationErrors);
        return;
      }

      const userId = this.user.userId;
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
          localStorage.setItem('userData', CryptoHelper.encrypt(JSON.stringify(response)));
          window.location.href = "/user-profile";
        },
        (error) => {
          console.error('Error updating profile:', error);
          alert('Failed to update profile.');
        }
      );
    }

    updatePassword() {
      if (!this.validateForm()) {
        console.error('Validation failed:', this.validationErrors);
        return;
      }

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

    confirmDelete() {
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
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          alert('Failed to delete account. Please try again.');
          this.isDeleting = false;
        }
      });
    }
  }
