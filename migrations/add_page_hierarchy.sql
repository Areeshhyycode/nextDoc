-- Migration: Add page hierarchy support to documents table
-- Run this SQL in your PostgreSQL database to enable the "Add Page" feature

-- Add parent_document_id column for page hierarchy
ALTER TABLE documents ADD COLUMN IF NOT EXISTS parent_document_id VARCHAR;

-- Add page_order column for ordering pages within a parent
ALTER TABLE documents ADD COLUMN IF NOT EXISTS page_order INTEGER DEFAULT 0;

-- Create index for faster queries on parent_document_id
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_document_id);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_documents_page_order ON documents(parent_document_id, page_order);
