import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import WhiteboardPage from "./pages/WhiteboardPage";
import ResourcesTimelinePage from "./pages/ResourcesTimelinePage";
import AICommsPage from "./pages/AICommsPage";
import ExecutiveDashboardPage from "./pages/ExecutiveDashboardPage";
import ArchitecturePage from "./pages/ArchitecturePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <WhiteboardPage /> },
      { path: "resources", element: <ResourcesTimelinePage /> },
      { path: "ai-comms", element: <AICommsPage /> },
      { path: "executive", element: <ExecutiveDashboardPage /> },
      { path: "architecture", element: <ArchitecturePage /> },
    ],
  },
]);
