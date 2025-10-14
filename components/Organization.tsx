import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { ChevronsUpDown, PenBoxIcon, SquarePlus, Trash2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Separator } from "./ui/separator";
import { Session } from "@/lib/db/schema";
import Image from "next/image";
import { Organization } from "better-auth/plugins";

const organizationSchema = z.object({
  name: z.string().min(1, {
    message: "Organization name is required",
  }),
  logo: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface MenuProps {
  orgs?: Organization[];
  session?: Session;
}

export function OrganizationMenu({ orgs: initialOrgs, session: initialSession }: MenuProps) {
  const { data: activeOrgData } = authClient.useActiveOrganization();
  const { data: organizationsData } = authClient.useListOrganizations();
  const { data: sessionData } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const [newOrgOpen, setNewOrgOpen] = useState(false);
  const [editedOrg, setEditedOrg] = useState<Organization | undefined>(undefined);
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | undefined>(undefined);
  // Use reactive data if available, otherwise fall back to props
  const currentSession = sessionData?.session || initialSession;
  const currentOrgs = organizationsData || initialOrgs; // Organizations list stays the same

  // Get the active organization - prefer reactive data
  const activeOrgId = activeOrgData?.id || currentSession?.activeOrganizationId || null;
  const activeOrg = currentOrgs?.find(org => org.id === activeOrgId);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="text-start w-full p-2 bg-sidebar-accent rounded-lg">
          {currentSession && (
            <div className="">
              {currentOrgs && currentOrgs.length > 0 && activeOrg && (
                <div className="flex justify-between text-center gap-2">
                  <div className="flex flex-row">
                    {activeOrg.logo && (
                      <Image
                        src={"/logo/logo.svg"}
                        alt="Organization Logo"
                        className="size-6 rounded-full object-cover"
                        width={24}
                        height={24}
                      />
                    )}
                    {activeOrg.name}
                  </div>

                  <ChevronsUpDown className="size-4 self-center" />

                </div>
              )}
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent side="right" className="p-1">
          {currentOrgs && currentOrgs.length > 0 ? (
            currentOrgs.map(org => (
              <div key={org.id} className="hover:bg-accent rounded">
                <div
                  className={`w-full text-left ${org.id === activeOrgId ? 'bg-accent' : ''}`}
                  onClick={async () => {
                    console.log(`Switch to organization: ${org.name}`);
                    await authClient.organization.setActive({
                      organizationId: org.id
                    });
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    {org.logo && org.logo !== "" && (
                      <img
                        src={org.logo}
                        alt={`${org.name} logo`}
                        className="size-5 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">{org.name}</div>
                    <div>
                      <Button
                        className="hover:bg-accent-foreground/10"
                        variant={"ghost"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewOrgOpen(true);
                          setEditedOrg(org);
                        }}
                      >
                        <PenBoxIcon />
                      </Button>
                      <Button
                        className="hover:bg-red-600/20 hover:text-red-600"
                        variant={"ghost"}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOrgToDelete(org);
                          setDeleteOrgOpen(true);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-muted-foreground p-2">No organizations available</div>
          )}
          <Separator orientation="horizontal" className="my-2 h-px bg-border" />
          <Button className="flex gap-2 h-full w-full m-0" variant="ghost" asChild>
            <div>
              <OrgManager open={newOrgOpen} setOpen={setNewOrgOpen} organization={editedOrg} />
            </div>
          </Button>
        </PopoverContent>
      </Popover>

      <Dialog open={deleteOrgOpen} onOpenChange={setDeleteOrgOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the organization "{orgToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOrgOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!orgToDelete) return;
                try {
                  const response = await authClient.organization.delete({
                    organizationId: orgToDelete.id
                  });
                  if (response.error) {
                    throw new Error(`Error: ${response.error.message}`);
                  }
                  setDeleteOrgOpen(false);
                  setOpen(false);
                } catch (error) {
                  console.error("Failed to delete organization:", error);
                  // Optionally, you could add a toast notification here
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ManagerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  organization?: Organization;
}

export function OrgManager({ organization, open, setOpen }: ManagerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || "",
      logo: organization?.logo || "",
    },
  });

  // Update form when organization prop changes
  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name,
        logo: organization.logo || "",
      });
    }
  }, [organization, form]);

  const onSubmit = async (data: OrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      if (organization?.id) {
        // Update existing organization
        const response = await authClient.organization.update({
          organizationId: organization.id,
          data: {
            name: data.name,
            logo: data.logo,
            slug: data.name.toLowerCase().replace(/\s+/g, '-'),
          }
        });

        if (response.error) {
          throw new Error(`Error: ${response.error.message}`);
        }
      } else {
        // Create new organization
        const response = await authClient.organization.create({
          name: data.name,
          logo: data.logo,
          slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        });

        if (response.error) {
          throw new Error(`Error: ${response.error.message}`);
        }
      }

      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Failed to submit organization:", error);
      // Optionally, you could add a toast notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className="gap-2 flex text-muted-foreground text-start items-start cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        >
          <SquarePlus className="size-4" />
          Add organization
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {organization?.id ? "Update organization" : "Add organization"}
          </DialogTitle>
          <DialogDescription>
            {organization?.id
              ? "Update the organization name and logo"
              : "Create a new organization to manage your projects."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="items-center gap-4">
                  <FormLabel className="text-right">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Organization name"
                      {...field}
                      className="col-span-3"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem className="gap-4">
                  <FormLabel className="text-right">Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                      value={field.value || ""}
                      className="col-span-3"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : organization?.id
                    ? "Update organization"
                    : "Create organization"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}