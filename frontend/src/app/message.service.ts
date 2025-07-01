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

  // TODO: "/api/messages" からメッセージのリストを取得するメソッドを実装してください。
  // ヒント: this.http.get<Message[]>() を使います。戻り値は Observable<Message[]> 型です。
  getMessages(): Observable<Message[]> {
    // ここにコードを書いてください
    return new Observable<Message[]>(); // この行は仮実装です。削除して書き換えてください。
  }
}
