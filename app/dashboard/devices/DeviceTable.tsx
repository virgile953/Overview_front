import { Device } from "@/models/server/devices";
import Table, { TableColumn } from "@/app/ui/table/Table";

const columns: TableColumn<Device>[] = [
  { key: "$id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "location", label: "Location" },
  { key: "ipAddress", label: "IP Address" },
  { key: "macAddress", label: "MAC Address" },
  { key: "serialNumber", label: "Serial Number" },
  { key: "firmwareVersion", label: "Firmware Version" },
  { key: "lastActive", label: "Last Active" },
  { key: "ownerId", label: "Owner ID" },
];

export default function DeviceTable({ devices }: { devices: Device[] }) {


  return (
    <>
      <Table columns={columns} data={devices}
        emptyMessage="No devices available." />
    </>
  );
}
