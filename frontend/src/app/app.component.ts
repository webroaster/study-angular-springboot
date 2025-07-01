import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { GreetService } from './greet.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  greetingMessage: string | null = null;

  constructor(private greetService: GreetService) {}

  // TODO: ボタンがクリックされた時に呼び出されるgreetメソッドを実装してください。
  // GreetServiceのgetGreeting()を呼び出し、返ってきたレスポンスのmessageプロパティを
  // this.greetingMessageにセットします。
  // ヒント: .subscribe() を使ってレスポンスを受け取ります。
  greet(name: string): void {
    // ここにコードを書いてください
  }
}