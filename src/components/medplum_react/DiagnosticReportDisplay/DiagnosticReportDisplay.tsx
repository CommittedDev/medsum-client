import { Group, List, Stack, Text, Title } from '@mantine/core';
import { capitalize, formatCodeableConcept, formatDateTime, formatObservationValue, isReference } from '@medplum/core';
import {
  Annotation,
  DiagnosticReport,
  Observation,
  ObservationComponent,
  ObservationReferenceRange,
  Reference,
  Resource,
  Specimen,
} from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/react-hooks';
import cx from 'clsx';
import { useEffect, useState } from 'react';
import { CodeableConceptDisplay } from '../CodeableConceptDisplay/CodeableConceptDisplay';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { NoteDisplay } from '../NoteDisplay/NoteDisplay';
import { RangeDisplay } from '../RangeDisplay/RangeDisplay';
import { ReferenceDisplay } from '../ReferenceDisplay/ReferenceDisplay';
import { ResourceBadge } from '../ResourceBadge/ResourceBadge';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import classes from './DiagnosticReportDisplay.module.css';
import { i18n } from 'src/i18n';
import { ResourceAiSummary, ShowType } from '../ResourceDoctorSummary/parts/ResourceAiSummary';

export interface DiagnosticReportDisplayProps {
  readonly value?: DiagnosticReport | Reference<DiagnosticReport>;
  readonly hideObservationNotes?: boolean;
  readonly hideSpecimenInfo?: boolean;
  readonly patientId?: string;
  showType: ShowType;
  readonly setShowType: (showType: ShowType) => void;
}

DiagnosticReportDisplay.defaultProps = {
  hideObservationNotes: false,
  hideSpecimenInfo: false,
} as DiagnosticReportDisplayProps;

export function DiagnosticReportDisplay(props: DiagnosticReportDisplayProps): JSX.Element | null {
  const { showType, setShowType } = props;
  const medplum = useMedplum();
  const diagnosticReport = useResource(props.value);
  const [specimens, setSpecimens] = useState<Specimen[]>();

  useEffect(() => {
    if (diagnosticReport?.specimen) {
      Promise.allSettled(diagnosticReport.specimen.map((ref) => medplum.readReference(ref)))
        .then((outcomes) =>
          outcomes
            .filter((outcome) => outcome.status === 'fulfilled')
            .map((outcome) => (outcome as PromiseFulfilledResult<Specimen>).value)
        )
        .then(setSpecimens)
        .catch(console.error);
    }
  }, [medplum, diagnosticReport]);

  if (!diagnosticReport) {
    // return <p>'Missing diagnostic report'</p>;
    return null;
  }

  const specimenNotes: Annotation[] = specimens?.flatMap((spec) => spec.note || []) || [];

  if (diagnosticReport.presentedForm && diagnosticReport.presentedForm.length > 0) {
    const pf = diagnosticReport.presentedForm[0];
    if (pf.contentType?.startsWith('text/plain') && pf.data) {
      specimenNotes.push({ text: window.atob(pf.data) });
    }
  }

  const aiView = props.patientId ? (
    <ResourceAiSummary
      resource={{ ...(diagnosticReport.result || diagnosticReport), specimenNotes }}
      patientId={props.patientId!}
      setShowType={setShowType}
      showType={showType}
      persistKeySuffix={diagnosticReport.result ? 'diagnostic-report' : ''}
    />
  ) : null;

  if (showType === 'onlySummary') {
    return aiView;
  }
  return (
    <>
      <Stack>
        <Title>{i18n('Diagnostic Report')}</Title>
        <DiagnosticReportHeader value={diagnosticReport} />
        {specimens && !props.hideSpecimenInfo && SpecimenInfo(specimens)}
        {diagnosticReport.result && (
          <>
            <p>{JSON.stringify(diagnosticReport.result)}</p>
            <ObservationTable hideObservationNotes={props.hideObservationNotes} value={diagnosticReport.result} />
          </>
        )}
        {specimenNotes.length > 0 && <NoteDisplay value={specimenNotes} />}
      </Stack>
      {aiView}
    </>
  );
}

interface DiagnosticReportHeaderProps {
  readonly value: DiagnosticReport;
}

function DiagnosticReportHeader({ value }: DiagnosticReportHeaderProps): JSX.Element {
  return (
    <Group mt="md" gap={30}>
      {value.subject && (
        <div>
          <Text size="xs" tt="uppercase" c="dimmed">
            {i18n('Subject')}
          </Text>
          <ResourceBadge value={value.subject} link={true} />
        </div>
      )}
      {value.resultsInterpreter?.map((interpreter) => (
        <div key={interpreter.reference}>
          <Text size="xs" tt="uppercase" c="dimmed">
            {i18n('Interpreter')}
          </Text>
          <ResourceBadge value={interpreter} link={true} />
        </div>
      ))}
      {value.performer?.map((performer) => (
        <div key={performer.reference}>
          <Text size="xs" tt="uppercase" c="dimmed">
            {i18n('Performer')}
          </Text>
          <ResourceBadge value={performer} link={true} />
        </div>
      ))}
      {value.issued && (
        <div>
          <Text size="xs" tt="uppercase" c="dimmed">
            {i18n('Issued')}
          </Text>
          <Text>{formatDateTime(value.issued)}</Text>
        </div>
      )}
      {value.status && (
        <div>
          <Text size="xs" tt="uppercase" c="dimmed">
            {i18n('Status')}
          </Text>
          <Text>{capitalize(value.status)}</Text>
        </div>
      )}
    </Group>
  );
}

