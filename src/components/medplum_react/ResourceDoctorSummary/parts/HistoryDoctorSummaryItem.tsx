import { ResourceDiffTable } from '../../ResourceDiffTable/ResourceDiffTable';
import { ResourceTable } from '../../ResourceTable/ResourceTable';
import { DoctorSummaryItem } from '../../DoctorSummary/DoctorSummary';
import { HistoryDoctorSummaryItemProps } from '../ResourceDoctorSummary.types';
import { ResourceDoctorSummaryHelper } from '../ResourceDoctorSummary.helpers';
import { i18n } from 'src/i18n';
import { useState } from 'react';
import { ShowType } from './ResourceAiSummary';

export const HistoryDoctorSummaryItem = (props: HistoryDoctorSummaryItemProps): JSX.Element => {
  const { history, resource, showType, setShowType, ...rest } = props;
  const previous = ResourceDoctorSummaryHelper.getPrevious(history, resource);

  if (previous) {
    return (
      <DoctorSummaryItem resource={resource} padding={true} {...rest} showType={showType} setShowType={setShowType}>
        <ResourceDiffTable original={previous} revised={props.resource} />
      </DoctorSummaryItem>
    );
  } else {
    return (
      <DoctorSummaryItem resource={resource} padding={true} {...rest} showType={showType} setShowType={setShowType}>
        <ResourceTable
          value={resource}
          ignoreMissingValues
          forceUseInput
          patientId={props.patientId}
          showType={showType}
          setShowType={setShowType}
        />
      </DoctorSummaryItem>
    );
  }
};
