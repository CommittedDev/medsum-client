import { ResourceDiffTable } from '../../ResourceDiffTable/ResourceDiffTable';
import { ResourceTable } from '../../ResourceTable/ResourceTable';
import { DoctorSummaryItem } from '../../DoctorSummary/DoctorSummary';
import { HistoryDoctorSummaryItemProps } from '../ResourceDoctorSummary.types';
import { ResourceDoctorSummaryHelper } from '../ResourceDoctorSummary.helpers';

export const HistoryDoctorSummaryItem = (props: HistoryDoctorSummaryItemProps): JSX.Element => {
  const { history, resource, ...rest } = props;
  const previous = ResourceDoctorSummaryHelper.getPrevious(history, resource);
  if (previous) {
    return (
      <DoctorSummaryItem resource={resource} padding={true} {...rest}>
        <ResourceDiffTable original={previous} revised={props.resource} />
      </DoctorSummaryItem>
    );
  } else {
    return (
      <DoctorSummaryItem resource={resource} padding={true} {...rest}>
        <h3>Created</h3>
        <ResourceTable value={resource} ignoreMissingValues forceUseInput />
      </DoctorSummaryItem>
    );
  }
};
