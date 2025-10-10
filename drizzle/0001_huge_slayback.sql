CREATE TABLE "device_logs" (
	"id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"device_id" text NOT NULL,
	"level" text NOT NULL,
	"message" text NOT NULL,
	"latency" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "device_logs_pkey" PRIMARY KEY("id","created_at")
);
--> statement-breakpoint
CREATE INDEX "device_logs_created_at_idx" ON "device_logs" USING btree ("created_at" timestamptz_ops);