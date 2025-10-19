"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/adminLogin", form);
      if (response.data.success) {
        toast.success("Logged in successfully");
        router.push("/dashboard");
      } else {
        setErrorMessage(response.data.message || "Login failed");
      }
    } catch (error) {
      setErrorMessage("Something went wrong");
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="w-[90%] sm:w-[55%] md:w-[65%] lg:w-[30%] bg-white p-7 md:p-10 max-h-fit rounded-2xl shadow-lg">
        <form onSubmit={handleSubmit}>
          <h1 className="text-center text-[#784E9A] text-3xl font-semibold custom-font">
            Admin Login
          </h1>
          <hr className="text-blue-400 mt-4" />

          <div className="mt-4">
            <label htmlFor="email" className="font-semibold">Email</label>
            <input
              type="text"
              id="email"
              required
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="p-2 mt-1 rounded border-none bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="password" className="font-semibold">Password</label>
            <input
              type="password"
              id="password"
              required
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="p-2 mt-1 rounded border-none bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
            />
          </div>

          {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}

          <div className="mt-6">
            <button className="bg-blue-500 text-white w-full p-2 rounded-md hover:bg-blue-600 font-semibold">
              Login
            </button>
            <p className="mt-2">
              Don't have an account?{" "}
              <Link href="/signup">
                <u className="text-blue-500 hover:text-blue-600">Signup</u>
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
