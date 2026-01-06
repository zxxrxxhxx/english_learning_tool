import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import History from "./pages/History";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminEntries from "./pages/admin/Entries";
import AdminHomophones from "./pages/admin/Homophones";
import AdminUsers from "./pages/admin/Users";
import AdminStats from "./pages/admin/Stats";

function Router() {
  return (
    <Switch>
      {/* 用户前端路由 */}
      <Route path={"/"} component={Home} />
      <Route path={"/categories"} component={Categories} />
      <Route path={"/history"} component={History} />
      
      {/* 管理后台路由 */}
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/admin/entries"} component={AdminEntries} />
      <Route path={"/admin/homophones"} component={AdminHomophones} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/stats"} component={AdminStats} />
      
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
