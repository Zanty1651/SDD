import { Component, signal, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TaskService, Task } from './task.service';

@Component({
  imports: [],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly title = signal('TodoLite');
  protected readonly apiStatus = signal<string>('checking...');
  protected readonly tasks = signal<Task[]>([]);
  protected readonly newTaskTitle = signal('');
  private readonly http = inject(HttpClient);
  private readonly taskService = inject(TaskService);

  ngOnInit() {
    this.checkApi();
    this.loadTasks();
  }

  private checkApi() {
    this.http.get<{ status: string }>('http://localhost:3000/api/health').subscribe({
      next: (res) => this.apiStatus.set(`API: ${res.status}`),
      error: () => this.apiStatus.set('API: error'),
    });
  }

  private loadTasks() {
    this.taskService.list().subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => this.apiStatus.set('API: error'),
    });
  }

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    this.taskService.create(title).subscribe({
      next: (task) => {
        this.tasks.update(tasks => [...tasks, task]);
        this.newTaskTitle.set('');
      },
      error: () => this.apiStatus.set('API: error'),
    });
  }

  toggleTask(task: Task) {
    this.taskService.setDone(task.id, !task.done).subscribe({
      next: (updated) => {
        this.tasks.update(tasks =>
          tasks.map(t => t.id === updated.id ? updated : t)
        );
      },
      error: () => this.apiStatus.set('API: error'),
    });
  }

  deleteTask(id: number) {
    this.taskService.remove(id).subscribe({
      next: () => {
        this.tasks.update(tasks => tasks.filter(t => t.id !== id));
      },
      error: () => this.apiStatus.set('API: error'),
    });
  }
}