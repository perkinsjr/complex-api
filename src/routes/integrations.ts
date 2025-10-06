import { Router, Request, Response } from 'express';
import { DataGenerator } from '../utils/dataGenerator';

const router = Router();

/**
 * @swagger
 * /api/integrations:
 *   get:
 *     summary: Get list of available integrations
 *     tags: [Integrations]
 *     responses:
 *       200:
 *         description: List of integrations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                         enum: [payment, analytics, communication, storage, crm, marketing]
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [active, inactive, pending, error]
 *                       version:
 *                         type: string
 *                       webhookUrl:
 *                         type: string
 *                       lastSync:
 *                         type: string
 *                         format: date-time
 *                       configuration:
 *                         type: object
 *                       permissions:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Integrations retrieved successfully"
 */
router.get('/', (req: Request, res: Response) => {
  const integrations = [
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payment',
      description: 'Payment processing integration',
      status: 'active',
      version: '2023-10-16',
      webhookUrl: `${req.protocol}://${req.get('host')}/webhooks/stripe`,
      lastSync: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      configuration: {
        publicKey: 'pk_test_***',
        webhookSecret: 'whsec_***',
        currency: 'USD',
        captureMethod: 'automatic'
      },
      permissions: ['read:payments', 'write:payments', 'read:customers'],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString()
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'communication',
      description: 'Email delivery service integration',
      status: 'active',
      version: '3.0',
      webhookUrl: `${req.protocol}://${req.get('host')}/webhooks/sendgrid`,
      lastSync: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      configuration: {
        apiKey: 'SG.***',
        fromEmail: 'noreply@example.com',
        fromName: 'Complex API Demo',
        templates: {
          welcome: 'd-123456789',
          passwordReset: 'd-987654321'
        }
      },
      permissions: ['send:emails', 'read:templates', 'read:stats'],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 45).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 2).toISOString()
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'analytics',
      description: 'Web analytics and reporting integration',
      status: 'active',
      version: '4.0',
      webhookUrl: null,
      lastSync: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      configuration: {
        measurementId: 'G-XXXXXXXXXX',
        propertyId: '123456789',
        dataRetention: '26 months',
        enhancedEcommerce: true
      },
      permissions: ['read:analytics', 'read:reports', 'read:audiences'],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 60).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 1).toISOString()
    },
    {
      id: 'aws-s3',
      name: 'Amazon S3',
      category: 'storage',
      description: 'Cloud storage integration for file uploads',
      status: 'active',
      version: '2006-03-01',
      webhookUrl: null,
      lastSync: new Date(Date.now() - Math.random() * 1800000).toISOString(),
      configuration: {
        region: 'us-east-1',
        bucket: 'complex-api-storage',
        accessKeyId: 'AKIA***',
        encryption: 'AES256',
        publicAccess: false
      },
      permissions: ['read:objects', 'write:objects', 'delete:objects'],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 90).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString()
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      category: 'crm',
      description: 'Customer relationship management integration',
      status: 'pending',
      version: '58.0',
      webhookUrl: `${req.protocol}://${req.get('host')}/webhooks/salesforce`,
      lastSync: null,
      configuration: {
        instanceUrl: 'https://example.salesforce.com',
        apiVersion: '58.0',
        sandboxMode: true
      },
      permissions: ['read:accounts', 'write:leads', 'read:opportunities'],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 1).toISOString()
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      category: 'marketing',
      description: 'Email marketing and automation integration',
      status: 'inactive',
      version: '3.0',
      webhookUrl: `${req.protocol}://${req.get('host')}/webhooks/mailchimp`,
      lastSync: new Date(Date.now() - Math.random() * 86400000 * 15).toISOString(),
      configuration: {
        apiKey: '***-us1',
        dataCenter: 'us1',
        defaultListId: 'abc123def4',
        doubleOptin: true
      },
      permissions: ['read:campaigns', 'write:lists', 'read:reports'],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 120).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 15).toISOString()
    },
    {
      id: 'slack',
      name: 'Slack',
      category: 'communication',
      description: 'Team communication and notification integration',
      status: 'error',
      version: '1.0',
      webhookUrl: `${req.protocol}://${req.get('host')}/webhooks/slack`,
      lastSync: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(),
      configuration: {
        botToken: 'xoxb-***',
        signingSecret: '***',
        defaultChannel: '#general',
        notificationTypes: ['errors', 'alerts', 'reports']
      },
      permissions: ['chat:write', 'channels:read', 'users:read'],
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 20).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString()
    }
  ];

  const response = DataGenerator.createApiResponse(
    integrations,
    true,
    'Integrations retrieved successfully'
  );

  res.json(response);
});

export default router;
