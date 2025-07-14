import { ICsvDonationProject } from '@app/src/shared/interfaces'
import {
  PostingStatus,
  DonationProjectStatus,
  DonationProjectReviewStatus,
} from '@app/src/nonprofit/donation-projects/enums'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

export default function (donationProject: DonationProjectEntity): ICsvDonationProject {
  return {
    'Donation project ID': donationProject.id,
    Name: donationProject.name,
    Introduction: donationProject.introduction,
    'Schedule status': PostingStatus[donationProject.is_schedule],
    'Schedule date': donationProject.schedule_date,
    'Deadline status': PostingStatus[donationProject.is_deadline_enabled],
    'Deadline date': donationProject.deadline_date,
    'Goal status': PostingStatus[donationProject.is_goal_set],
    'Goal amount': donationProject.goal_amount,
    Tags: donationProject.tags ? donationProject.tags.map((tag) => tag.name).join(', ') : null,
    'Admin memo': donationProject.admin_memo,
    'Published date': donationProject.published_date,
    'Created date': donationProject.created,
    'Review status': DonationProjectReviewStatus[donationProject.review_status],
    Status: DonationProjectStatus[donationProject.status],
    'Total donation': donationProject.total_donations,
    'Gross donation': donationProject.gross_donations,
    'Total donor': donationProject.total_donors,
    'Total deal donation': donationProject.total_deal_donations,
    'Total direct donation': donationProject.total_direct_donations,
    'Total RE2 donation': donationProject.total_re2_donations,
  }
}
