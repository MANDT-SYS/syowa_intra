import { pgTable, index, unique, bigserial, text, integer, timestamp, bigint, uuid, smallint, boolean, foreignKey, uniqueIndex } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const documentCategories = pgTable("document_categories", {
	id: bigserial({ mode: "number" }).primaryKey().notNull(),
	name: text().notNull(),
	displayOrder: integer("display_order").default(0).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	updatedBy: bigint("updated_by", { mode: "number" }).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	deletedBy: bigint("deleted_by", { mode: "number" }),
}, (table) => [
	index("idx_document_categories_active").using("btree", table.displayOrder.asc().nullsLast().op("int4_ops")).where(sql`(deleted_at IS NULL)`),
	unique("document_categories_name_key").on(table.name),
]);

export const calendar = pgTable("calendar", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	year: smallint().notNull(),
	title: text().notNull(),
	storagePath: text("storage_path").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	priority: boolean("Priority"),
});

export const documents = pgTable("documents", {
	id: bigserial({ mode: "number" }).primaryKey().notNull(),
	title: text().notNull(),
	managementNumber: text("management_number").notNull(),
	description: text(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	categoryId: bigint("category_id", { mode: "number" }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	managementDivisionId: bigint("management_division_id", { mode: "number" }).notNull(),
	managedFromRevisionNumber: integer("managed_from_revision_number").default(1).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	currentRevisionId: bigint("current_revision_id", { mode: "number" }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	updatedBy: bigint("updated_by", { mode: "number" }).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	deletedBy: bigint("deleted_by", { mode: "number" }),
}, (table) => [
	index("idx_documents_category_id").using("btree", table.categoryId.asc().nullsLast().op("int8_ops")),
	index("idx_documents_management_division_id").using("btree", table.managementDivisionId.asc().nullsLast().op("int8_ops")),
	index("idx_documents_not_deleted").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")).where(sql`(deleted_at IS NULL)`),
	index("idx_documents_title").using("btree", table.title.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [documentCategories.id],
			name: "documents_category_id_fkey"
		}).onDelete("set null"),
]);

export const revisions = pgTable("revisions", {
	id: bigserial({ mode: "number" }).primaryKey().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	documentId: bigint("document_id", { mode: "number" }).notNull(),
	revisionNumber: integer("revision_number").notNull(),
	filePath: text("file_path").notNull(),
	fileName: text("file_name").notNull(),
	fileType: text("file_type").notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	fileSize: bigint("file_size", { mode: "number" }).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }).notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	updatedBy: bigint("updated_by", { mode: "number" }).notNull(),
	deletedAt: timestamp("deleted_at", { withTimezone: true, mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	deletedBy: bigint("deleted_by", { mode: "number" }),
}, (table) => [
	index("idx_revisions_document_id").using("btree", table.documentId.asc().nullsLast().op("int8_ops")),
	index("idx_revisions_document_revision").using("btree", table.documentId.asc().nullsLast().op("int8_ops"), table.revisionNumber.desc().nullsFirst().op("int8_ops")),
	foreignKey({
			columns: [table.documentId],
			foreignColumns: [documents.id],
			name: "revisions_document_id_fkey"
		}).onDelete("cascade"),
	unique("uq_document_revision").on(table.documentId, table.revisionNumber),
]);

export const authorityMaster = pgTable("authority_master", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	authorityId: bigint("authority_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "authority_master_authority_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	authorityName: text("authority_name").notNull(),
	authorityCode: text("authority_code").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	updatedBy: bigint("updated_by", { mode: "number" }).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	deletedBy: bigint("deleted_by", { mode: "number" }),
}, (table) => [
	uniqueIndex("uq_authority_code_active").using("btree", table.authorityCode.asc().nullsLast().op("text_ops")).where(sql`(deleted_at IS NULL)`),
]);

export const authorityUser = pgTable("authority_user", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	authorityUserId: bigint("authority_user_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity({ name: "authority_user_authority_user_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	authorityId: bigint("authority_id", { mode: "number" }).notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	userId: bigint("user_id", { mode: "number" }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	createdBy: bigint("created_by", { mode: "number" }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	updatedBy: bigint("updated_by", { mode: "number" }).notNull(),
	deletedAt: timestamp("deleted_at", { mode: 'string' }),
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	deletedBy: bigint("deleted_by", { mode: "number" }),
}, (table) => [
	index("ix_authority_user_authority_active").using("btree", table.authorityId.asc().nullsLast().op("int8_ops")).where(sql`(deleted_at IS NULL)`),
	uniqueIndex("uq_authority_user_active").using("btree", table.userId.asc().nullsLast().op("int8_ops")).where(sql`(deleted_at IS NULL)`),
	foreignKey({
			columns: [table.authorityId],
			foreignColumns: [authorityMaster.authorityId],
			name: "authority_user_authority_id_fkey"
		}),
]);
