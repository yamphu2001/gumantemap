"use client";
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { ref, push, onValue } from "firebase/database";

export default function AddQrPage() {
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    location: "",
    type: "",
    points: "",
    picture: "",
    description: "",
    status: "Active",
  });

  const [categories, setCategories] = useState([]); // for dropdown
  const [message, setMessage] = useState("");

  // Fetch categories from Firebase
  useEffect(() => {
    const categoriesRef = ref(db, "Categories");
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const catArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setCategories(catArray);
      } else {
        setCategories([]);
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.type) {
      setMessage("Please select a category.");
      return;
    }

    try {
      const timestamp = Date.now();
      await push(ref(db, "QR-Data"), { ...form, timestamp });
      setMessage("QR Code added successfully!");
      setForm({
        name: "",
        latitude: "",
        longitude: "",
        type: "",
        points: "",
        picture: "",
        description: "",
        status: "Active",
      });
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Error adding QR code.");
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Add QR Code</h1>

      {message && (
        <p className="mb-4 text-green-600 text-center font-semibold">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow space-y-4"
      >
        <div>
          <label className="font-semibold">QR Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 mt-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="font-semibold">Latitude</label>
            <input
              type="text"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              className="w-full p-2 mt-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <div className="w-1/2">
            <label className="font-semibold">Longitude</label>
            <input
              type="text"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              className="w-full p-2 mt-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold">Location Area</label>
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full p-2 mt-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="font-semibold">Type</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-2 mt-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div className="w-1/2">
            <label className="font-semibold">Points</label>
            <input
              type="number"
              name="points"
              value={form.points}
              onChange={handleChange}
              className="w-full p-2 mt-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold">Picture URL</label>
          <input
            type="url"
            name="picture"
            value={form.picture}
            onChange={handleChange}
            className="w-full p-2 mt-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div>
          <label className="font-semibold">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full p-2 mt-1 rounded bg-slate-100 focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>

        <div className="flex gap-2 items-center">
          <label className="font-semibold">Status</label>
          <div className="flex gap-2">
            <input
              type="radio"
              id="Active"
              value="Active"
              name="status"
              checked={form.status === "Active"}
              onChange={handleChange}
            />
            Active
            <input
              type="radio"
              id="Disable"
              value="Disable"
              name="status"
              checked={form.status === "Disable"}
              onChange={handleChange}
            />
            Disable
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add QR Code
        </button>
      </form>
    </div>
  );
}