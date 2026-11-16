package com.example.tasktracker.service;

import java.time.Instant;
import java.util.List;

import com.example.tasktracker.dto.TaskRequest;
import com.example.tasktracker.dto.TaskStats;
import com.example.tasktracker.model.Task;
import com.example.tasktracker.model.TaskStatus;
import com.example.tasktracker.repository.TaskRepository;
import org.springframework.stereotype.Service;

@Service
public class TaskService {
    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> findAll(TaskStatus status) {
        if (status != null) {
            return taskRepository.findAllByStatusOrderByUpdatedAtDesc(status);
        }
        return taskRepository.findAllByOrderByUpdatedAtDesc();
    }

    public Task findById(String id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    public Task create(TaskRequest request) {
        Instant now = Instant.now();
        Task task = new Task(
                request.title().trim(),
                request.description() == null ? "" : request.description().trim(),
                request.status() == null ? TaskStatus.TODO : request.status());
        task.setCreatedAt(now);
        task.setUpdatedAt(now);
        return taskRepository.save(task);
    }

    public Task update(String id, TaskRequest request) {
        Task task = findById(id);
        task.setTitle(request.title().trim());
        task.setDescription(request.description() == null ? "" : request.description().trim());
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        task.setUpdatedAt(Instant.now());
        return taskRepository.save(task);
    }

    public void delete(String id) {
        Task task = findById(id);
        taskRepository.delete(task);
    }

    public TaskStats getStats() {
        return new TaskStats(
                taskRepository.count(),
                taskRepository.countByStatus(TaskStatus.TODO),
                taskRepository.countByStatus(TaskStatus.IN_PROGRESS),
                taskRepository.countByStatus(TaskStatus.DONE));
    }
}
