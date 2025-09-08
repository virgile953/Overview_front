import DevicesDashboard from "./components/DevicesComponent";
import { GroupsComponent } from "./components/GroupsComponent";
import { UsersComponent } from "./components/UsersComponent";

export default function Dashboard() {
  return (
    <div className="flex flex-col h-full w-full">

      <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4 mt-4">

        <DevicesDashboard className="col-span-4 md:col-span-4 lg:col-span-5" />
        <GroupsComponent className="col-span-2 md:col-span-2 lg:col-span-2" />
        <UsersComponent className="col-span-2 md:col-span-2 lg:col-span-3" />
        <GroupsComponent className="col-span-2 md:col-span-2 lg:col-span-2" />
        <DevicesDashboard className="col-span-4 md:col-span-4 lg:col-span-5" />
        <GroupsComponent className="col-span-2 md:col-span-2 lg:col-span-2" />
        <DevicesDashboard className="col-span-4 md:col-span-4 lg:col-span-5" />
      </div>
    </div>
  );
}
