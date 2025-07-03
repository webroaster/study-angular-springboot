import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, UserService } from '../services/user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  newUsername: string = '';
  newDisplayName: string = '';
  newStatus: string = '';
  newPassword: string = '';

  editingUser: User | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe((users) => {
      this.users = users;
    });
  }

  addUser(): void {
    const newUser: User = {
      username: this.newUsername,
      displayName: this.newDisplayName,
      password: this.newPassword,
      status: this.newStatus,
    };
    this.userService.addUser(newUser).subscribe(() => {
      this.newUsername = '';
      this.newDisplayName = '';
      this.newPassword = '';
      this.newStatus = '';
      this.loadUsers();
    });
  }

  editUser(user: User): void {
    this.editingUser = { ...user };
  }

  updateUser(): void {
    const updateUser: User = {
      id: this.editingUser?.id,
      username: this.editingUser?.username ?? '',
      displayName: this.editingUser?.displayName ?? '',
      password: this.editingUser?.password ?? 'default_password!123',
      status: this.editingUser?.status ?? 'enable',
    };
    this.userService.updateUser(updateUser).subscribe(() => {
      this.editingUser = null;
      this.loadUsers();
    });
  }

  deleteUser(id: number | undefined): void {
    if (id) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }
}
