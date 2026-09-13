import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";


function ProtectedConsole() {
  const [authenticated, setAuthenticated] = useState(() => typeof window !== "undefined" && localStorage.getItem("aegisnexus.auth") === "demo");
  if (!authenticated) return <Login onSuccess={() => setAuthenticated(true)} />;
  return <Home onLogout={() => { localStorage.removeItem("aegisnexus.auth"); setAuthenticated(false); }} />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={ProtectedConsole} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // Signal Room is intentionally dark: the interface uses semantic cyan, magenta, and amber signals.
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
