package com.example.tasktracker.repository;

import java.util.List;

import com.example.tasktracker.model.Task;
import com.example.tasktracker.model.TaskStatus;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findAllByOrderByUpdatedAtDesc();
    List<Task> findAllByStatusOrderByUpdatedAtDesc(TaskStatus status);
    long countByStatus(TaskStatus status);
}
