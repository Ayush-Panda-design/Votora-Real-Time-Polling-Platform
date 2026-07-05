import cron from 'node-cron';
import Poll from '../models/Poll.js';
import { POLL_STATUS } from '../constants/index.js';
import { emitPollExpired } from '../services/socket.service.js';


const startExpiryJob = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

     
      const expiredPolls = await Poll.find({
        status: POLL_STATUS.ACTIVE,
        expiresAt: { $lte: now },
      });

      if (expiredPolls.length > 0) {
        const ids = expiredPolls.map((p) => p._id);

        await Poll.updateMany(
          { _id: { $in: ids } },
          { $set: { status: POLL_STATUS.EXPIRED } }
        );

    
        expiredPolls.forEach((poll) => {
          emitPollExpired(poll._id.toString(), poll.createdBy?.toString());
          console.log(`⏰ Poll expired: ${poll.title} (${poll.pollCode})`);
        });
      }
    } catch (err) {
      console.error('Expiry cron job error:', err.message);
    }
  });

  console.log(' Poll expiry cron job started');
};

export default startExpiryJob;
