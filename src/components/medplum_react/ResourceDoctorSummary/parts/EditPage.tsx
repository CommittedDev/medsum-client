import { showNotification } from '@mantine/notifications';
import { deepClone, normalizeErrorString, normalizeOperationOutcome } from '@medplum/core';
import { OperationOutcome, Resource, ResourceType } from '@medplum/fhirtypes';
import { Document, ResourceForm, useMedplum } from '@medplum/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPatch } from 'rfc6902';
import { cleanResource } from './utils';

export function EditPage({
  resourceType,
  id,
  value,
  onSave,
}: {
  resourceType: ResourceType;
  id: string;
  value: Resource;
  onSave: (updatedValue: Resource) => void;
}): JSX.Element | null {
  const medplum = useMedplum();
  const [original, setOriginal] = useState<Resource | undefined>();
  const navigate = useNavigate();
  const [outcome, setOutcome] = useState<OperationOutcome | undefined>();

  const handleSubmit = (newResource: Resource): void => {
    setOutcome(undefined);
    onSave(cleanResource(newResource));
  };

  if (!value) {
    return <p>missing value</p>;
  }

  return (
    <Document>
      <ResourceForm defaultValue={value} onSubmit={handleSubmit} outcome={outcome} />
    </Document>
  );
}
