import { Communication } from '@medplum/fhirtypes';
import { DoctorSummaryItem, DoctorSummaryItemProps } from '../../DoctorSummary/DoctorSummary';
import classes from '../ResourceDoctorSummary.module.css';

export const CommunicationDoctorSummaryItem = (props: DoctorSummaryItemProps<Communication>): JSX.Element => {
  const routine = !props.resource.priority || props.resource.priority === 'routine';
  const className = routine ? undefined : classes.pinnedComment;
  return (
    <DoctorSummaryItem
      resource={props.resource}
      profile={props.resource.sender}
      dateTime={props.resource.sent}
      padding={true}
      className={className}
      popupMenuItems={props.popupMenuItems}
      showType={props.showType}
      setShowType={props.setShowType}
    >
      <p>{props.resource.payload?.[0]?.contentString}</p>
    </DoctorSummaryItem>
  );
};
