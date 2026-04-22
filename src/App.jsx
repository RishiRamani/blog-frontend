import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Editor from "./pages/Editor";
import PostPage from "./pages/PostPage";
import MyPosts from "./pages/MyPosts";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 pt-16">
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
        </Routes>
      </main>
    </div>
  );
}
