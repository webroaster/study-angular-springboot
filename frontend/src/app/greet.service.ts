import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// バックエンドのDTOに対応するinterfaceを定義
export interface GreetRequest {
  name: string;
}

export interface GreetResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class GreetService {
  private apiUrl = '/api/greet';

  constructor(private http: HttpClient) {}

  // TODO: 名前(string) を受け取り、GreetRequestオブジェクトを作成して "/api/greet" にPOSTリクエストを送信するメソッドを実装してください。
  // ヒント: this.http.post<GreetResponse>(...) を使います。第二引数がリクエストボディです。
  // 戻り値は Observable<GreetResponse> 型です。
  getGreeting(name: string): Observable<GreetResponse> {
    // ここにコードを書いてください
    const request: GreetRequest = { name };
    return this.http.post<GreetResponse>(this.apiUrl, request);
  }
}
