/**
 * Cleaning Template Management
 * Save and load cleaning configurations
 */

import type { CleaningSettings } from '../types/cleaning';

export interface CleaningTemplate {
  id: string;
  name: string;
  description: string;
  settings: CleaningSettings;
  createdAt: Date;
  lastUsed: Date | null;
  usageCount: number;
}

const STORAGE_KEY = 'figdash_cleaning_templates';

/**
 * Get all saved templates from localStorage
 */
export function getSavedTemplates(): CleaningTemplate[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const templates = JSON.parse(stored);
    // Convert date strings back to Date objects
    return templates.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      lastUsed: t.lastUsed ? new Date(t.lastUsed) : null,
    }));
  } catch (error) {
    console.error('Failed to load templates:', error);
    return [];
  }
}

/**
 * Save a new template
 */
export function saveTemplate(
  name: string,
  description: string,
  settings: CleaningSettings
): CleaningTemplate {
  const templates = getSavedTemplates();

  const newTemplate: CleaningTemplate = {
    id: `template-${Date.now()}`,
    name,
    description,
    settings,
    createdAt: new Date(),
    lastUsed: null,
    usageCount: 0,
  };

  templates.push(newTemplate);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (error) {
    console.error('Failed to save template:', error);
    throw new Error('Failed to save template to localStorage');
  }

  return newTemplate;
}

/**
 * Update template usage stats
 */
export function recordTemplateUsage(templateId: string): void {
  const templates = getSavedTemplates();
  const template = templates.find((t) => t.id === templateId);

  if (template) {
    template.lastUsed = new Date();
    template.usageCount++;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to update template usage:', error);
    }
  }
}

/**
 * Delete a template
 */
export function deleteTemplate(templateId: string): void {
  const templates = getSavedTemplates();
  const filtered = templates.filter((t) => t.id !== templateId);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete template:', error);
    throw new Error('Failed to delete template');
  }
}

/**
 * Export template as JSON file
 */
export function exportTemplate(template: CleaningTemplate): void {
  const json = JSON.stringify(template, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-template.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import template from JSON file
 */
export async function importTemplate(file: File): Promise<CleaningTemplate> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const template = JSON.parse(content);

        // Validate structure
        if (!template.name || !template.settings) {
          throw new Error('Invalid template format');
        }

        // Regenerate ID and dates
        const importedTemplate: CleaningTemplate = {
          ...template,
          id: `template-${Date.now()}`,
          createdAt: new Date(),
          lastUsed: null,
          usageCount: 0,
        };

        // Save to localStorage
        const templates = getSavedTemplates();
        templates.push(importedTemplate);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));

        resolve(importedTemplate);
      } catch (error) {
        reject(new Error('Failed to import template: Invalid JSON format'));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Get popular templates (most used)
 */
export function getPopularTemplates(limit: number = 3): CleaningTemplate[] {
  const templates = getSavedTemplates();
  return templates.sort((a, b) => b.usageCount - a.usageCount).slice(0, limit);
}

/**
 * Get recently used templates
 */
export function getRecentTemplates(limit: number = 3): CleaningTemplate[] {
  const templates = getSavedTemplates();
  return templates
    .filter((t) => t.lastUsed !== null)
    .sort((a, b) => {
      if (!a.lastUsed || !b.lastUsed) return 0;
      return b.lastUsed.getTime() - a.lastUsed.getTime();
    })
    .slice(0, limit);
}
