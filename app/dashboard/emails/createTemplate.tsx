"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, FileText, Copy } from "lucide-react";
import { useState } from "react";

export default function CreateTemplate() {
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
              {creationType === 'scratch' ? 'Create New Email Template' : 'Create from Template'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div>
              {creationType === 'scratch' && (
                <p>Create a new email template from scratch.</p>
              )}
              {creationType === 'template' && (
                <p>Select an existing template to copy and modify.</p>
              )}
              {/* Form fields for creating a new template would go here */}
            </div>
          </DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button onClick={() => {
              alert(`Template created from ${creationType}!`);
              setIsCreating(false);
              setCreationType(null);
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}