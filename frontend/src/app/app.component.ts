import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MessageService, Message } from './message.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  messages: Message[] = [];

  constructor(private messageService: MessageService) {}

  // TODO: コンポーネントが初期化される(ngOnInit)タイミングで、MessageServiceのgetMessages()を呼び出し、
  // 返ってきたメッセージのリストをthis.messagesにセットする処理を実装してください。
  // ヒント: .subscribe() を使って値を受け取ります。
  ngOnInit() {
    // ここにコードを書いてください
  }
}