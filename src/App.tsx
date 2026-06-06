import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Dashboard from "@/pages/Dashboard";
import Apply from "@/pages/insurance/Apply";
import Policies from "@/pages/insurance/Policies";
import Tasks from "@/pages/flight/Tasks";
import Report from "@/pages/accident/Report";
import Materials from "@/pages/accident/Materials";
import Survey from "@/pages/claims/Survey";
import Progress from "@/pages/claims/Progress";
import Statistics from "@/pages/statistics/Index";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="insurance/apply" element={<Apply />} />
          <Route path="insurance/policies" element={<Policies />} />
          <Route path="flight/tasks" element={<Tasks />} />
          <Route path="accident/report" element={<Report />} />
          <Route path="accident/materials" element={<Materials />} />
          <Route path="claims/survey" element={<Survey />} />
          <Route path="claims/progress" element={<Progress />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
      </Routes>
    </Router>
  );
}
