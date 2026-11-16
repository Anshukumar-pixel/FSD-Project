const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const taskApi = {
  list: (status) => request(`/tasks${status ? `?status=${status}` : ""}`),
  stats: () => request("/tasks/stats"),
  create: (task) =>
    request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  update: (id, task) =>
    request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(task) }),
  remove: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
};
