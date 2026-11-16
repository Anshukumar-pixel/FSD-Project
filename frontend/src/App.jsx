import { useCallback, useEffect, useMemo, useState } from "react";
import { taskApi } from "./api.js";

const statuses = [
  { value: "", label: "All tasks" },
  { value: "TODO", label: "To do" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "DONE", label: "Completed" },
];

const emptyStats = { total: 0, todo: 0, inProgress: 0, done: 0 };
const emptyForm = { title: "", description: "", status: "TODO" };

function formatStatus(status) {
  return statuses.find((item) => item.value === status)?.label ?? status;
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(emptyStats);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [taskList, taskStats] = await Promise.all([
        taskApi.list(filter),
        taskApi.stats(),
      ]);
      setTasks(taskList);
      setStats(taskStats);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completion = useMemo(
    () => (stats.total ? Math.round((stats.done / stats.total) * 100) : 0),
    [stats.done, stats.total],
  );

  function openCreateForm() {
    setEditingTask(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(task) {
    setEditingTask(task);
    setFormOpen(true);
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, form);
      } else {
        await taskApi.create(form);
      }
      setEditingTask(null);
      setForm(emptyForm);
      setFormOpen(false);
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(task) {
    if (!window.confirm(`Delete "${task.title}"? This can't be undone.`)) return;
    setError("");
    try {
      await taskApi.remove(task.id);
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Daymark home">
          <span className="brand-mark">d</span>
          <span>daymark</span>
        </a>
        <span className="topbar-note">A little more focus, every day.</span>
        <button className="button button-dark top-add" onClick={openCreateForm}>
          <span aria-hidden="true">＋</span> New task
        </button>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Make room for <em>good work.</em></h1>
          <p className="welcome-copy">
            Keep the important things moving, one task at a time.
          </p>
        </div>
        <div className="date-chip">
          <span className="date-dot" />
          {new Intl.DateTimeFormat("en", {
            weekday: "long",
            month: "long",
            day: "numeric",
          }).format(new Date())}
        </div>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      <section className="stats-grid" aria-label="Task overview">
        <article className="stat-card stat-total">
          <div className="stat-top"><span>All tasks</span><span className="stat-icon">↗</span></div>
          <strong>{stats.total}</strong>
          <span className="stat-caption">on your list</span>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>To do</span><span className="stat-icon icon-lilac">○</span></div>
          <strong>{stats.todo}</strong>
          <span className="stat-caption">ready when you are</span>
        </article>
        <article className="stat-card">
          <div className="stat-top"><span>In progress</span><span className="stat-icon icon-peach">◷</span></div>
          <strong>{stats.inProgress}</strong>
          <span className="stat-caption">currently underway</span>
        </article>
        <article className="stat-card stat-progress">
          <div className="stat-top"><span>Completed</span><span className="stat-icon icon-green">✓</span></div>
          <strong>{completion}<small>%</small></strong>
          <div className="progress-track" aria-label={`${completion}% of tasks complete`}>
            <span style={{ width: `${completion}%` }} />
          </div>
          <span className="stat-caption">{stats.done} tasks finished</span>
        </article>
      </section>

      <section className="task-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE BIG AND THE SMALL</p>
            <h2>Your tasks <span>{stats.total}</span></h2>
          </div>
          <div className="filter-control">
            <label htmlFor="status-filter">Show</label>
            <select
              id="status-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              {statuses.map((status) => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="empty-state"><span className="loader" /> Loading your tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">✳</span>
            <h3>{filter ? "Nothing in this view" : "A fresh page."}</h3>
            <p>{filter ? "Try another status filter." : "Add a task to get your day moving."}</p>
            {!filter && <button className="button button-outline" onClick={openCreateForm}>Create your first task</button>}
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <article className="task-card" key={task.id}>
                <span className={`status-mark status-${task.status.toLowerCase()}`} aria-hidden="true" />
                <div className="task-main">
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                  <span className={`status-pill pill-${task.status.toLowerCase()}`}>{formatStatus(task.status)}</span>
                </div>
                <div className="task-actions">
                  <button className="icon-button" onClick={() => openEditForm(task)} aria-label={`Edit ${task.title}`}>Edit</button>
                  <button className="icon-button icon-delete" onClick={() => handleDelete(task)} aria-label={`Delete ${task.title}`}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {formOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setEditingTask(null);
            setForm(emptyForm);
            setFormOpen(false);
          }
        }}>
          <section className="task-modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">{editingTask ? "MAKE A CHANGE" : "START SOMEWHERE"}</p>
                <h2 id="form-title">{editingTask ? "Edit task" : "A new task"}</h2>
              </div>
              <button
                className="close-button"
                onClick={() => { setEditingTask(null); setForm(emptyForm); setFormOpen(false); }}
                aria-label="Close form"
              >×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label className="field-label" htmlFor="task-title">Task name</label>
              <input
                id="task-title"
                autoFocus
                maxLength={120}
                required
                placeholder="What needs doing?"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <label className="field-label" htmlFor="task-description">A few details <span>optional</span></label>
              <textarea
                id="task-description"
                maxLength={1000}
                rows={4}
                placeholder="Add a note to future-you…"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
              <label className="field-label" htmlFor="task-status">Status</label>
              <select
                id="task-status"
                value={form.status}
                onChange={(event) => setForm({ ...form, status: event.target.value })}
              >
                {statuses.slice(1).map((status) => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
              <div className="modal-footer">
                <button type="button" className="button button-quiet" onClick={() => { setEditingTask(null); setForm(emptyForm); setFormOpen(false); }}>Cancel</button>
                <button type="submit" className="button button-dark" disabled={saving}>
                  {saving ? "Saving…" : editingTask ? "Save changes" : "Add task"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <footer>Small steps count. Keep going.</footer>
    </main>
  );
}

export default App;
