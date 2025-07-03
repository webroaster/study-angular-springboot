import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

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
  errorMessage: string = '';

  constructor(private userService: UserService, private router: Router) {}

  signIn(): void {
    this.userService
      .getUserByUsernameAndPassword(this.username, this.password)
      .subscribe(
        (user) => {
          if (user && user.status === 'enable') {
            // ユーザーが存在し、ステータスがenableの場合のみ遷移
            this.router.navigate(['/todos']);
          } else {
            // エラー処理: ユーザーが存在しない、またはステータスがenableでない場合
            this.errorMessage =
              'ユーザー名またはパスワードが正しくない、もしくはアカウントが有効ではありません。';
          }
        },
        (error) => {
          this.errorMessage =
            'ユーザー名またはパスワードが正しくない、もしくはアカウントが有効ではありません。';
        }
      );
  }
}
