import RootProvider from "./providers/RootProvider";
import AppRouter from "./routing";

function App() {
  return (
    <RootProvider>
      <AppRouter />
    </RootProvider>
  );
}

export default App;
