"use strict";

/* ---------- Shared: nav, year, active link ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const menuBtn = document.getElementById("menuBtn");
  const nav = document.getElementById("mainNav");
  menuBtn.addEventListener("click", function () {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });

  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a").forEach(function (link) {
    if (link.getAttribute("href") === current) link.setAttribute("aria-current", "page");
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  showGreeting();
  if (document.getElementById("taskForm")) initPlanner();
  if (document.getElementById("contactForm")) initContactForm();
});

/* ---------- Homepage: greeting based on time of day ---------- */
function showGreeting() {
  const el = document.getElementById("greeting");
  if (!el) return;
  const hour = new Date().getHours();
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  el.textContent = "Good " + part + ", and welcome";
}

/* ---------- Academic planner ---------- */
function initPlanner() {
  const form = document.getElementById("taskForm");
  const input = document.getElementById("taskInput");
  const dateInput = document.getElementById("taskDate");
  const list = document.getElementById("taskList");
  const error = document.getElementById("taskError");
  const count = document.getElementById("taskCount");
  let tasks = loadTasks();

  function loadTasks() {
    try { return JSON.parse(localStorage.getItem("plannerTasks")) || []; }
    catch (e) { return []; }
  }
  function saveTasks() {
    try { localStorage.setItem("plannerTasks", JSON.stringify(tasks)); } catch (e) {}
  }

  function render() {
    list.innerHTML = "";
    const today = new Date().toISOString().slice(0, 10);
    tasks.forEach(function (task) {
      const li = document.createElement("li");
      if (task.done) li.classList.add("done");
      if (task.due && task.due < today && !task.done) li.classList.add("overdue");

      const box = document.createElement("input");
      box.type = "checkbox";
      box.checked = task.done;
      box.setAttribute("aria-label", "Mark " + task.text + " as completed");
      box.addEventListener("change", function () { toggleTask(task.id); });

      const label = document.createElement("span");
      label.className = "label";
      const title = document.createElement("strong");
      title.textContent = task.text;
      label.appendChild(title);
      if (task.due) {
        const small = document.createElement("small");
        small.textContent = "Due " + task.due;
        label.appendChild(small);
      }

      const del = document.createElement("button");
      del.className = "del";
      del.type = "button";
      del.textContent = "Delete";
      del.setAttribute("aria-label", "Delete " + task.text);
      del.addEventListener("click", function () { deleteTask(task.id); });

      li.append(box, label, del);
      list.appendChild(li);
    });
    const left = tasks.filter(function (t) { return !t.done; }).length;
    count.textContent = tasks.length === 0
      ? "No tasks yet. Add your first one above."
      : left + " of " + tasks.length + " tasks still to do";
  }

  function addTask(text, due) {
    tasks.push({ id: Date.now(), text: text, due: due, done: false });
    saveTasks(); render();
  }
  function toggleTask(id) {
    tasks = tasks.map(function (t) { return t.id === id ? Object.assign({}, t, { done: !t.done }) : t; });
    saveTasks(); render();
  }
  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks(); render();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = input.value.trim();
    if (text === "") {
      error.textContent = "Enter a task before adding it.";
      input.focus();
      return;
    }
    error.textContent = "";
    addTask(text, dateInput.value);
    form.reset();
    input.focus();
  });

  render();
}

/* ---------- Contact form validation ---------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");

  function setError(id, msg) {
    const field = document.getElementById(id);
    document.getElementById(id + "Error").textContent = msg;
    field.parentElement.classList.toggle("invalid", msg !== "");
    return msg === "";
  }

  function validate() {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const message = form.message.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const results = [];

    results.push(setError("name", name === "" ? "Enter your name." : ""));
    results.push(setError("email",
      email === "" ? "Enter your email address." :
      !emailPattern.test(email) ? "Enter a valid email, like name@example.com." : ""));
    results.push(setError("phone",
      phone === "" ? "Enter your phone number." :
      !/^\d+$/.test(phone) ? "Use digits only, with no spaces, dashes or + sign." : ""));
    results.push(setError("message", message === "" ? "Write a message." : ""));

    return results.every(Boolean);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    success.textContent = "";
    if (validate()) {
      success.textContent = "Thanks, " + form.name.value.trim() + ". Your message has been sent.";
      form.reset();
    }
  });

  form.addEventListener("input", function () { success.textContent = ""; });
}
