"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

export default function CreateTemplate() {

  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="">
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <Button onClick={() => setIsCreating(true)}>Create new template</Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Email Template</DialogTitle>
          </DialogHeader>
          <DialogContent>
            {/* Form fields for creating a new template would go here */}
            <p>Template creation form goes here.</p>
          </DialogContent>
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