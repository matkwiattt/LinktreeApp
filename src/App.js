import { BrowserRouter, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Home } from "./pages/home";
import { Private } from "./pages/private";
import './App.css';
import { useEffect, useState } from "react";
import PublicProfile from './components/PublicProfile';
import { Puff } from "react-loader-spinner";
import { TailSpin } from "react-loader-spinner";
import { ProgressBar } from "react-loader-spinner";
import { css } from "@emotion/react";
import { BarLoader } from "react-spinners";



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

  const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

if (isFetching) {
  return (
    <div className="loader-container">
      <div className="loader">
        <p>Loading</p>
        <BarLoader
          color="#333" 
          loading={isFetching}
          css={override}
          height={20} 
          width={200}
          radius={50} 
          timeout={5000}
        />
      </div>
    </div>
  );
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
        <Route path="/profile/:username" element={<PublicProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
