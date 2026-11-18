import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Task {
  id: number;
  title: string;
  done: boolean;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/tasks';

  list(): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl);
  }

  create(title: string): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, { title });
  }

  setDone(id: number, done: boolean): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}`, { done });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}