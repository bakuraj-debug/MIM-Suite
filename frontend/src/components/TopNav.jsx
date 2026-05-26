import { NavLink } from "react-router-dom";

const links = [
  ["/", "MIM Whiteboard"],
  ["/resources", "Resources & Timeline"],
  ["/ai-comms", "AI Insights & Communications"],
  ["/executive", "Executive Dashboard"],
  ["/architecture", "Architecture / Integration Status"],
];

export default function TopNav() {
  return (
    <header className="bg-brand-700 text-white px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold tracking-wide">PEPSICO AI OPS · MIM SUITE</h1>
        <div className="text-xs opacity-90">Real-time Major Incident Command Center</div>
      </div>
      <nav className="mt-3 flex flex-wrap gap-2 text-sm">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className={({ isActive }) => `px-3 py-1 rounded ${isActive ? "bg-white text-brand-700" : "bg-brand-600"}`}>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
