"use client";

import { Button } from "@/components/ui/button";
import { EmailTemplate } from "@/lib/email/emails";
import { useState } from "react";
import sanitizeHtml from 'sanitize-html';
import { updateTemplate } from "@/lib/email/emails";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TemplateEditorProps {
  organizationId: string;
  baseTemplate: EmailTemplate;
}

// export interface EmailTemplate {
//   id: string;
//   name: string;
//   type: string;
//   subject: string;
//   html: string;
//   groupId?: string;
//   organizationId: string;
// }

export default function TemplateEditor({ organizationId, baseTemplate }: TemplateEditorProps) {

  const [template, setTemplate] = useState<EmailTemplate>(baseTemplate);
  return (
    <div key={template.id} className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
      <div className="flex flex-row gap-4">
        <Label htmlFor="mailType" className="">Mail type:</Label>
        <Select value={template ? template.type : baseTemplate.type} onValueChange={(value) => {
          setTemplate(prev => ({ ...prev, type: value }));
        }}>
          <SelectTrigger id="mailType" className="mb-4">
            <SelectValue placeholder="Mail type" />
          </SelectTrigger>
          <SelectContent defaultValue={"first_alert"}>
            <SelectItem value="first_alert">First alert</SelectItem>
            <SelectItem value="followup_alert">Followup alert</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="mb-2">
        <strong>Subject:</strong> {template.subject}
      </p>
      <div>
        <strong>HTML Content:</strong>
        <div className="mt-1 p-2 bg-accent rounded">
          <pre className="whitespace-pre-wrap text-sm">{template.html}</pre>
        </div>
        <strong className="mt-4 p-2 rounded bg-background block">
          Preview
        </strong>
        <div
          dangerouslySetInnerHTML={{
            __html: sanitizeHtml(template.html,
              {
                allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'style']),
                allowedAttributes: {
                  ...sanitizeHtml.defaults.allowedAttributes,
                  img: ['src', 'alt', 'width', 'height', 'style'],
                  '*': ['style']
                },
                allowVulnerableTags: true

              }
            )
          }}
          className="mt-1 p-2 border rounded bg-accent"
        />
      </div>
      < Button
        className="mt-4"
        onClick={async () => {
          // Placeholder save logic
          const res = await updateTemplate(template.id, template);
          console.log('Template updated:', res);
          toast.success(`Template "${template.name}" saved for org ${organizationId}`);

        }}
      >
        Save Changes
      </Button >
    </div>
  );
}