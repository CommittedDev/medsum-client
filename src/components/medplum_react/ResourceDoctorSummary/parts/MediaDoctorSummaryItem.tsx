import { Media } from '@medplum/fhirtypes';
import { AttachmentDisplay } from '../../AttachmentDisplay/AttachmentDisplay';
import { DoctorSummaryItem, DoctorSummaryItemProps } from '../../DoctorSummary/DoctorSummary';

export const MediaDoctorSummaryItem = (props: DoctorSummaryItemProps<Media>): JSX.Element => {
  const contentType = props.resource.content?.contentType;
  const padding =
    contentType &&
    !contentType.startsWith('image/') &&
    !contentType.startsWith('video/') &&
    contentType !== 'application/pdf';
  return (
    <DoctorSummaryItem resource={props.resource} padding={!!padding} popupMenuItems={props.popupMenuItems}>
      <AttachmentDisplay value={props.resource.content} />
    </DoctorSummaryItem>
  );
};
