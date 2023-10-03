import { Controller, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from '@/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from '@/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from '@/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
    constructor(
        private readonly mailService: MailService,
        private mailerService: MailerService,
        @InjectModel(Subscriber.name)
        private subscriberModel: SoftDeleteModel<SubscriberDocument>,
        @InjectModel(Job.name)
        private jobModel: SoftDeleteModel<JobDocument>,
    ) {}

    @Get()
    @Public()
    @ResponseMessage('Test email')
    @Cron('0 10 0 * * 0')
    async handleTestEmail() {
        const subscribers = await this.subscriberModel.find({});
        for (const subs of subscribers) {
            const subSkills = subs.skills;
            const jobWithMatchSkills = await this.jobModel.find({ skills: { $in: subSkills } });

            if (jobWithMatchSkills?.length) {
                const jobs = jobWithMatchSkills.map((item) => {
                    return {
                        name: item.name,
                        company: item.company.name,
                        salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
                        skills: item.skills,
                    };
                });
                await this.mailerService.sendMail({
                    to: 'phananhloc03102001@gmail.com',
                    from: '"Support Team" <support@example.com>', // override default from
                    subject: 'Welcome to Nice App! Confirm your Email',
                    template: 'new-job',
                    context: {
                        receiver: subs.name,
                        jobs: jobs,
                    },
                });
            }
        }
    }
}
