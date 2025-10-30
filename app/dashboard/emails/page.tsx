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

  // Count templates per group, including undefined groupId as "default"
  const templateCountByGroup = templates.reduce((acc, template) => {
    const groupId = template.groupId || "default";
    acc[groupId] = (acc[groupId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Email Templates</h1>
      <p className="mb-6">WYSWIG email editor incoming, for now, set the HTML manually.</p>

      <Tabs defaultValue={groups[0]?.id || "default"} className="flex flex-row gap-6">
        <TabsList className="flex flex-col gap-2 h-fit w-64 border-r pr-4">
          {/* Default tab for templates without groupId */}
          {templateCountByGroup["default"] > 0 && (
            <TabsTrigger
              value="default"
              className="flex flex-row justify-between w-full px-4 py-2"
            >
              <div className="truncate">Default</div>
              <div className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                {templateCountByGroup["default"]}
              </div>
            </TabsTrigger>
          )}
          
          {groups.length > 0 &&
            groups.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="flex flex-row justify-between w-full px-4 py-2"
              >
                <div className="truncate">{group.name}</div>
                <div className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                  {templateCountByGroup[group.id] || 0}
                </div>
              </TabsTrigger>
            ))}
        </TabsList>

        <div className="flex-1">
          {/* Default tab content */}
          {templateCountByGroup["default"] > 0 && (
            <TabsContent value="default" className="w-full mt-0">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">
                  Default Templates ({templateCountByGroup["default"]})
                </h2>

                {templates
                  .filter(template => !template.groupId)
                  .map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                      <p className="mb-2">
                        <strong>Subject:</strong> {template.subject}
                      </p>
                      <div>
                        <strong>HTML Content:</strong>
                        <div className="mt-1 p-2 bg-accent rounded">
                          <pre className="whitespace-pre-wrap text-sm">{template.html}</pre>
                        </div>
                        <div
                          dangerouslySetInnerHTML={{ __html: template.html }}
                          className="mt-4 p-4 border rounded bg-accent"
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          )}

          {groups.map((group) => (
            <TabsContent key={group.id} value={group.id} className="w-full mt-0">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">
                  {group.name} Templates ({templateCountByGroup[group.id] || 0})
                </h2>

                {templates
                  .filter(template => template.groupId === group.id)
                  .map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg">
                      <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                      <p className="mb-2">
                        <strong>Subject:</strong> {template.subject}
                      </p>
                      <div>
                        <strong>HTML Content:</strong>
                        <div className="mt-1 p-2 bg-accent rounded">
                          <pre className="whitespace-pre-wrap text-sm">{template.html}</pre>
                        </div>
                        <div
                          dangerouslySetInnerHTML={{ __html: template.html }}
                          className="mt-4 p-4 border rounded bg-accent"
                        />
                      </div>
                    </div>
                  ))}

                {(!templateCountByGroup[group.id] || templateCountByGroup[group.id] === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No templates for this group yet
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}