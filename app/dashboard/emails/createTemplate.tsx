"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GroupWithRelations } from "@/lib/db/schema";
import { EmailTemplate } from "@/lib/email/emails";
import { ChevronDown, FileText, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


interface CreateTemplateProps {
  group?: GroupWithRelations;
  templates: EmailTemplate[];
}

export default function CreateTemplate({ group, templates }: CreateTemplateProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [creationType, setCreationType] = useState<'scratch' | 'template' | null>(null);

  const handleCreateFromScratch = () => {
    setCreationType('scratch');
    setIsCreating(true);
  };

  const handleCreateFromTemplate = () => {
    setCreationType('template');
    setIsCreating(true);
  };

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            Create new template
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCreateFromScratch}>
            <FileText className="mr-2 h-4 w-4" />
            Create from scratch
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCreateFromTemplate}>
            <Copy className="mr-2 h-4 w-4" />
            Create from template
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {creationType === 'scratch' ? 'Create New Email Template' : 'Create from Template'} for group {group ? `"${group.name}"` : '(Default)'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div>
              {creationType === 'scratch' && (
                <p>Create a new email template from scratch.</p>
              )}
              {creationType === 'template' && (

                <div>
                  <ToggleGroup type="single" className="flex flex-col"
                    onValueChange={(templateId) => {
                      console.log('Selected template:', templateId);
                      // setSelectedTemplate
                    }}>
                    {templates.map((template) => (
                      <ToggleGroupItem key={template.id} value={template.id} onChange={
                        () => {
                          console.log('Selected template:', template);
                          setSelectedTemplate(template.id)
                        }
                      }>
                        <div>
                          <h3 className="font-medium">{template.name}</h3>
                          <p className="text-sm text-muted-foreground">{template.subject}</p>
                        </div>
                      </ToggleGroupItem>
                    ))}

                  </ToggleGroup>
                  {/* <p>Select an existing template to copy and modify.</p> */}
                </div>
              )}
              {/* Form fields for creating a new template would go here */}
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Template created successfully!' + (selectedTemplate ? ` from ${selectedTemplate}` : ''));
              setIsCreating(false);
              setCreationType(null);
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}