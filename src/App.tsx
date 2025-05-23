import { ToastContainer } from "react-toastify";
import AppRouter from "./routes/AppRouter";

const App = () => {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  );
};

export default App;
