import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.jsx";
import NotificationContainer from "./components/NotificationContainer";
import useRoomStore from "./stores/useRoomStore";
import { useEffect } from "react";
import "./style/components/NotificationContainer.css";

function App() {
  const { initWebSocket, disconnectWebSocket } = useRoomStore();
  
  useEffect(() => {
    // Initialize WebSocket when app starts
    initWebSocket();
    
    // Cleanup on app unmount
    return () => {
      disconnectWebSocket();
    };
  }, [initWebSocket, disconnectWebSocket]);
  
  return (
    <>
      <RouterProvider router={router} />
      <NotificationContainer />
    </>
  );
}

export default App;
