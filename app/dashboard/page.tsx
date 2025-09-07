import DevicesDashboard from "./components/DevicesComponent";

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full w-full">

      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 mt-4">

        <DevicesDashboard className="col-span-4 md:col-span-4 lg:col-span-5" />
        <DevicesDashboard className="col-span-4 md:col-span-4 lg:col-span-7" />
        <DevicesDashboard className="col-span-4 md:col-span-4 lg:col-span-3" />
        <DevicesDashboard className="col-span-4 md:col-span-4 lg:col-span-3" />
        <DevicesDashboard className="col-span-4 md:col-span-4 lg:col-span-6" />
      </div>
    </div>
  );
}
