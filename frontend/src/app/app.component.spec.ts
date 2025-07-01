import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MessageService, Message } from './message.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let messageService: MessageService;

  const mockMessages: Message[] = [
    { id: 1, content: 'Mock Message 1' },
    { id: 2, content: 'Mock Message 2' }
  ];

  const mockMessageService = {
    getMessages: () => of(mockMessages)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [{ provide: MessageService, useValue: mockMessageService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService);
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should load messages on init', () => {
    spyOn(messageService, 'getMessages').and.callThrough();
    fixture.detectChanges(); // ngOnInitをトリガー
    expect(messageService.getMessages).toHaveBeenCalled();
    expect(component.messages).toEqual(mockMessages);
  });

  it('should render messages in the template', () => {
    fixture.detectChanges(); // ngOnInitをトリガー
    const compiled = fixture.nativeElement as HTMLElement;
    const listItems = compiled.querySelectorAll('li');
    expect(listItems.length).toBe(mockMessages.length);
    expect(listItems[0].textContent).toContain(mockMessages[0].content);
    expect(listItems[1].textContent).toContain(mockMessages[1].content);
  });
});
