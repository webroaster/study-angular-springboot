import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Message {
  id?: number; // IDはバックエンドで生成されるためOptional
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private apiUrl = '/api/messages';

  constructor(private http: HttpClient) { }

  getMessages(): Observable<Message[]> {
    return this.http.get<Message[]>(this.apiUrl);
  }

  // TODO: 新しいメッセージを追加するメソッドを実装してください。
  // POSTリクエストで、Messageオブジェクトを送信します。戻り値は Observable<Message> 型です。
  addMessage(message: Message): Observable<Message> {
    // ここにコードを書いてください
    return new Observable<Message>(); // この行は仮実装です。削除して書き換えてください。
  }

  // TODO: 指定されたIDのメッセージを削除するメソッドを実装してください。
  // DELETEリクエストで、パスにIDを含めます。戻り値は Observable<void> 型です。
  deleteMessage(id: number): Observable<void> {
    // ここにコードを書いてください
    return new Observable<void>(); // この行は仮実装です。削除して書き換えてください。
  }
}