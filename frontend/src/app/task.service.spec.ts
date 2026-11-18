import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/tasks';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list', () => {
    it('should call GET /api/tasks', () => {
      const mockTasks = [{ id: 1, title: 'Task 1', done: false }];

      service.list().subscribe(tasks => {
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });
  });

  describe('create', () => {
    it('should call POST /api/tasks with title', () => {
      const mockTask = { id: 1, title: 'New task', done: false };

      service.create('New task').subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ title: 'New task' });
      req.flush(mockTask);
    });
  });

  describe('setDone', () => {
    it('should call PATCH /api/tasks/:id with done', () => {
      const mockTask = { id: 1, title: 'Task', done: true };

      service.setDone(1, true).subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ done: true });
      req.flush(mockTask);
    });
  });

  describe('remove', () => {
    it('should call DELETE /api/tasks/:id', () => {
      service.remove(1).subscribe(() => {
        // expect no return value
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});