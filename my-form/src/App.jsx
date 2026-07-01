import { Routes, Route } from "react-router-dom";
import FormPage from "./pages/FormPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FormPage />} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  );
}
