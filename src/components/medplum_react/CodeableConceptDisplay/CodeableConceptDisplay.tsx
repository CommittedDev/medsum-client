import { formatCodeableConcept } from '@medplum/core';
import { CodeableConcept } from '@medplum/fhirtypes';
import { i18n } from 'src/i18n';

export interface CodeableConceptDisplayProps {
  readonly value?: CodeableConcept;
}

export function CodeableConceptDisplay(props: CodeableConceptDisplayProps): JSX.Element {
  return <>{i18n(formatCodeableConcept(props.value))}</>;
}
