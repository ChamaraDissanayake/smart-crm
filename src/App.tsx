import { ToastContainer } from "react-toastify";
import AppRouter from "./routes/AppRouter";
import ChatFAB from "./components/chatBot/ChatFAB";

const App = () => {
  return (
    <>
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <ChatFAB />
    </>
  );
};

export default App;
