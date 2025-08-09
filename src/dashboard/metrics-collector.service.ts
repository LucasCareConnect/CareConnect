import { Injectable, Logger } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { MetricType } from './entities/dashboard-metric.entity';

@Injectable()
export class MetricsCollectorService {
  private readonly logger = new Logger(MetricsCollectorService.name);

  constructor(private readonly dashboardService: DashboardService) {}

  // User metrics
  async recordUserRegistration(
    userId: number,
    userType: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.USER_REGISTRATION,
        userId,
        userId,
        'user',
        1,
        undefined,
        { userType, ...metadata },
      );
      this.logger.log(`User registration metric recorded for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to record user registration metric: ${error.message}`,
      );
    }
  }

  async recordUserLogin(
    userId: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.USER_LOGIN,
        userId,
        userId,
        'user',
        1,
        undefined,
        metadata,
      );
      this.logger.debug(`User login metric recorded for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to record user login metric: ${error.message}`);
    }
  }

  // Appointment metrics
  async recordAppointmentCreated(
    appointmentId: number,
    familyUserId: number,
    caregiverId: number,
    amount?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Record for family user
      await this.dashboardService.recordMetric(
        MetricType.APPOINTMENT_CREATED,
        familyUserId,
        appointmentId,
        'appointment',
        1,
        amount,
        { role: 'family', caregiverId, ...metadata },
      );

      // Record for caregiver
      await this.dashboardService.recordMetric(
        MetricType.APPOINTMENT_CREATED,
        caregiverId,
        appointmentId,
        'appointment',
        1,
        amount,
        { role: 'caregiver', familyUserId, ...metadata },
      );

      this.logger.log(
        `Appointment created metric recorded for appointment ${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record appointment created metric: ${error.message}`,
      );
    }
  }

  async recordAppointmentCompleted(
    appointmentId: number,
    familyUserId: number,
    caregiverId: number,
    amount?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Record for family user
      await this.dashboardService.recordMetric(
        MetricType.APPOINTMENT_COMPLETED,
        familyUserId,
        appointmentId,
        'appointment',
        1,
        amount,
        { role: 'family', caregiverId, ...metadata },
      );

      // Record for caregiver
      await this.dashboardService.recordMetric(
        MetricType.APPOINTMENT_COMPLETED,
        caregiverId,
        appointmentId,
        'appointment',
        1,
        amount,
        { role: 'caregiver', familyUserId, ...metadata },
      );

      this.logger.log(
        `Appointment completed metric recorded for appointment ${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record appointment completed metric: ${error.message}`,
      );
    }
  }

  async recordAppointmentCancelled(
    appointmentId: number,
    familyUserId: number,
    caregiverId: number,
    cancelledBy: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Record for family user
      await this.dashboardService.recordMetric(
        MetricType.APPOINTMENT_CANCELLED,
        familyUserId,
        appointmentId,
        'appointment',
        1,
        undefined,
        { role: 'family', caregiverId, cancelledBy, ...metadata },
      );

      // Record for caregiver
      await this.dashboardService.recordMetric(
        MetricType.APPOINTMENT_CANCELLED,
        caregiverId,
        appointmentId,
        'appointment',
        1,
        undefined,
        { role: 'caregiver', familyUserId, cancelledBy, ...metadata },
      );

      this.logger.log(
        `Appointment cancelled metric recorded for appointment ${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record appointment cancelled metric: ${error.message}`,
      );
    }
  }

  // Payment metrics
  async recordPaymentCompleted(
    paymentId: number,
    userId: number,
    recipientId: number,
    amount: number,
    currency: string = 'BRL',
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Record for payer
      await this.dashboardService.recordMetric(
        MetricType.PAYMENT_COMPLETED,
        userId,
        paymentId,
        'payment',
        1,
        amount,
        { role: 'payer', recipientId, currency, ...metadata },
      );

      // Record for recipient
      await this.dashboardService.recordMetric(
        MetricType.PAYMENT_COMPLETED,
        recipientId,
        paymentId,
        'payment',
        1,
        amount,
        { role: 'recipient', payerId: userId, currency, ...metadata },
      );

      this.logger.log(
        `Payment completed metric recorded for payment ${paymentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record payment completed metric: ${error.message}`,
      );
    }
  }

  async recordPaymentFailed(
    paymentId: number,
    userId: number,
    amount: number,
    currency: string = 'BRL',
    reason?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.PAYMENT_FAILED,
        userId,
        paymentId,
        'payment',
        1,
        amount,
        { currency, reason, ...metadata },
      );

      this.logger.log(
        `Payment failed metric recorded for payment ${paymentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record payment failed metric: ${error.message}`,
      );
    }
  }

  // Chat metrics
  async recordMessageSent(
    messageId: number,
    senderId: number,
    conversationId: number,
    messageType: string = 'text',
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.MESSAGE_SENT,
        senderId,
        messageId,
        'message',
        1,
        undefined,
        { conversationId, messageType, ...metadata },
      );

      this.logger.debug(
        `Message sent metric recorded for message ${messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record message sent metric: ${error.message}`,
      );
    }
  }

  async recordConversationCreated(
    conversationId: number,
    createdBy: number,
    conversationType: string,
    participantCount: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.CONVERSATION_CREATED,
        createdBy,
        conversationId,
        'conversation',
        1,
        undefined,
        { conversationType, participantCount, ...metadata },
      );

      this.logger.log(
        `Conversation created metric recorded for conversation ${conversationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record conversation created metric: ${error.message}`,
      );
    }
  }

  // Review metrics
  async recordReviewCreated(
    reviewId: number,
    familyUserId: number,
    caregiverId: number,
    rating: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Record for family user
      await this.dashboardService.recordMetric(
        MetricType.REVIEW_CREATED,
        familyUserId,
        reviewId,
        'review',
        1,
        rating,
        { role: 'reviewer', caregiverId, rating, ...metadata },
      );

      // Record for caregiver
      await this.dashboardService.recordMetric(
        MetricType.REVIEW_CREATED,
        caregiverId,
        reviewId,
        'review',
        1,
        rating,
        { role: 'reviewed', familyUserId, rating, ...metadata },
      );

      this.logger.log(`Review created metric recorded for review ${reviewId}`);
    } catch (error) {
      this.logger.error(
        `Failed to record review created metric: ${error.message}`,
      );
    }
  }

  // Caregiver metrics
  async recordCaregiverApproved(
    caregiverId: number,
    approvedBy: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.CAREGIVER_APPROVED,
        caregiverId,
        caregiverId,
        'caregiver',
        1,
        undefined,
        { approvedBy, ...metadata },
      );

      this.logger.log(
        `Caregiver approved metric recorded for caregiver ${caregiverId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record caregiver approved metric: ${error.message}`,
      );
    }
  }

  // Notification metrics
  async recordNotificationSent(
    notificationId: number,
    userId: number,
    notificationType: string,
    channel: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.NOTIFICATION_SENT,
        userId,
        notificationId,
        'notification',
        1,
        undefined,
        { notificationType, channel, ...metadata },
      );

      this.logger.debug(
        `Notification sent metric recorded for notification ${notificationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record notification sent metric: ${error.message}`,
      );
    }
  }

  // Family metrics
  async recordFamilyMemberAdded(
    familyMemberId: number,
    familyUserId: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.FAMILY_MEMBER_ADDED,
        familyUserId,
        familyMemberId,
        'family_member',
        1,
        undefined,
        metadata,
      );

      this.logger.log(
        `Family member added metric recorded for family member ${familyMemberId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record family member added metric: ${error.message}`,
      );
    }
  }

  // Address metrics
  async recordAddressAdded(
    addressId: number,
    userId: number,
    addressType: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.ADDRESS_ADDED,
        userId,
        addressId,
        'address',
        1,
        undefined,
        { addressType, ...metadata },
      );

      this.logger.log(`Address added metric recorded for address ${addressId}`);
    } catch (error) {
      this.logger.error(
        `Failed to record address added metric: ${error.message}`,
      );
    }
  }

  // Availability metrics
  async recordAvailabilityCreated(
    availabilityId: number,
    caregiverId: number,
    availabilityType: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.AVAILABILITY_CREATED,
        caregiverId,
        availabilityId,
        'availability',
        1,
        undefined,
        { availabilityType, ...metadata },
      );

      this.logger.log(
        `Availability created metric recorded for availability ${availabilityId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record availability created metric: ${error.message}`,
      );
    }
  }

  // Wallet metrics
  async recordWalletTransaction(
    transactionId: number,
    userId: number,
    transactionType: string,
    amount: number,
    currency: string = 'BRL',
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.dashboardService.recordMetric(
        MetricType.WALLET_TRANSACTION,
        userId,
        transactionId,
        'wallet_transaction',
        1,
        amount,
        { transactionType, currency, ...metadata },
      );

      this.logger.debug(
        `Wallet transaction metric recorded for transaction ${transactionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to record wallet transaction metric: ${error.message}`,
      );
    }
  }

  // Batch metrics recording
  async recordMultipleMetrics(
    metrics: Array<{
      type: MetricType;
      userId?: number;
      relatedEntityId?: number;
      relatedEntityType?: string;
      value?: number;
      amount?: number;
      metadata?: Record<string, any>;
    }>,
  ): Promise<void> {
    try {
      const promises = metrics.map((metric) =>
        this.dashboardService.recordMetric(
          metric.type,
          metric.userId,
          metric.relatedEntityId,
          metric.relatedEntityType,
          metric.value,
          metric.amount,
          metric.metadata,
        ),
      );

      await Promise.all(promises);
      this.logger.log(`Batch metrics recorded: ${metrics.length} metrics`);
    } catch (error) {
      this.logger.error(`Failed to record batch metrics: ${error.message}`);
    }
  }
}
