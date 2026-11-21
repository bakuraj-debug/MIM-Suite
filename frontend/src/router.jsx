import { createHashRouter } from "react-router-dom";
import Layout from "./components/Layout";
import CockpitPage from "./pages/CockpitPage";
import AdminLayout from "./pages/admin/AdminLayout";
import ConnectorsPage from "./pages/admin/ConnectorsPage";
import ConnectorForm from "./pages/admin/ConnectorForm";
import BindingsPage from "./pages/admin/BindingsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import { Navigate } from "react-router-dom";

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <CockpitPage /> },
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="connectors" replace /> },
          { path: "connectors", element: <ConnectorsPage /> },
          { path: "connectors/:id", element: <ConnectorForm /> },
          { path: "bindings", element: <BindingsPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
