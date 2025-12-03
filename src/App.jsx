import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import SignUp from './pages/register';
import Layout from './pages/layout/Layout';
import Chat from './pages/Chat';
import Interceptor from './interceptors/interceptor';

function App() {
  return (
    <div className="w-full">
      <Routes>
        <Route element={<Interceptor authProtected={false} />}>
          <Route path="/" element={<Login />} />
          <Route path="sign-up" element={<SignUp />} />
        </Route>

        <Route element={<Interceptor authProtected={true} />}>
          <Route path="chat" element={<Layout />}>
            <Route index element={<Navigate to="/chat/new" replace />} />
            <Route path=":conversationId" element={<Chat />} />
            <Route path="new" element={<Chat />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
