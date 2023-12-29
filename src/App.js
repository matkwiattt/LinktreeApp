import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/home";
import { Private } from "./pages/private";
import './App.css';
import SignIn from './components/auth/sign_in';
import SignUp from './components/auth/sign_up';
import AuthDetails from './components/auth/auth_details';
import { useEffect, useState } from "react";

function App() {
  const [user, setUser] = useState(null); 
  const [isFetching, setIsFetching] = useState(true);
  useEffect(()=> {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
          setUser(user);
          setIsFetching(false);
          return;
      }
      setUser(null);
      setIsFetching(false);
    });

    return () => unsubscribe();

  },[]);

if(isFetching){
  return <h2>Loading ... </h2>
}

  return (
    /*<div className='App'>
      <SignIn />
      <SignUp />
      <AuthDetails />
    </div>*/
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={<Home user={user}></Home>}></Route>
        <Route path="/private" element={<ProtectedRoute user={user}><Private></Private></ProtectedRoute>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
