"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export default function CreateTemplate() {

  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="">
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogTrigger asChild>
          <Button >Create new template</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Email Template</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            {/* Form fields for creating a new template would go here */}
            <div>Template creation form goes here.</div>
          </DialogDescription>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
            <Button onClick={() => {
              // Placeholder create logic
              alert('Template created!');
              setIsCreating(false);
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}