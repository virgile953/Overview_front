"use client";

import { Button } from "@/components/ui/button";
import { EmailTemplate } from "@/lib/email/emails";
import { useState } from "react";
import sanitizeHtml from 'sanitize-html';

interface TemplateEditorProps {
  organizationId: string;
  baseTemplate: EmailTemplate;
}
export default function TemplateEditor({ organizationId, baseTemplate }: TemplateEditorProps) {

  const [template, setTemplate] = useState<EmailTemplate>(baseTemplate);
  return (
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
        <strong className="mt-4 p-2 rounded bg-background block">
          Preview
        </strong>
        <div
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(template.html,
        { 
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'style']), 
          allowedAttributes: { 
            ...sanitizeHtml.defaults.allowedAttributes, 
            img: ['src', 'alt', 'width', 'height', 'style'],
            '*': ['style']
          }
        }
          ) }}
          className="mt-1 p-2 border rounded bg-accent"
        />
      </div>
      < Button className="mt-4" >
        Save Changes
      </Button >
    </div>
  );
}