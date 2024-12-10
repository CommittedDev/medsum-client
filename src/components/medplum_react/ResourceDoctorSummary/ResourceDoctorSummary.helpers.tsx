import { Bundle, Resource } from '@medplum/fhirtypes';

export class ResourceDoctorSummaryHelper {
  static getProgressMessage(e: ProgressEvent): string {
    if (e.lengthComputable) {
      const percent = (100 * e.loaded) / e.total;
      return `Uploaded: ${ResourceDoctorSummaryHelper.formatFileSize(e.loaded)} / ${ResourceDoctorSummaryHelper.formatFileSize(e.total)} ${percent.toFixed(2)}%`;
    }
    return `Uploaded: ${ResourceDoctorSummaryHelper.formatFileSize(e.loaded)}`;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) {
      return '0.00 B';
    }
    const e = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, e)).toFixed(2) + ' ' + ' KMGTP'.charAt(e) + 'B';
  }

  static getPrevious(history: Bundle, version: Resource): Resource | undefined {
    const entries = history.entry ?? [];
    const index = entries.findIndex((entry) => entry.resource?.meta?.versionId === version.meta?.versionId);
    // If not found index is -1, -1 === 0 - 1 so this returns undefined
    if (index >= entries.length - 1) {
      return undefined;
    }
    return entries[index + 1].resource;
  }
}
