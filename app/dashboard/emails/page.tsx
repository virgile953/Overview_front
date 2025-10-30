import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { getTemplates } from "@/lib/email/emails";
import { getGroups } from "@/lib/groups/groups";
import { headers } from "next/headers";

export default async function EmailsPage() {

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return <div>Unauthorized</div>;
  }

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return <div>No active organization</div>;
  }
  const templates = await getTemplates(organizationId)
  const groups = await getGroups(organizationId);
  console.log("groups: ", groups);
  console.log(templates);
  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-4">Email Templates</h1>
      <p>WYSWIG email editor incoming, for now, set the HTML manually.</p>



      <Tabs defaultValue="templates" className="mb-6" orientation="horizontal">
        <TabsList >
          {groups.length > 0 &&
            groups.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>{group.name}</TabsTrigger>
            ))}
          {/* <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger> */}
        </TabsList>
        <TabsContent value="templates">
          <div className="space-y-4 mt-4">
            coucou
          </div>
        </TabsContent>
        <TabsContent value="7f036c54-cd09-4ad3-a4e8-17fda4fe6e24">
          <div className="space-y-4 mt-4">
            {groups.map((group) => (
              <div key={group.id} className="p-4 border rounded">
                <h2 className="text-lg font-semibold mb-2">{group.name}</h2>
                <p><strong>Description:</strong> {group.description || 'No description'}</p>
                <p><strong>Members:</strong> {group.users.length}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* {templates.map((template) => (
        <div key={template.id} className="mb-6 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
          <p className="mb-2"><strong>Subject:</strong> {template.subject}</p>u
          <div>
            <strong>HTML Content:</strong>
            <div className="mt-1 p-2 bg-accent rounded">
              <pre className="whitespace-pre-wrap">{template.html}</pre>
            </div>
            <div dangerouslySetInnerHTML={{ __html: template.html }} className="mt-4 p-4 border rounded bg-accent">

            </div>
          </div>
        </div>
      ))} */}
    </div>
  );
}