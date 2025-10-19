"use client";
import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { db } from "../firebase";
import { FaTrashAlt } from "react-icons/fa";
import { ref, onValue, update, remove } from "firebase/database";

export default function TestPage() {
  const [qrList, setQrList] = useState([]);
  const [selectedQR, setSelectedQR] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
    type: "",
    points: "",
    location: "",
    picture: "",
    description: "",
    status: "Active",
  });
  const [message, setMessage] = useState("");

  // Fetch all QR data
  useEffect(() => {
    const qrRef = ref(db, "QR-Data");
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

    onValue(qrRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const qrArray = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => b.timestamp - a.timestamp);
        setQrList(qrArray);
      } else {
        setQrList([]);
      }
    });

    return () => unsubscribe(); // cleanup
  }, []);

  // Handle field changes in popup form
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...form, [name]: value };

    // Auto-update location if latitude or longitude changes
    if (name === "latitude" || name === "longitude") {
      updatedForm.location = `${updatedForm.latitude}, ${updatedForm.longitude}`;
    }

    setForm(updatedForm);
  };

  // Open popup with selected QR data
  const handleEditClick = (qr) => {
    setSelectedQR(qr);
    setForm(qr); // prefill form
  };

  // Update QR in Firebase
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedQR) return;

    try {
      const qrRef = ref(db, `QR-Data/${selectedQR.id}`);
      await update(qrRef, form);
      setMessage("QR updated successfully!");
      setTimeout(() => setMessage(""), 3000);
      setSelectedQR(null); // close popup
    } catch (error) {
      console.error(error);
      setMessage("Error updating QR.");
    }
  };

  // Delete QR
  const handleDelete = async (qrId) => {
    if (!window.confirm("Are you sure you want to delete this QR?")) return;
    try {
      await remove(ref(db, `QR-Data/${qrId}`));
      setMessage("QR deleted successfully!");
      setQrList(qrList.filter((qr) => qr.id !== qrId));
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Error deleting QR.");
    }
  };

  return (
    <div className="p-8 relative">
      <h1 className="text-center text-3xl font-bold mb-6">QR-Code List</h1>
      {message && <p className="text-green-600 text-center mb-4">{message}</p>}

      {/* QR List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrList.map((qr) => (
          <div
            key={qr.id}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <h3 className="text-xl font-bold mb-2">{qr.name}</h3>

            <p className="text-gray-600 mb-1">
              <strong>Lat, Long:</strong> {qr.latitude}, {qr.longitude}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Type:</strong> {qr.type}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Points:</strong> {qr.points}
            </p>
            <p className="text-gray-600 mb-1">
              <strong>Location:</strong> {qr.location}
            </p>

            <p className="text-gray-600 mb-1">
              <strong>Image view:</strong>{" "}
              <a
                href={qr.picture}
                target="_blank"
                className="text-blue-500 underline"
              >
                View
              </a>
            </p>
            <p className="text-gray-600">
              <strong>Description:</strong> {qr.description}
            </p>
            <p className="text-gray-600">
              <strong>Status:</strong> {qr.status}
            </p>

            {/* Edit & Delete */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEditClick(qr)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDelete(qr.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <FaTrashAlt /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Popup */}
      {selectedQR && (
        <div className="fixed inset-0 bg-gray-400 bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-lg relative">
            <h2 className="text-2xl font-bold mb-4 text-center">Update QR</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
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
                    placeholder="Latitude"
                    className="w-full p-2 rounded bg-slate-200 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div className="w-1/2">
                  <label className="font-semibold">Longitude</label>
                  <input
                    type="text"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    placeholder="Longitude"
                    className="w-full p-2 rounded bg-slate-200 focus:ring-2 focus:ring-blue-400"
                    required
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
                    placeholder="Type"
                    className="w-full p-2 rounded bg-slate-200 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="w-1/2">
                <label className="font-semibold">Points</label>
                  <input
                    type="number"
                    name="points"
                    value={form.points}
                    onChange={handleChange}
                    placeholder="Points"
                    className="w-full p-2 rounded bg-slate-200 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              <label className="font-semibold">Picture URL</label>
              <input
                type="url"
                name="picture"
                value={form.picture}
                onChange={handleChange}
                placeholder="Picture URL"
                className="w-full p-2 rounded bg-slate-200 focus:ring-2 focus:ring-blue-400"
              />


              <label className="font-semibold">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-2 rounded bg-slate-200 focus:ring-2 focus:ring-blue-400"
                rows="3"
              />
              <div className="flex gap-4 items-center">
                <label className="font-semibold">Status:</label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Active"
                    checked={form.status === "Active"}
                    onChange={handleChange}
                  />
                  Active
                </label>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="Disable"
                    checked={form.status === "Disable"}
                    onChange={handleChange}
                  />
                  Disable
                </label>
              </div>
              <div className="flex justify-between mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedQR(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}