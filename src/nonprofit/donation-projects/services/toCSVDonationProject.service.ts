import { ICsvNonprofitDonationProject } from '@app/src/shared/interfaces'
import {
  DonationProjectReviewStatus,
  DonationProjectStatus,
} from '@app/src/nonprofit/donation-projects/enums'

export default function (donation_project: any): ICsvNonprofitDonationProject {
  return {
    'Donation project ID': donation_project.id,
    Name: donation_project.name,
    Introduction: donation_project.introduction,
    'Schedule status': donation_project.schedule_status || '',
    'Schedule date': donation_project.schedule_date || '',
    'Deadline status': donation_project.deadline_status || '',
    'Deadline date': donation_project.deadline_date || '',
    'Goal status': donation_project.goal_status || 'Not set',
    'Goal amount': donation_project.goal_amount || 'Not set',
    'Published date': donation_project.published_date || '',
    'Created date': donation_project.created_date || '',
    'Review status': DonationProjectReviewStatus[donation_project.review_status] || '',
    Status: DonationProjectStatus[donation_project.status] || '',
    'Total donations': donation_project.total_donations || 0,
    'Total donors': donation_project.total_donors || 0,
  }
}
