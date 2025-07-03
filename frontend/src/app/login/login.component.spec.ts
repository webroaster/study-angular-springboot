import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // Routerサービスのモックを作成（navigateメソッドをスパイ）
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, FormsModule],
      providers: [{ provide: Router, useValue: routerSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  // コンポーネントが正常に作成されることをテスト
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // コンポーネントの初期状態をテスト（ユーザー名とパスワードが空文字列）
  it('should initialize with empty username and password', () => {
    expect(component.username).toBe('');
    expect(component.password).toBe('');
  });

  // サインインボタンクリック時にTodo管理画面に遷移することをテスト
  it('should navigate to todos page when signIn is called', () => {
    component.username = 'testuser';
    component.password = 'testpass';

    component.signIn();

    expect(router.navigate).toHaveBeenCalledWith(['/todos']);
  });

  // サインイン時にコンソールにログが出力されることをテスト
  it('should log sign in information when signIn is called', () => {
    spyOn(console, 'log');
    component.username = 'testuser';
    component.password = 'testpass';

    component.signIn();

    expect(console.log).toHaveBeenCalledWith('サインイン処理:', {
      username: 'testuser',
      password: 'testpass',
    });
  });
});
