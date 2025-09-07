"use client";
import { Device } from "@/models/server/devices";
import { useEffect, useState } from "react";
import DeviceTable from "./DeviceTable";



export default function Devices() {
  const [devices, setDevices] = useState<Device[] | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      const res = await fetch("/api/devices");
      const data = await res.json();
      setDevices(data);
    };
    fetchDevices();
  }, []);

  if (devices == null) {
    return <div>Loading devices...</div>;
  }

  return (
    <div>
      Devices Page - Protected Content
      <DeviceTable devices={devices} />
    </div>
  );
}
