import { calculateAgeString } from '@medplum/core';
import { Patient, Reference } from '@medplum/fhirtypes';
import { HumanNameDisplay, MedplumLink, ResourceAvatar, Scrollable, useResource } from '@medplum/react';
import React from 'react';

import './PatientHeader.css';

export interface PatientHeaderProps {
  patient: Patient | Reference<Patient>;
}

export function PatientHeader(props: PatientHeaderProps): JSX.Element | null {
  const patient = useResource(props.patient);
  if (!patient) {
    return null;
  }
  return (
    <Scrollable className="medplum-surface" height={74}>
      <div className="medplum-patient-header">
        <ResourceAvatar value={patient} size="lg" radius="xl" />
        <dl>
          <dt>Name</dt>
          <dd>
            <MedplumLink to={patient}>
              {patient.name ? <HumanNameDisplay value={patient.name?.[0]} options={{ use: false }} /> : '[blank]'}
            </MedplumLink>
          </dd>
        </dl>
        {patient.birthDate && (
          <>
            <dl>
              <dt>DoB</dt>
              <dd>{patient.birthDate}</dd>
            </dl>
            <dl>
              <dt>Age</dt>
              <dd>{calculateAgeString(patient.birthDate)}</dd>
            </dl>
          </>
        )}
        {patient.gender && (
          <dl>
            <dt>Gender</dt>
            <dd>{patient.gender}</dd>
          </dl>
        )}
        {patient.address && (
          <>
            <dl>
              <dt>State</dt>
              <dd>{patient.address?.[0]?.state}</dd>
            </dl>
          </>
        )}
        {patient.identifier?.map((identifier, index) => (
          <dl key={`${index}-${patient.identifier?.length}`}>
            <dt>{identifier?.system}</dt>
            <dd>{identifier?.value}</dd>
          </dl>
        ))}
      </div>
    </Scrollable>
  );
}
