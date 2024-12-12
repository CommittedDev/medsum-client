import { formatCoding } from '@medplum/core';
import { Coding } from '@medplum/fhirtypes';
import { i18n } from 'src/i18n';

export interface CodingDisplayProps {
  readonly value?: Coding;
}

export function CodingDisplay(props: CodingDisplayProps): JSX.Element {
  return <>{i18n(formatCoding(props.value))}</>;
}
