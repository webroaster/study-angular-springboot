import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GreetService, GreetRequest, GreetResponse } from './greet.service';

describe('GreetService', () => {
  let service: GreetService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GreetService]
    });
    service = TestBed.inject(GreetService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send a name and get a greeting', () => {
    const testName = 'Taro';
    const mockResponse: GreetResponse = { message: 'Hello, Taro!' };

    service.getGreeting(testName).subscribe(response => {
      expect(response.message).toEqual(mockResponse.message);
    });

    const req = httpMock.expectOne('/api/greet');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toEqual(testName);

    req.flush(mockResponse);
  });
});
