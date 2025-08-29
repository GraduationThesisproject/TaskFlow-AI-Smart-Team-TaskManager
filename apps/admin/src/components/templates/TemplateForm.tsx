import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { 
  createBoardTemplate, 
  updateBoardTemplate,
  setShowCreateModal,
  setShowEditModal
} from '../../store/slices/boardTemplateSlice';
import { 
  BoardTemplate, 
  CreateBoardTemplateRequest, 
  BoardTemplateList, 
  BoardTemplateCard,
  TEMPLATE_CATEGORIES,
  LIST_COLORS,
  PRIORITY_OPTIONS,
  DEFAULT_TEMPLATES
} from '../../types/boardTemplate.types';
import { 
  Modal,
  ModalHeader,
  ModalTitle,
  ModalContent,
  ModalFooter,
  Button,
  Input,
  TextArea,
  Select,
  SelectItem,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Typography,
  Badge,
  Grid,
  Switch,
  Form,
  FormField
} from '@taskflow/ui';
import {
  PlusIcon,
  TrashIcon,
  DocumentTextIcon,
  TagIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';

interface TemplateFormProps {
  mode: 'create' | 'edit';
  template?: BoardTemplate;
  onClose: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ mode, template, onClose }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { isCreating, isUpdating } = useAppSelector(state => state.boardTemplates);

  const [formData, setFormData] = useState<CreateBoardTemplateRequest>({
    name: '',
    description: '',
    categories: ['General'],
    defaultLists: [],
    defaultCards: [],
    tags: [],
    isPublic: true,
    isActive: true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState(''); // Add state for tag input

  useEffect(() => {
    if (template && mode === 'edit') {
      setFormData({
        name: template.name,
        description: template.description,
        categories: template.categories,
        defaultLists: template.defaultLists,
        defaultCards: template.defaultCards,
        tags: template.tags,
        isPublic: template.isPublic,
        isActive: template.isActive
      });
    }
  }, [template, mode]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Template name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Template description is required';
    }

    if (formData.categories.length === 0) {
      newErrors.categories = 'At least one category is required';
    }

    if (formData.defaultLists.length === 0) {
      newErrors.defaultLists = 'At least one list is required';
    }

    // Validate lists have sequential order
    const listOrders = formData.defaultLists.map(list => list.order).sort((a, b) => a - b);
    for (let i = 0; i < listOrders.length; i++) {
      if (listOrders[i] !== i) {
        newErrors.defaultLists = 'List orders must be sequential starting from 0';
        break;
      }
    }

    // Validate cards reference valid lists
    if (formData.defaultCards.length > 0) {
      const validListTitles = formData.defaultLists.map(list => list.title);
      const invalidCards = formData.defaultCards.filter(card => 
        !validListTitles.includes(card.listId)
      );
      
      if (invalidCards.length > 0) {
        newErrors.defaultCards = 'All cards must reference valid list titles';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📝 Form data:', formData);
    console.log('🔍 Current errors:', errors);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      console.log('📋 Validation errors:', errors);
      return;
    }
    
    console.log('✅ Form validation passed, proceeding with submission');

    try {
      if (mode === 'create') {
        console.log('➕ Creating new template...');
        await dispatch(createBoardTemplate(formData)).unwrap();
        console.log('✅ Template created successfully');
        onClose(); // Close the modal using the prop
      } else if (template) {
        console.log('✏️ Updating existing template...');
        await dispatch(updateBoardTemplate({ id: template.id, templateData: formData })).unwrap();
        console.log('✅ Template updated successfully');
        onClose(); // Close the modal using the prop
      }
    } catch (error) {
      console.error('❌ Failed to save template:', error);
    }
  };

  const handleInputChange = (field: keyof CreateBoardTemplateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addList = () => {
    const newList: BoardTemplateList = {
      id: `list-${Date.now()}`,
      title: '',
      order: formData.defaultLists.length,
      color: LIST_COLORS[formData.defaultLists.length % LIST_COLORS.length]
    };
    setFormData(prev => ({
      ...prev,
      defaultLists: [...prev.defaultLists, newList]
    }));
  };

  const updateList = (index: number, field: keyof BoardTemplateList, value: any) => {
    const updatedLists = [...formData.defaultLists];
    updatedLists[index] = { ...updatedLists[index], [field]: value };
    
    // Reorder lists if order changed
    if (field === 'order') {
      updatedLists.sort((a, b) => a.order - b.order);
      updatedLists.forEach((list, idx) => {
        list.order = idx;
      });
    }
    
    setFormData(prev => ({ ...prev, defaultLists: updatedLists }));
  };

  const removeList = (index: number) => {
    const updatedLists = formData.defaultLists.filter((_, i) => i !== index);
    // Reorder remaining lists
    updatedLists.forEach((list, idx) => {
      list.order = idx;
    });
    
    // Remove cards that reference the deleted list
    const removedListTitle = formData.defaultLists[index].title;
    const updatedCards = formData.defaultCards.filter(card => card.listId !== removedListTitle);
    
    setFormData(prev => ({
      ...prev,
      defaultLists: updatedLists,
      defaultCards: updatedCards
    }));
  };

  const addCard = () => {
    if (formData.defaultLists.length === 0) return;
    
    const newCard: BoardTemplateCard = {
      title: '',
      description: '',
      listId: formData.defaultLists[0].title,
      order: formData.defaultCards.filter(card => card.listId === formData.defaultLists[0].title).length,
      priority: 'medium',
      estimatedHours: 0,
      tags: []
    };
    
    setFormData(prev => ({
      ...prev,
      defaultCards: [...prev.defaultCards, newCard]
    }));
  };

  const updateCard = (index: number, field: keyof BoardTemplateCard, value: any) => {
    const updatedCards = [...formData.defaultCards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    
    // Reorder cards if order changed
    if (field === 'order') {
      const listId = updatedCards[index].listId;
      const cardsInList = updatedCards.filter(card => card.listId === listId);
      cardsInList.sort((a, b) => a.order - b.order);
      cardsInList.forEach((card, idx) => {
        card.order = idx;
      });
    }
    
    setFormData(prev => ({ ...prev, defaultCards: updatedCards }));
  };

  const removeCard = (index: number) => {
    const updatedCards = formData.defaultCards.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, defaultCards: updatedCards }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const loadDefaultTemplate = (defaultTemplate: Partial<CreateBoardTemplateRequest>) => {
    setFormData(prev => ({
      ...prev,
      ...defaultTemplate
    }));
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Modal isOpen={true} onClose={onClose} size="6xl">
      <ModalHeader>
        <ModalTitle>
          {mode === 'create' ? 'Create Board Template' : 'Edit Board Template'}
        </ModalTitle>
      </ModalHeader>
      
      <form onSubmit={handleSubmit}>
        <ModalContent>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Template Name"
                  error={errors.name}
                  required
                >
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Marketing Plan, Agile Sprint"
                  />
                </FormField>

                <FormField
                  label="Description"
                  error={errors.description}
                  required
                >
                  <TextArea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this template is for and when to use it"
                    rows={3}
                  />
                </FormField>

                <FormField
                  label="Categories"
                  error={errors.categories}
                  required
                >
                  <div className="flex flex-wrap gap-2">
                    {TEMPLATE_CATEGORIES.map(category => (
                      <Button
                        key={category}
                        variant={formData.categories.includes(category) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const newCategories = formData.categories.includes(category)
                            ? formData.categories.filter(c => c !== category)
                            : [...formData.categories, category];
                          handleInputChange('categories', newCategories);
                        }}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Tags">
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add a tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(tagInput);
                            setTagInput('');
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (tagInput) {
                            addTag(tagInput);
                            setTagInput('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FormField>

                <div className="flex items-center space-x-6">
                  <FormField label="Public Template">
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                    />
                  </FormField>
                  
                  <FormField label="Active">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Default Lists */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Default Lists</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addList}
                    disabled={formData.defaultLists.length >= 20}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {errors.defaultLists && (
                  <Typography variant="body-small" className="text-red-600 mb-4">
                    {errors.defaultLists}
                  </Typography>
                )}
                
                <div className="space-y-3">
                  {formData.defaultLists.map((list, index) => (
                    <div key={list.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="w-8 text-center text-sm text-muted-foreground">
                        {list.order}
                      </div>
                      
                      <Input
                        value={list.title}
                        onChange={(e) => updateList(index, 'title', e.target.value)}
                        placeholder="List title"
                        className="flex-1"
                      />
                      
                      <div className="w-20">
                        <Input
                          type="color"
                          value={list.color}
                          onChange={(e) => updateList(index, 'color', e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeList(index)}
                        disabled={formData.defaultLists.length === 1}
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Default Cards */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Default Cards (Optional)</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCard}
                    disabled={formData.defaultLists.length === 0}
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {errors.defaultCards && (
                  <Typography variant="body-small" className="text-red-600 mb-4">
                    {errors.defaultCards}
                  </Typography>
                )}
                
                <div className="space-y-4">
                  {formData.defaultCards.map((card, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Title" required>
                          <Input
                            value={card.title}
                            onChange={(e) => updateCard(index, 'title', e.target.value)}
                            placeholder="Card title"
                          />
                        </FormField>
                        
                        <FormField label="List">
                          <Select
                            value={card.listId}
                            onChange={(value) => updateCard(index, 'listId', value)}
                          >
                            {formData.defaultLists.map(list => (
                              <SelectItem key={list.title} value={list.title}>
                                {list.title}
                              </SelectItem>
                            ))}
                          </Select>
                        </FormField>
                      </div>
                      
                      <FormField label="Description">
                        <TextArea
                          value={card.description}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateCard(index, 'description', e.target.value)}
                          placeholder="Card description"
                          rows={2}
                        />
                      </FormField>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <FormField label="Priority">
                          <Select
                            value={card.priority}
                            onChange={(value) => updateCard(index, 'priority', value)}
                          >
                            {PRIORITY_OPTIONS.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: option.color }}
                                  />
                                  <span>{option.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </Select>
                        </FormField>
                        
                        <FormField label="Estimated Hours">
                          <Input
                            type="number"
                            min="0"
                            value={card.estimatedHours}
                            onChange={(e) => updateCard(index, 'estimatedHours', parseFloat(e.target.value) || 0)}
                          />
                        </FormField>
                        
                        <FormField label="Order">
                          <Input
                            type="number"
                            min="0"
                            value={card.order}
                            onChange={(e) => updateCard(index, 'order', parseInt(e.target.value) || 0)}
                          />
                        </FormField>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCard(index)}
                        >
                          <TrashIcon className="w-4 h-4 mr-2" />
                          Remove Card
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Templates */}
            {mode === 'create' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>Quick Templates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Typography variant="body-medium" className="text-muted-foreground mb-4">
                    Start with a pre-built template and customize it to your needs
                  </Typography>
                  
                  <Grid cols={2} className="gap-4">
                    {DEFAULT_TEMPLATES.map((defaultTemplate, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 text-left"
                        onClick={() => loadDefaultTemplate(defaultTemplate)}
                      >
                        <div>
                          <Typography variant="body-medium" className="font-medium mb-1">
                            {defaultTemplate.name}
                          </Typography>
                          <Typography variant="body-small" className="text-muted-foreground">
                            {defaultTemplate.description}
                          </Typography>
                        </div>
                      </Button>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </div>
        </ModalContent>
        
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Template' : 'Update Template')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default TemplateForm;
