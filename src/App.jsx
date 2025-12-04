import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Editor from "./pages/Editor";
import PostPage from "./pages/PostPage";
import MyPosts from "./pages/MyPosts";
import EmailConfirm from "./pages/EmailConfirm";

export default function App() {
  return (
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:id" element={<Editor />} />
          <Route path="/post/:slug" element={<PostPage />} />
          <Route path="/me" element={<MyPosts />} />
          <Route path="/auth/callback" element={<EmailConfirm />} />
        </Routes>
      </main>
    </div>
  );
}
