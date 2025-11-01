"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteTemplate, EmailTemplate, updateTemplate } from "@/lib/email/emails";
import { useState } from "react";
import sanitizeHtml from 'sanitize-html';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TemplateEditorProps {
  baseTemplate: EmailTemplate;
}

export default function TemplateEditor({ baseTemplate }: TemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate>(baseTemplate);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateTemplate(template.id, template);
      console.log('Template updated:', res);
      toast.success(`Template "${template.name}" saved successfully`);
    } catch (error) {
      toast.error('Failed to save template');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`)) {
      return;
    }
    setIsDeleting(true);
    try {
      deleteTemplate(template.id);
      toast.success(`Template "${template.name}" deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete template');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
      router.refresh();
    }
  }

  return (
    <div key={template.id} className="p-4 border rounded-lg space-y-4">
      {/* Template Name */}
      <div className="space-y-2">
        <Label htmlFor="templateName">Template Name</Label>
        <Input
          id="templateName"
          value={template.name}
          onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter template name"
        />
      </div>

      {/* Mail Type */}
      <div className="space-y-2">
        <Label htmlFor="mailType">Mail Type</Label>
        <Select
          value={template.type}
          onValueChange={(value) => setTemplate(prev => ({ ...prev, type: value }))}
        >
          <SelectTrigger id="mailType">
            <SelectValue placeholder="Select mail type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="first_alert">First Alert</SelectItem>
            <SelectItem value="followup_alert">Follow-up Alert</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          value={template.subject}
          onChange={(e) => setTemplate(prev => ({ ...prev, subject: e.target.value }))}
          placeholder="Enter email subject"
        />
      </div>

      {/* HTML Content */}
      <div className="space-y-2">
        <Label htmlFor="htmlContent">HTML Content</Label>
        <Textarea
          id="htmlContent"
          value={template.html}
          onChange={(e) => setTemplate(prev => ({ ...prev, html: e.target.value }))}
          placeholder="Enter HTML content"
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div className="flex flex-row w-full justify-between">
          <Label>Preview</Label>
          <Select>
            <SelectTrigger className="w-auto">
              Preview
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desktop">Desktop</SelectItem>
              <SelectItem value="mobile">Mobile</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(template.html, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'style']),
              allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                img: ['src', 'alt', 'width', 'height', 'style'],
                '*': ['style']
              },
              allowVulnerableTags: true
            })
          }}
          className="p-4 border rounded bg-accent min-h-[100px]"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex w-full gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setTemplate(baseTemplate)}
            disabled={isSaving}
          >
            Reset
          </Button>
        </div>
        <Button
          variant="destructive"
          onClick={() => handleDelete()}
          disabled={isDeleting}
        >
          delete
        </Button>
      </div>
    </div>
  );
}