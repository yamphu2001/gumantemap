"use client";
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { db } from "@/app/firebase";
import { ref, onValue, update, remove } from "firebase/database";

const MapWithNoSSR = dynamic(() => import('@/components/MapContainerComponent'), { ssr: false });

export default function Home() {

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

    console.log(qrList)
  return (
    <div className="container">
      <h1 className="title"></h1>

      {/* Buttons at the bottom
      <div className="buttonContainer">
        <Link href="/quick-qr">
          <button className="button">Quick QR Scan</button>
        </Link>
        <Link href="/options">
          <button className="button">Options</button>
        </Link>
        <Link href="/placeholder">
          <button className="button">Placeholder</button>
        </Link>
      </div> */}

      {/* Map on top */}
      <MapWithNoSSR mapData={qrList} />

    </div>
  );
}
