import { relations } from "drizzle-orm/relations";
import { documentCategories, documents, revisions, authorityMaster, authorityUser } from "./schema";

export const documentsRelations = relations(documents, ({one, many}) => ({
	documentCategory: one(documentCategories, {
		fields: [documents.categoryId],
		references: [documentCategories.id]
	}),
	revisions: many(revisions),
}));

export const documentCategoriesRelations = relations(documentCategories, ({many}) => ({
	documents: many(documents),
}));

export const revisionsRelations = relations(revisions, ({one}) => ({
	document: one(documents, {
		fields: [revisions.documentId],
		references: [documents.id]
	}),
}));

export const authorityUserRelations = relations(authorityUser, ({one}) => ({
	authorityMaster: one(authorityMaster, {
		fields: [authorityUser.authorityId],
		references: [authorityMaster.authorityId]
	}),
}));

export const authorityMasterRelations = relations(authorityMaster, ({many}) => ({
	authorityUsers: many(authorityUser),
}));