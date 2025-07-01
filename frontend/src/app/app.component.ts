import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MessageService, Message } from './message.service';
import { FormsModule } from '@angular/forms'; // [(ngModel)] を使うために必要

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  messages: Message[] = [];
  newMessageContent: string = ''; // 新しいメッセージの入力値

  constructor(private messageService: MessageService) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages(): void {
    this.messageService.getMessages().subscribe(messages => {
      this.messages = messages;
    });
  }

  // TODO: 新しいメッセージを追加するメソッドを実装してください。
  // this.newMessageContent を使ってMessageオブジェクトを作成し、MessageServiceのaddMessage()を呼び出します。
  // 成功したら、this.newMessageContent をクリアし、loadMessages() を呼び出してリストを更新します。
  addMessage(): void {
    // ここにコードを書いてください
  }

  // TODO: メッセージを削除するメソッドを実装してください。
  // MessageServiceのdeleteMessage()を呼び出し、成功したら loadMessages() を呼び出してリストを更新します。
  deleteMessage(id: number | undefined): void {
    // ここにコードを書いてください
  }
}