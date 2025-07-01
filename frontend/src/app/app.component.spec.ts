import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { GreetService, GreetResponse } from './greet.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let greetService: GreetService;

  const mockGreetService = {
    getGreeting: (name: string) => of({ message: `Hello, ${name}!` } as GreetResponse)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [{ provide: GreetService, useValue: mockGreetService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    greetService = TestBed.inject(GreetService);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should call greet service and set message on greet()', () => {
    const testName = 'Taro';
    spyOn(greetService, 'getGreeting').and.callThrough();

    component.greet(testName);

    expect(greetService.getGreeting).toHaveBeenCalledWith(testName);
    expect(component.greetingMessage).toBe(`Hello, ${testName}!`);
  });

  it('should display the greeting message in the template', () => {
    const testName = 'Jiro';
    component.greet(testName);

    fixture.detectChanges(); // ビューを更新

    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent).toContain(`Hello, ${testName}!`);
  });
});