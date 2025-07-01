import { TestBed, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MessageService, Message } from './message.service';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;
  let messageService: MessageService;

  const mockMessages: Message[] = [
    { id: 1, content: 'Mock Message 1' },
    { id: 2, content: 'Mock Message 2' }
  ];

  const mockMessageService = {
    getMessages: () => of(mockMessages),
    addMessage: (message: Message) => of({ ...message, id: 3 } as Message),
    deleteMessage: (id: number) => of(void 0) // void 0 は undefined と同じ
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule, FormsModule],
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

  it('should add a message', () => {
    spyOn(messageService, 'addMessage').and.callThrough();
    spyOn(component, 'loadMessages'); // loadMessagesが呼ばれることを確認するため

    component.newMessageContent = 'New Test Message';
    component.addMessage();

    expect(messageService.addMessage).toHaveBeenCalledWith({ content: 'New Test Message' });
    expect(component.newMessageContent).toBe('');
    expect(component.loadMessages).toHaveBeenCalled();
  });

  it('should delete a message', () => {
    spyOn(messageService, 'deleteMessage').and.callThrough();
    spyOn(component, 'loadMessages'); // loadMessagesが呼ばれることを確認するため

    const messageToDeleteId = 1;
    component.deleteMessage(messageToDeleteId);

    expect(messageService.deleteMessage).toHaveBeenCalledWith(messageToDeleteId);
    expect(component.loadMessages).toHaveBeenCalled();
  });

  it('should render messages with delete buttons', () => {
    fixture.detectChanges(); // ngOnInitをトリガー
    const compiled = fixture.nativeElement as HTMLElement;
    const listItems = compiled.querySelectorAll('li');
    expect(listItems.length).toBe(mockMessages.length);
    expect(listItems[0].querySelector('button')?.textContent).toContain('Delete');
  });
});