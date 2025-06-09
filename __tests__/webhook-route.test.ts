import { POST, GET } from '@/app/api/github/webhooks/route';
import { NextRequest } from 'next/server';

const mockVerifyAndReceive = jest.fn();
const mockOn = jest.fn();
const mockOnAny = jest.fn();

jest.mock('@octokit/webhooks', () => ({
  Webhooks: jest.fn().mockImplementation(() => ({
    on: mockOn,
    onAny: mockOnAny,
    verifyAndReceive: mockVerifyAndReceive
  }))
}));

jest.mock('@/app/api/github/webhooks/handlers/installation-created', () => ({
  handleInstallationCreated: jest.fn()
}));

jest.mock('@/app/api/github/webhooks/handlers/installation-deleted', () => ({
  handleInstallationDeleted: jest.fn()
}));

describe('GitHub Webhook Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  const createMockRequest = (headers: Record<string, string>, body: string) => {
    return {
      text: jest.fn().mockResolvedValue(body),
      headers: {
        get: jest.fn((key: string) => headers[key] || null)
      }
    } as unknown as NextRequest;
  };

  describe('POST /api/github/webhooks', () => {
    it('should process valid webhook', async () => {
      const mockReq = createMockRequest({
        'x-hub-signature-256': 'sha256=valid-signature',
        'x-github-event': 'installation',
        'x-github-delivery': 'delivery-123'
      }, JSON.stringify({ action: 'created' }));

      mockVerifyAndReceive.mockResolvedValue(undefined);

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
    });

    it('should return 400 when signature is missing', async () => {
      const mockReq = createMockRequest({
        'x-github-event': 'installation',
        'x-github-delivery': 'delivery-123'
      }, JSON.stringify({ action: 'created' }));

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing required headers' });
    });

    it('should return 400 when event is missing', async () => {
      const mockReq = createMockRequest({
        'x-hub-signature-256': 'sha256=valid-signature',
        'x-github-delivery': 'delivery-123'
      }, JSON.stringify({ action: 'created' }));

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing required headers' });
    });

    it('should return 400 when delivery ID is missing', async () => {
      const mockReq = createMockRequest({
        'x-hub-signature-256': 'sha256=valid-signature',
        'x-github-event': 'installation'
      }, JSON.stringify({ action: 'created' }));

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Missing required headers' });
    });

    it('should handle webhook verification failure', async () => {
      const mockReq = createMockRequest({
        'x-hub-signature-256': 'sha256=invalid-signature',
        'x-github-event': 'installation',
        'x-github-delivery': 'delivery-123'
      }, JSON.stringify({ action: 'created' }));

      mockVerifyAndReceive.mockRejectedValue(new Error('Invalid signature'));

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle different event types', async () => {
      const events = ['installation', 'push', 'pull_request', 'issues'];

      for (const event of events) {
        const mockReq = createMockRequest({
          'x-hub-signature-256': 'sha256=valid-signature',
          'x-github-event': event,
          'x-github-delivery': `delivery-${event}`
        }, JSON.stringify({ action: 'created' }));

        mockVerifyAndReceive.mockResolvedValue(undefined);

        const response = await POST(mockReq);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({ received: true });
      }
    });

    it('should handle large payloads', async () => {
      const largePayload = {
        action: 'created',
        installation: {
          id: 12345,
          account: { login: 'test-org' },
          repositories: new Array(1000).fill({ name: 'repo', full_name: 'test-org/repo' })
        }
      };

      const mockReq = createMockRequest({
        'x-hub-signature-256': 'sha256=valid-signature',
        'x-github-event': 'installation',
        'x-github-delivery': 'delivery-123'
      }, JSON.stringify(largePayload));

      mockVerifyAndReceive.mockResolvedValue(undefined);

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ received: true });
    });

    it('should handle concurrent webhook requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        createMockRequest({
          'x-hub-signature-256': 'sha256=valid-signature',
          'x-github-event': 'installation',
          'x-github-delivery': `delivery-${i}`
        }, JSON.stringify({ action: 'created' }))
      );

      mockVerifyAndReceive.mockResolvedValue(undefined);

      const responses = await Promise.all(requests.map(req => POST(req)));

      for (const response of responses) {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual({ received: true });
      }

      expect(mockVerifyAndReceive).toHaveBeenCalledTimes(5);
    });

    it('should handle request body parsing errors', async () => {
      const mockReq = {
        text: jest.fn().mockRejectedValue(new Error('Body parsing failed')),
        headers: {
          get: jest.fn().mockReturnValue('value')
        }
      } as unknown as NextRequest;

      const response = await POST(mockReq);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/github/webhooks', () => {
    it('should return health check information', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        status: 'ok',
        service: 'github-webhook-handler',
        endpoint: '/api/github/webhooks',
        approach: 'declarative-with-octokit-webhooks'
      });
      expect(data.timestamp).toBeDefined();
    });
  });
});
