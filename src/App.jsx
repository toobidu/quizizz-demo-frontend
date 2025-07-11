import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index.jsx";
import ModalContainer from "./layouts/ModalContainer";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ModalContainer />
    </>
  );
}

export default App;
