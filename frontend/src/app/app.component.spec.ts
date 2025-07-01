import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { HelloService } from './hello.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let helloService: HelloService;

  const mockHelloService = {
    getHelloMessage: () => of('Hello, SpringBoot!') // モックのObservableを返す
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [{ provide: HelloService, useValue: mockHelloService }] // HelloServiceをモックに置き換え
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    helloService = TestBed.inject(HelloService);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch message on init and set title', () => {
    expect(component.title).toBe('loading...');
    fixture.detectChanges(); // ngOnInitをトリガー
    expect(component.title).toBe('Hello, SpringBoot!');
  });

  it('should render title from service', () => {
    fixture.detectChanges(); // ngOnInitをトリガー
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, SpringBoot!');
  });
});
