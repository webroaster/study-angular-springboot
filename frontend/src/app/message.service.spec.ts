import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MessageService, Message } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MessageService]
    });
    service = TestBed.inject(MessageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve messages from the API via GET', () => {
    const mockMessages: Message[] = [
      { id: 1, content: 'Test Message 1' },
      { id: 2, content: 'Test Message 2' }
    ];

    service.getMessages().subscribe(messages => {
      expect(messages.length).toBe(2);
      expect(messages).toEqual(mockMessages);
    });

    const req = httpMock.expectOne('/api/messages');
    expect(req.request.method).toBe('GET');
    req.flush(mockMessages);
  });
});
