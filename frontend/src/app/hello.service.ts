import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HelloService {

  private apiUrl = '/api/hello'; // SpringBootのAPIエンドポイント

  constructor(private http: HttpClient) { }

  // TODO: "/api/hello"からメッセージを取得するメソッドを実装してください。
  // ヒント: this.http.get() を使います。戻り値は Observable<string> 型ですが、
  // SpringBootからのレスポンスはプレーンテキストなので、{ responseType: 'text' } オプションが必要です。
  getHelloMessage(): Observable<string> {
    // ここにコードを書いてください
    return new Observable<string>(); // この行は仮実装です。削除して書き換えてください。
  }
}
