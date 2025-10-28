"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldGroup
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Helper functions for time conversion
const convertToSeconds = (value: number, unit: "seconds" | "minutes" | "hours"): number => {
  switch (unit) {
    case "seconds":
      return value;
    case "minutes":
      return value * 60;
    case "hours":
      return value * 3600;
  }
};

const convertFromSeconds = (seconds: number, unit: "seconds" | "minutes" | "hours"): number => {
  switch (unit) {
    case "seconds":
      return seconds;
    case "minutes":
      return Math.floor(seconds / 60);
    case "hours":
      return Math.floor(seconds / 3600);
  }
};

const formSchema = z.object({
  emailEnabled: z.boolean(),
  inactivityThreshold: z
    .number(),
  inactivityUnit: z.enum(["seconds", "minutes", "hours"]),
  recipientEmails: z
    .string()
    .min(1, "At least one email address is required.")
    .refine(
      (val) => {
        const emails = val.split(",").map(e => e.trim());
        return emails.every(email => z.email().safeParse(email).success);
      },
      "All email addresses must be valid."
    ),
  cooldownPeriod: z
    .number()
    .min(1, "Cooldown must be at least 1."),
  cooldownUnit: z.enum(["seconds", "minutes", "hours"]),
  includeDeviceDetails: z.boolean(),
}).refine(
  (data) => {
    const inactivitySeconds = convertToSeconds(data.inactivityThreshold, data.inactivityUnit);
    return inactivitySeconds >= 60;
  },
  {
    message: "Inactivity threshold must be at least 60 seconds (1 minute).",
    path: ["inactivityThreshold"],
  }
).superRefine(
  (val, ctx) => {
    const inactivitySeconds = convertToSeconds(val.inactivityThreshold, val.inactivityUnit);

    if (inactivitySeconds >= 86400) {
      ctx.addIssue({
        code: "too_big",
        message: `Inactivity threshold must be at most ${convertFromSeconds(86400, val.inactivityUnit)} ${val.inactivityUnit} (24 hours).`,
        maximum: 86400,
        origin: "number",
        path: ["inactivityThreshold"],
      });
    }
  }
).refine(
  (data) => {
    const cooldownSeconds = convertToSeconds(data.cooldownPeriod, data.cooldownUnit);
    return cooldownSeconds >= 300;
  },
  {
    message: "Cooldown must be at least 300 seconds (5 minutes).",
    path: ["cooldownPeriod"],
  }
).superRefine(
  (data, ctx) => {
    const cooldownSeconds = convertToSeconds(data.cooldownPeriod, data.cooldownUnit);
    if (cooldownSeconds >= 86400) {
      ctx.addIssue({
        code: "too_big",
        message: `Cooldown period must be at most ${convertFromSeconds(86400, data.cooldownUnit)} ${data.cooldownUnit} (24 hours).`,
        maximum: 86400,
        origin: "number",
        path: ["cooldownPeriod"],
      });
    }
  }
);

type FormValues = z.infer<typeof formSchema>;

// Backend submission type (everything in seconds)
interface SettingsPayload {
  emailEnabled: boolean;
  inactivityThresholdSeconds: number;
  recipientEmails: string[];
  cooldownPeriodSeconds: number;
  includeDeviceDetails: boolean;
}

export default function SettingsForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      emailEnabled: false,
      inactivityThreshold: 30,
      inactivityUnit: "minutes",
      recipientEmails: "",
      cooldownPeriod: 30,
      cooldownUnit: "minutes",
      includeDeviceDetails: true,
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    // Convert to seconds for backend storage
    const payload: SettingsPayload = {
      emailEnabled: data.emailEnabled,
      inactivityThresholdSeconds: convertToSeconds(data.inactivityThreshold, data.inactivityUnit),
      recipientEmails: data.recipientEmails.split(",").map(e => e.trim()),
      cooldownPeriodSeconds: convertToSeconds(data.cooldownPeriod, data.cooldownUnit),
      includeDeviceDetails: data.includeDeviceDetails,
    };

    console.log("Form submitted (UI values):", data);
    console.log("Backend payload (in seconds):", payload);

    // TODO: Save settings to database/API
    // await fetch('/api/settings', {
    //   method: 'POST',
    //   body: JSON.stringify(payload),
    // });
  };

  const emailEnabled = form.watch("emailEnabled");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      <FieldSet>
        <FieldLegend>Email Notification Settings</FieldLegend>
        <FieldDescription>
          Configure when and how to send email notifications for inactive devices.
        </FieldDescription>

        <FieldGroup className="gap-6 mt-6">
          {/* Email Notifications Toggle */}
          <Controller
            name="emailEnabled"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor="emailEnabled">
                    Enable Email Notifications
                  </FieldLabel>
                  <FieldDescription>
                    Send email alerts when devices become inactive.
                  </FieldDescription>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Switch
                  id="emailEnabled"
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
              </Field>
            )}
          />

          {/* Inactivity Threshold */}
          {emailEnabled && (
            <>
              <Controller
                name="inactivityThreshold"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="inactivityThreshold">
                      Inactivity Threshold
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Input
                        {...field}
                        id="inactivityThreshold"
                        type="number"
                        min={1}
                        aria-invalid={fieldState.invalid}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="max-w-[150px]"
                      />
                      <Controller
                        name="inactivityUnit"
                        control={form.control}
                        render={({ field: unitField }) => (
                          <Select
                            value={unitField.value}
                            onValueChange={(e) => {
                              unitField.onChange(e);
                              form.trigger("inactivityThreshold");
                            }}
                          >
                            <SelectTrigger className="max-w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="seconds">Seconds</SelectItem>
                              <SelectItem value="minutes">Minutes</SelectItem>
                              <SelectItem value="hours">Hours</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <FieldDescription>
                      Send an email after a device has been inactive for this duration.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Recipient Emails */}
              <Controller
                name="recipientEmails"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="recipientEmails">
                      Recipient Email Addresses
                    </FieldLabel>
                    <Input
                      {...field}
                      id="recipientEmails"
                      type="text"
                      aria-invalid={fieldState.invalid}
                      placeholder="admin@example.com, support@example.com"
                    />
                    <FieldDescription>
                      Enter one or more email addresses separated by commas.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Cooldown Period */}
              <Controller
                name="cooldownPeriod"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cooldownPeriod">
                      Notification Cooldown
                    </FieldLabel>
                    <div className="flex gap-2">
                      <Input
                      {...field}
                      id="cooldownPeriod"
                      type="number"
                      min={1}
                      step={1}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="max-w-[150px]"
                      />
                      <Controller
                      name="cooldownUnit"
                      control={form.control}
                      render={({ field: unitField }) => (
                        <Select
                        value={unitField.value}
                        onValueChange={(e) => {
                          unitField.onChange(e);
                          form.trigger("cooldownPeriod");
                        }
                        }
                        >
                        <SelectTrigger className="max-w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seconds">Seconds</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                        </Select>
                      )}
                      />
                    </div>
                    <FieldDescription>
                      Minimum time between notifications for the same device.
                    </FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Include Device Details */}
              <Controller
                name="includeDeviceDetails"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                    <FieldContent>
                      <FieldLabel htmlFor="includeDeviceDetails">
                        Include Device Details
                      </FieldLabel>
                      <FieldDescription>
                        Include device information (IP, MAC, location) in email notifications.
                      </FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </FieldContent>
                    <Switch
                      id="includeDeviceDetails"
                      name={field.name}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                )}
              />
            </>
          )}
        </FieldGroup>
      </FieldSet>

      <div className="flex gap-4">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset()}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}