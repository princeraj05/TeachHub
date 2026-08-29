import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Theme initialization
if (localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

// Auto-recover from dynamic import chunk load failures (Vite deployment cache mismatch)
window.addEventListener("error", (e) => {
  if (e.message && /failed to fetch dynamically imported module|Importing a module script failed|Strict MIME type checking/i.test(e.message)) {
    const isRefreshed = sessionStorage.getItem("chunk_reload_retry");
    if (!isRefreshed) {
      sessionStorage.setItem("chunk_reload_retry", "true");
      window.location.reload();
    }
  }
});

window.addEventListener("unhandledrejection", (e) => {
  const msg = e.reason?.message || String(e.reason || "");
  if (/failed to fetch dynamically imported module|Importing a module script failed|Strict MIME type checking/i.test(msg)) {
    const isRefreshed = sessionStorage.getItem("chunk_reload_retry");
    if (!isRefreshed) {
      sessionStorage.setItem("chunk_reload_retry", "true");
      window.location.reload();
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider><App /></ThemeProvider>
  </StrictMode>,
)
