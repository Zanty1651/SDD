import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { App } from './app';
import { TaskService } from './task.service';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TaskService
      ]
    })
      .compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title "TodoLite"', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // Handle the HTTP call to /api/health
    const healthReq = httpMock.expectOne('http://localhost:3000/api/health');
    expect(healthReq.request.method).toBe('GET');
    healthReq.flush({ status: 'ok' });

    // Handle the HTTP call to /api/tasks (from loadTasks)
    const tasksReq = httpMock.expectOne('http://localhost:3000/api/tasks');
    expect(tasksReq.request.method).toBe('GET');
    tasksReq.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('TodoLite');
  });

  it('should show API status after health check', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const healthReq = httpMock.expectOne('http://localhost:3000/api/health');
    healthReq.flush({ status: 'ok' });

    const tasksReq = httpMock.expectOne('http://localhost:3000/api/tasks');
    tasksReq.flush([]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('API: ok');
  });

  it('should not call create when title is empty', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const healthReq = httpMock.expectOne('http://localhost:3000/api/health');
    healthReq.flush({ status: 'ok' });

    const tasksReq = httpMock.expectOne('http://localhost:3000/api/tasks');
    tasksReq.flush([]);

    fixture.detectChanges();

    // Try to add empty task
    const input = fixture.nativeElement.querySelector('input');
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    // Should not have made any POST request to /api/tasks
    httpMock.expectNone('http://localhost:3000/api/tasks');
  });
});