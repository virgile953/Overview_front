"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmailTemplate, updateTemplate } from "@/lib/email/emails";
import { useState } from "react";
import sanitizeHtml from 'sanitize-html';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TemplateEditorProps {
  baseTemplate: EmailTemplate;
}

export default function TemplateEditor({ baseTemplate }: TemplateEditorProps) {
  const [template, setTemplate] = useState<EmailTemplate>(baseTemplate);
  const [isSaving, setIsSaving] = useState(false);

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
    }
  };

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
        <Label>Preview</Label>
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
      <div className="flex gap-2">
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
    </div>
  );
}