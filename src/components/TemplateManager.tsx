import { useState } from 'react';
import { Button, Card } from './index';
import { Save, Upload, Download, Trash2, X } from 'lucide-react';
import type { CleaningSettings } from '../types/cleaning';
import type { CleaningTemplate } from '../utils/cleaningTemplates';
import {
  getSavedTemplates,
  saveTemplate,
  deleteTemplate,
  exportTemplate,
  importTemplate,
  recordTemplateUsage,
} from '../utils/cleaningTemplates';

interface TemplateManagerProps {
  currentSettings: CleaningSettings;
  onLoadTemplate: (settings: CleaningSettings, templateId: string) => void;
  onClose: () => void;
}

export function TemplateManager({
  currentSettings,
  onLoadTemplate,
  onClose,
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<CleaningTemplate[]>(getSavedTemplates());
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');

  const handleSave = () => {
    if (!newTemplateName.trim()) return;

    try {
      saveTemplate(newTemplateName, newTemplateDesc, currentSettings);
      setTemplates(getSavedTemplates());
      setShowSaveDialog(false);
      setNewTemplateName('');
      setNewTemplateDesc('');
    } catch (error) {
      alert('Failed to save template');
    }
  };

  const handleLoad = (template: CleaningTemplate) => {
    recordTemplateUsage(template.id);
    onLoadTemplate(template.settings, template.id);
  };

  const handleDelete = (templateId: string) => {
    if (confirm('Delete this template?')) {
      deleteTemplate(templateId);
      setTemplates(getSavedTemplates());
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importTemplate(file);
      setTemplates(getSavedTemplates());
      alert('Template imported successfully!');
    } catch (error) {
      alert(`Import failed: ${error}`);
    }

    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-2xl w-full mx-4">
        <Card padding="lg">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Cleaning Templates</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                icon={<Save className="h-4 w-4" />}
                onClick={() => setShowSaveDialog(true)}
              >
                Save Current Settings
              </Button>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Upload className="h-4 w-4" />}
                  onClick={(e) => {
                    e.preventDefault();
                    (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                  }}
                >
                  Import
                </Button>
              </label>
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-3">
                <h3 className="text-sm font-medium text-blue-900">Save New Template</h3>
                <input
                  type="text"
                  placeholder="Template name (e.g., 'Quarterly UX Survey')"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newTemplateDesc}
                  onChange={(e) => setNewTemplateDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!newTemplateName.trim()}
                  >
                    Save Template
                  </Button>
                </div>
              </div>
            )}

            {/* Templates List */}
            {templates.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No saved templates yet. Save your current settings to create one.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                      {template.description && (
                        <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Used {template.usageCount} times</span>
                        {template.lastUsed && (
                          <span>Last used {template.lastUsed.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLoad(template)}
                        className="rounded-md px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => exportTemplate(template)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Export"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
