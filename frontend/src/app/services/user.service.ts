import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id?: number;
  username: string;
  displayName: string;
  password: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserByUsernameAndPassword(
    username: string,
    password: string
  ): Observable<User> {
    return this.http.get<User>(
      `${this.apiUrl}?username=${username}&password=${password}`
    );
  }

  addUser(todo: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, todo);
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
