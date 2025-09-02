/**
 * Tag Validation Schemas
 * Contains all validation rules for tag-related endpoints
 */

const createTagSchema = {
    name: { required: true, minLength: 1, maxLength: 50 },
    color: { required: true, pattern: /^#[0-9A-F]{6}$/i },
    description: { maxLength: 200 }
};

const updateTagSchema = {
    name: { minLength: 1, maxLength: 50 },
    color: { pattern: /^#[0-9A-F]{6}$/i },
    description: { maxLength: 200 }
};

const mergeTagsSchema = {
    sourceTagId: { required: true, objectId: true },
    targetTagId: { required: true, objectId: true }
};

module.exports = {
    createTagSchema,
    updateTagSchema,
    mergeTagsSchema
};
