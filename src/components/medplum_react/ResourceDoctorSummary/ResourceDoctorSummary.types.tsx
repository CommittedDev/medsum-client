import { MedplumClient, ProfileResource } from '@medplum/core';
import { Attachment, Bundle, Communication, Media, Reference, Resource, ResourceType } from '@medplum/fhirtypes';
import { ReactNode } from 'react';
import { DoctorSummaryItemProps } from '../DoctorSummary/DoctorSummary';

export interface ResourceDoctorSummaryMenuItemContext {
  readonly primaryResource: Resource;
  readonly currentResource: Resource;
  readonly reloadDoctorSummary: () => void;
}

export interface ResourceDoctorSummaryProps<T extends Resource> {
  readonly value: T | Reference<T>;
  readonly patientId: string;
  readonly loadDoctorSummaryResources: (
    medplum: MedplumClient,
    resourceType: ResourceType,
    id: string
  ) => Promise<PromiseSettledResult<any>[]>;
  readonly createCommunication?: (resource: T, sender: ProfileResource, text: string) => Communication;
  readonly createMedia?: (resource: T, operator: ProfileResource, attachment: Attachment) => Media;
  readonly getMenu?: (context: ResourceDoctorSummaryMenuItemContext) => ReactNode;
}

export interface HistoryDoctorSummaryItemProps extends DoctorSummaryItemProps {
  readonly history: Bundle;
}
