import { RouterProvider } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { Grid } from "@mui/material";
import {
  Outlet,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./App.css";

import MainPage from "./pages/Home";
import QRScanner from "./pages/QRscanner";

const App = () => {
  useEffect(() => {
    document.title = `EIG - QR scanner`;
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <Grid container spacing={6}>
              <MainPage />
            </Grid>
          }
        />

        <Route
          path="qrscanner"
          element={
            <Grid container spacing={12}>
              <Grid item xs={12} md={12} lg={12}>
                <QRScanner />
              </Grid>
            </Grid>
          }
        />
      </Route>
    )
  );

  return (
    <Suspense fallback={<></>}>
      <RouterProvider router={router}>
        <Outlet />
      </RouterProvider>
    </Suspense>
  );
};

const Layout = () => {
  return (
    <div>
      <Header />
      <div className="app">
        <div className="app-content">
          <div className="main">
            <Grid>
              <Outlet />
            </Grid>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  return (
    <div className="header">
      <a
        href="/"
        target="_self"
        rel="noreferrer"
        style={{ textDecoration: "none" }}
      >
        <div className="logo">eig</div>
      </a>
      <div className="header-content"></div>
    </div>
  );
};

export default App;
