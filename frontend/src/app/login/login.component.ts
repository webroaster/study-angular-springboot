import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private router: Router) {}

  signIn(): void {
    // 認証機能は後で実装するため、現在は単純に画面遷移のみ
    console.log('サインイン処理:', {
      username: this.username,
      password: this.password,
    });

    // Todo管理画面に遷移
    this.router.navigate(['/todos']);
  }
}
