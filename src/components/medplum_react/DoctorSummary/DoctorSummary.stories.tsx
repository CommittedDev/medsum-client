import { createReference } from '@medplum/core';
import { DrAliceSmith } from '@medplum/mock';
import { Meta } from '@storybook/react';
import { DoctorSummary, DoctorSummaryItem } from './DoctorSummary';

export default {
  title: 'Medplum/DoctorSummary',
  component: DoctorSummary,
} as Meta;

const author = createReference(DrAliceSmith);

export const Basic = (): JSX.Element => (
  <DoctorSummary>
    <DoctorSummaryItem
      profile={author}
      resource={{
        resourceType: 'Communication',
        id: '123',
        meta: { lastUpdated: '2021-01-01T12:00:00Z' },
        status: 'completed',
      }}
    >
      <div style={{ padding: '2px 16px' }}>
        <p>Hello world</p>
      </div>
    </DoctorSummaryItem>
    <DoctorSummaryItem
      profile={author}
      resource={{
        resourceType: 'Media',
        id: '123',
        meta: { lastUpdated: '2021-01-01T12:00:00Z' },
        status: 'completed',
        content: { url: 'https://www.medplum.com/img/wikimedia-papercut.jpg' },
      }}
    >
      <img src="https://www.medplum.com/img/wikimedia-papercut.jpg" alt="Papercut" title="Papercut" />
    </DoctorSummaryItem>
    <DoctorSummaryItem
      profile={author}
      resource={{
        resourceType: 'Media',
        id: '123',
        meta: { lastUpdated: '2021-01-01T12:00:00Z' },
        status: 'completed',
        content: { url: 'https://www.medplum.com/img/beat-boxing-mri.mp4' },
      }}
    >
      <video src="https://www.medplum.com/img/beat-boxing-mri.mp4" controls autoPlay muted></video>
    </DoctorSummaryItem>
  </DoctorSummary>
);
