import { Menu, Select } from '@mantine/core';
import { Resource, ResourceType } from '@medplum/fhirtypes';
import { useEffect, useState } from 'react';
import { readPersistStateGetInitialValue, usePersistStateOnValueChange } from '../../utils/use_persist';

export interface IResourceTemplateItem {
  type: 'resource';
  resourceType: ResourceType;
  count: number; // number of items to look at the resources items until they match
}

export type ITemplateItem = IResourceTemplateItem;
export interface ITemplate {
  id: string;
  label: string;
  template: {
    title: string;
    image: string;
    items: ITemplateItem[];
  };
}

const templates: ITemplate[] = [
  {
    id: 'shamir',
    label: 'מכתב שחרור -  המרכז הרפואי שמיר',
    template: {
      title: 'מכתב שחרור',
      image: 'https://www.shamir.org/media/jrpp25ha/logo.png',
      items: [
        {
          type: 'resource',
          resourceType: 'Patient',
          count: 1,
        },
        {
          type: 'resource',
          resourceType: 'DiagnosticReport',
          count: 3,
        },
      ],
    },
  },
  {
    id: 'assuta',
    label: 'אסותא - מכתב שחרור',
    template: {
      title: 'מכתב שחרור',
      image: 'https://www.assuta.co.il/images/assuta-logo.svg',
      items: [
        // {
        //   type: 'resource',
        //   resourceType: 'Patient',
        //   count: 1,
        // },
        {
          type: 'resource',
          resourceType: 'Device',
          count: 1,
        },
        {
          type: 'resource',
          resourceType: 'Device',
          count: 1,
        },
      ],
    },
  },
];

export const DoctorSummaryTemplates = ({
  patientId,
  onTemplateChange,
}: {
  patientId: string;
  onTemplateChange: (template: ITemplate) => void;
}) => {
  const persistKey = `doctor-summary-template-id-${patientId}`;
  const initialValue = readPersistStateGetInitialValue({ key: persistKey, currentValue: templates[0].id });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialValue);
  usePersistStateOnValueChange({ key: persistKey, updateValue: selectedTemplateId });

  useEffect(() => {
    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
    if (selectedTemplate) {
      onTemplateChange(selectedTemplate);
    }
  }, [selectedTemplateId]);

  useEffect(() => {
    const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);
    if (selectedTemplate) {
      onTemplateChange(selectedTemplate);
    }
  }, []);

  return (
    <Select
      placeholder="בחר תבנית"
      data={templates.map((template) => ({
        value: template.id,
        label: template.label,
        image: template.template.image,
        description: template.template.title,
      }))}
      onChange={(value) => {
        setSelectedTemplateId(value as string);
      }}
      value={selectedTemplateId}
    />
  );
};
