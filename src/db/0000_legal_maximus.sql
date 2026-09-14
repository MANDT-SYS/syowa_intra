-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "document_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" bigint NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" bigint NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" bigint,
	"active_flag" boolean DEFAULT true NOT NULL,
	CONSTRAINT "document_categories_name_key" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "document_categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "calendar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" smallint NOT NULL,
	"title" text NOT NULL,
	"storage_path" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"Priority" boolean
);
--> statement-breakpoint
ALTER TABLE "calendar" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "documents" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"management_number" text NOT NULL,
	"description" text,
	"category_id" bigint,
	"management_division_id" bigint NOT NULL,
	"managed_from_revision_number" integer DEFAULT 1 NOT NULL,
	"current_revision_id" bigint,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" bigint NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" bigint NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" bigint
);
--> statement-breakpoint
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"document_id" bigint NOT NULL,
	"revision_number" integer NOT NULL,
	"file_path" text NOT NULL,
	"file_name" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" bigint NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" bigint NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" bigint NOT NULL,
	"deleted_at" timestamp with time zone,
	"deleted_by" bigint,
	CONSTRAINT "uq_document_revision" UNIQUE("document_id","revision_number")
);
--> statement-breakpoint
ALTER TABLE "revisions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "authority_master" (
	"authority_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "authority_master_authority_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"authority_name" text NOT NULL,
	"authority_code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" bigint NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" bigint NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" bigint
);
--> statement-breakpoint
ALTER TABLE "authority_master" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "authority_user" (
	"authority_user_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "authority_user_authority_user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"authority_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" bigint NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" bigint NOT NULL,
	"deleted_at" timestamp,
	"deleted_by" bigint
);
--> statement-breakpoint
ALTER TABLE "authority_user" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."document_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authority_user" ADD CONSTRAINT "authority_user_authority_id_fkey" FOREIGN KEY ("authority_id") REFERENCES "public"."authority_master"("authority_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_document_categories_active" ON "document_categories" USING btree ("display_order" int4_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_documents_category_id" ON "documents" USING btree ("category_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_documents_management_division_id" ON "documents" USING btree ("management_division_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_documents_not_deleted" ON "documents" USING btree ("deleted_at" timestamptz_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_documents_title" ON "documents" USING btree ("title" text_ops);--> statement-breakpoint
CREATE INDEX "idx_revisions_document_id" ON "revisions" USING btree ("document_id" int8_ops);--> statement-breakpoint
CREATE INDEX "idx_revisions_document_revision" ON "revisions" USING btree ("document_id" int8_ops,"revision_number" int8_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_authority_code_active" ON "authority_master" USING btree ("authority_code" text_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "ix_authority_user_authority_active" ON "authority_user" USING btree ("authority_id" int8_ops) WHERE (deleted_at IS NULL);--> statement-breakpoint
CREATE UNIQUE INDEX "uq_authority_user_active" ON "authority_user" USING btree ("user_id" int8_ops) WHERE (deleted_at IS NULL);
*/