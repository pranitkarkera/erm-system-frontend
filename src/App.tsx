import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/index";
import { Toaster } from "react-hot-toast";
import { AuthHandler } from "./components/auth/AuthHandler";

function App() {
  return (
    <BrowserRouter>
      <AuthHandler />
      <AppRoutes />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
