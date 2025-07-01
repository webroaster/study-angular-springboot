import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HelloService } from './hello.service';

describe('HelloService', () => {
  let service: HelloService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HelloService]
    });
    service = TestBed.inject(HelloService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // すべてのリクエストが処理されたことを確認
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch hello message from the API via GET', () => {
    const mockMsg = "Hello, SpringBoot!";

    service.getHelloMessage().subscribe(msg => {
      expect(msg).toEqual(mockMsg);
    });

    const req = httpMock.expectOne('/api/hello');
    expect(req.request.method).toBe('GET');
    req.flush(mockMsg);
  });
});
