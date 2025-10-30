import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/auth";
import { getTemplates } from "@/lib/email/emails";
import { getGroups } from "@/lib/groups/groups";
import { headers } from "next/headers";
import TemplateEditor from "./TemplateEditor";

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
    <div className="h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Email Templates</h1>
      <p className="mb-6">WYSWIG email editor incoming, for now, set the HTML manually.</p>

      <Tabs defaultValue={"default"} className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        <TabsList className="flex flex-row gap-2 h-auto w-full border-b pr-0 pb overflow-x-auto
               lg:flex-col lg:h-full lg:w-52 lg:border-b-0 lg:border-r lg:pr-4 lg:pb-0 lg:overflow-y-auto lg:items-start lg:justify-start">
          <TabsTrigger
            value="default"
            className="flex flex-row justify-between w-auto lg:w-full px-4 py-2 whitespace-nowrap"
          >
            <div className="truncate">Default</div>
            <div className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
              {templateCountByGroup["default"]}
            </div>
          </TabsTrigger>

          {groups.length > 0 &&
            groups.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="flex flex-row justify-between w-auto lg:w-full px-4 py-2 whitespace-nowrap"
              >
                <div className="truncate">{group.name}</div>
                <div className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                  {templateCountByGroup[group.id] || 0}
                </div>
              </TabsTrigger>
            ))}
        </TabsList>

        <div className="flex-1 overflow-auto">
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
                    <TemplateEditor organizationId={organizationId} baseTemplate={template} key={template.id} />
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
                    <TemplateEditor organizationId={organizationId} baseTemplate={template} key={template.id} />
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