function SpecimenInfo(specimens: Specimen[] | undefined): JSX.Element {
  return (
    <Stack gap="xs">
      <Title order={2} size="h6">
        {i18n('Specimens')}
      </Title>

      <List type="ordered">
        {specimens?.map((specimen) => (
          <List.Item ml="sm" key={`specimen-${specimen.id}`}>
            <Group gap={20}>
              <Group gap={5}>
                <Text fw={500}>{i18n('Collected:')}</Text> {formatDateTime(specimen.collection?.collectedDateTime)}
              </Group>
              <Group gap={5}>
                <Text fw={500}>{i18n('Received:')}</Text> {formatDateTime(specimen.receivedTime)}
              </Group>
            </Group>
          </List.Item>
        ))}
      </List>
    </Stack>
  );
}

export interface ObservationTableProps {
  readonly value?: Observation[] | Reference<Observation>[];
  readonly ancestorIds?: string[];
  readonly hideObservationNotes?: boolean;
}

export function ObservationTable(props: ObservationTableProps): JSX.Element {
  return (
    <table className={classes.table}>
      <thead>
        <tr>
          <th>{i18n('Test')}</th>
          <th>{i18n('Value')}</th>
          <th>{i18n('Reference Range')}</th>
          <th>{i18n('Interpretation')}</th>
          <th>{i18n('Category')}</th>
          <th>{i18n('Performer')}</th>
          <th>{i18n('Status')}</th>
        </tr>
      </thead>
      <tbody>
        <ObservationRowGroup
          value={props.value}
          ancestorIds={props.ancestorIds}
          hideObservationNotes={props.hideObservationNotes}
        />
      </tbody>
    </table>
  );
}

interface ObservationRowGroupProps {
  readonly value?: Observation[] | Reference<Observation>[];
  readonly ancestorIds?: string[];
  readonly hideObservationNotes?: boolean;
}

function ObservationRowGroup(props: ObservationRowGroupProps): JSX.Element {
  return (
    <>
      {props.value?.map((observation) => (
        <ObservationRow
          key={`obs-${isReference(observation) ? observation.reference : observation.id}`}
          value={observation}
          ancestorIds={props.ancestorIds}
          hideObservationNotes={props.hideObservationNotes}
        />
      ))}
    </>
  );
}

interface ObservationRowProps {
  readonly value: Observation | Reference<Observation>;
  readonly ancestorIds?: string[];
  readonly hideObservationNotes?: boolean;
}

function ObservationRow(props: ObservationRowProps): JSX.Element | null {
  const observation = useResource(props.value);

  if (!observation || props.ancestorIds?.includes(observation.id as string)) {
    return null;
  }

  const displayNotes = !props.hideObservationNotes && observation.note;

  const critical = isCritical(observation);

  return (
    <>
      <tr className={cx({ [classes.criticalRow]: critical })}>
        <td rowSpan={displayNotes ? 2 : 1}>
          <MedplumLink to={observation}>
            <CodeableConceptDisplay value={observation.code} />
          </MedplumLink>
        </td>
        <td>
          <ObservationValueDisplay value={observation} />
        </td>
        <td>
          <ReferenceRangeDisplay value={observation.referenceRange} />
        </td>
        <td>
          {observation.interpretation && observation.interpretation.length > 0 && (
            <CodeableConceptDisplay value={observation.interpretation[0]} />
          )}
        </td>
        <td>
          {observation.category && observation.category.length > 0 && (
            <>
              {observation.category.map((concept) => (
                <div key={`category-${formatCodeableConcept(concept)}`}>
                  <CodeableConceptDisplay value={concept} />
                </div>
              ))}
            </>
          )}
        </td>
        <td>
          {observation.performer?.map((performer) => <ReferenceDisplay key={performer.reference} value={performer} />)}
        </td>
        <td>{observation.status && <StatusBadge status={observation.status} />}</td>
      </tr>
      {observation.hasMember && (
        <ObservationRowGroup
          value={observation.hasMember as Reference<Observation>[]}
          ancestorIds={
            props.ancestorIds ? [...props.ancestorIds, observation.id as string] : [observation.id as string]
          }
          hideObservationNotes={props.hideObservationNotes}
        />
      )}
      {displayNotes && (
        <tr>
          <td colSpan={6}>
            <NoteDisplay value={observation.note} />
          </td>
        </tr>
      )}
    </>
  );
}

interface ObservationValueDisplayProps {
  readonly value?: Observation | ObservationComponent;
}

function ObservationValueDisplay(props: ObservationValueDisplayProps): JSX.Element | null {
  const obs = props.value;
  return <>{i18n(formatObservationValue(obs))}</>;
}

interface ReferenceRangeProps {
  readonly value?: ObservationReferenceRange[];
}

function ReferenceRangeDisplay(props: ReferenceRangeProps): JSX.Element | null {
  const range = props.value && props.value.length > 0 && props.value[0];
  if (!range) {
    return null;
  }
  if (range.text) {
    return <>{range.text}</>;
  }
  return <RangeDisplay value={range} />;
}

/**
 * Returns true if the observation is critical.
 * See: https://www.hl7.org/fhir/valueset-observation-interpretation.html
 * @param observation - The FHIR observation.
 * @returns True if the FHIR observation is a critical value.
 */
function isCritical(observation: Observation): boolean {
  const code = observation.interpretation?.[0]?.coding?.[0]?.code;
  return code === 'AA' || code === 'LL' || code === 'HH' || code === 'A';
}
