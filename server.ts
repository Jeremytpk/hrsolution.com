import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_TENANTS, INITIAL_USERS, INITIAL_ANALYTICS, INITIAL_ONBOARDING_PROGRESS, INITIAL_AUDIT_LOGS } from './src/data/mockData.js';
import { CompanyTenant, CompanyPolicy, KatiChatMessage, User } from './src/types.js';

// In-memory multi-tenant store initialized with rich realistic seeds
let tenantsStore: CompanyTenant[] = [...INITIAL_TENANTS];
let usersStore: User[] = [...INITIAL_USERS];
let analyticsStore = { ...INITIAL_ANALYTICS };
let onboardingStore = { ...INITIAL_ONBOARDING_PROGRESS };
let auditLogsStore = [...INITIAL_AUDIT_LOGS];

// Initialize Gemini Client safely on server side
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Kati Central Multi-Tenant AI HR Engine',
      domain: 'hrsolution.com',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Auth endpoint for Landing Page Login & Role Redirection
  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const foundUser = usersStore.find((u) => u.email.toLowerCase() === (email || '').toLowerCase().trim());

    if (foundUser) {
      // Find associated tenant if company_admin or employee
      const tenant = foundUser.companyId ? tenantsStore.find((t) => t.id === foundUser.companyId) : undefined;
      return res.json({
        success: true,
        user: foundUser,
        tenant: tenant || null,
        redirectUrl: foundUser.role === 'super_admin'
          ? '/admin/central'
          : foundUser.role === 'company_admin'
          ? `/tenant/${foundUser.companyId}/dashboard`
          : `/tenant/${foundUser.companyId}/portal`,
      });
    }

    // Fallback: If unknown email, create a demo company_admin or employee session gracefully
    return res.status(404).json({
      success: false,
      message: 'User not found. Try one of our 1-click quick login profiles on hrsolution.com!',
    });
  });

  // Tenants Endpoints
  app.get('/api/tenants', (req, res) => {
    res.json({ success: true, tenants: tenantsStore });
  });

  app.get('/api/tenants/:id', (req, res) => {
    const tenant = tenantsStore.find((t) => t.id === req.params.id);
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant company not found' });
    res.json({ success: true, tenant });
  });

  app.post('/api/tenants', (req, res) => {
    const { name, domain, plan, employeeCount, customPolicies, personaConfig } = req.body;
    const newId = (domain || name || 'company').toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    const newTenant: CompanyTenant = {
      id: newId,
      name: name || 'New Enterprise Partner',
      domain: domain || `${newId}.com`,
      plan: plan || 'growth',
      employeeCount: Number(employeeCount) || 50,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      isolatedEncryptionKeyId: `kms-key-tenant-${newId}-${Math.floor(1000 + Math.random() * 9000)}-x`,
      adminPermissions: req.body.adminPermissions || {
        canEditPersonaAndTone: true,
        canEditCompanyInfo: true,
        canEditPolicies: true,
        canDeletePolicies: true,
      },
      katiConfig: personaConfig || {
        botName: `Kati (${name} AI HR)`,
        tone: 'empathetic',
        policyStrictness: 'balanced',
        customGreeting: `Hello! I am Kati, your AI HR Assistant at ${name}. Ask me about our benefits, leave rules, and employee guidelines.`,
        escalationEmail: `hr@${domain || 'company.com'}`,
        allowedSelfServiceForms: ['PTO Request', 'Expense Reimbursement'],
      },
      policies: customPolicies || [
        {
          id: `pol-${newId}-1`,
          category: 'pto_leave',
          title: 'Standard PTO & Sick Leave Policy',
          content: `${name} provides 20 paid days off per calendar year. Sick leave accrues at 1 day per month.`,
          lastUpdated: new Date().toISOString().split('T')[0],
          version: 'v1.0',
          effectiveDate: new Date().toISOString().split('T')[0],
          tags: ['PTO', 'Vacation'],
        },
      ],
    };

    tenantsStore.push(newTenant);

    // Seed audit log
    auditLogsStore.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tenantId: newTenant.id,
      companyName: newTenant.name,
      action: 'TENANT_PROVISIONED_SECURE_KMS',
      actorEmail: 'admin@hrsolution.com',
      securityDomain: `Isolated Encryption Key: ${newTenant.isolatedEncryptionKeyId}`,
    });

    res.json({ success: true, tenant: newTenant });
  });

  app.put('/api/tenants/:id', (req, res) => {
    const index = tenantsStore.findIndex((t) => t.id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Tenant not found' });

    const { auditAction, actorEmail, ...updateFields } = req.body;

    tenantsStore[index] = {
      ...tenantsStore[index],
      ...updateFields,
    };

    auditLogsStore.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      tenantId: req.params.id,
      companyName: tenantsStore[index].name,
      action: auditAction || 'TENANT_CONFIGURATION_UPDATED',
      actorEmail: actorEmail || 'admin@hrsolution.com',
      securityDomain: `Isolated Tenant KMS: ${tenantsStore[index].isolatedEncryptionKeyId}`,
    });

    res.json({ success: true, tenant: tenantsStore[index] });
  });

  // Analytics Endpoint
  app.get('/api/analytics/:tenantId', (req, res) => {
    const tenantId = req.params.tenantId;
    if (tenantId === 'global') {
      // Aggregate global metrics for Super Admin
      const totalQueries = Object.values(analyticsStore).reduce((acc, curr) => acc + curr.totalQueriesThisMonth, 0);
      return res.json({
        success: true,
        analytics: {
          tenantId: 'global',
          totalQueriesThisMonth: totalQueries + 4200,
          autoResolutionRate: 94.2,
          avgResponseTimeSec: 1.1,
          employeeCsat: 4.81,
          onboardingCompletionRate: 89.4,
          topQueries: [
            { topic: 'PTO & Vacation Allowance', count: 1840, category: 'pto_leave' },
            { topic: 'Health & Dental Coverage', count: 1420, category: 'benefits_health' },
            { topic: 'HIPAA & Compliance Rules', count: 1150, category: 'conduct_ethics' },
            { topic: 'Remote Work Stipend', count: 980, category: 'remote_work' },
          ],
          queriesByDay: [
            { day: 'Mon', resolvedByKati: 1450, escalatedToHR: 68 },
            { day: 'Tue', resolvedByKati: 1620, escalatedToHR: 75 },
            { day: 'Wed', resolvedByKati: 1580, escalatedToHR: 62 },
            { day: 'Thu', resolvedByKati: 1710, escalatedToHR: 80 },
            { day: 'Fri', resolvedByKati: 1390, escalatedToHR: 54 },
            { day: 'Sat', resolvedByKati: 520, escalatedToHR: 14 },
            { day: 'Sun', resolvedByKati: 480, escalatedToHR: 10 },
          ],
          policyGapAlerts: [
            {
              policyTopic: 'Commuter & Parking Benefits',
              queryCount: 142,
              recommendedAction: 'Multiple companies requesting unified transit card policy module.',
            },
          ],
        },
      });
    }

    const analytics = analyticsStore[tenantId] || {
      tenantId,
      totalQueriesThisMonth: 180,
      autoResolutionRate: 95.0,
      avgResponseTimeSec: 1.1,
      employeeCsat: 4.9,
      onboardingCompletionRate: 85.0,
      topQueries: [
        { topic: 'PTO Allowance', count: 65, category: 'pto_leave' },
        { topic: 'Health Plan Benefits', count: 48, category: 'benefits_health' },
      ],
      queriesByDay: [
        { day: 'Mon', resolvedByKati: 30, escalatedToHR: 1 },
        { day: 'Tue', resolvedByKati: 35, escalatedToHR: 2 },
        { day: 'Wed', resolvedByKati: 32, escalatedToHR: 1 },
        { day: 'Thu', resolvedByKati: 40, escalatedToHR: 2 },
        { day: 'Fri', resolvedByKati: 28, escalatedToHR: 1 },
        { day: 'Sat', resolvedByKati: 8, escalatedToHR: 0 },
        { day: 'Sun', resolvedByKati: 7, escalatedToHR: 0 },
      ],
      policyGapAlerts: [],
    };

    res.json({ success: true, analytics });
  });

  // Onboarding Endpoint
  app.get('/api/onboarding/:tenantId', (req, res) => {
    const list = onboardingStore[req.params.tenantId] || [];
    res.json({ success: true, onboarding: list });
  });

  app.post('/api/onboarding/:tenantId/register', (req, res) => {
    const { tenantId } = req.params;
    const { employeeName, email, department, position, startDate, customTasks } = req.body;

    if (!employeeName || !email) {
      return res.status(400).json({ success: false, message: 'Employee name and email are required' });
    }

    if (!onboardingStore[tenantId]) {
      onboardingStore[tenantId] = [];
    }

    const tenant = tenantsStore.find((t) => t.id === tenantId);
    const companyName = tenant ? tenant.name : tenantId;

    const defaultTaskList = customTasks && customTasks.length > 0 ? customTasks : [
      'Sign Employment Contract & Tax Forms (W-4 / I-9)',
      'Set up Work Email & Multi-Factor Authentication',
      'Review & Acknowledge PTO & Remote Work Policies',
      'Complete Kati AI HR Portal Orientation',
      '1-on-1 Intro Session with Team Lead',
    ];

    const newHireId = `emp-${Date.now()}`;
    const tasks = defaultTaskList.map((title: string, idx: number) => ({
      id: `task-${Date.now()}-${idx}`,
      title,
      description: `Complete ${title}`,
      category: idx === 0 ? 'documentation' : idx === 1 ? 'equipment' : idx === 2 ? 'policy_ack' : idx === 3 ? 'kati_intro' : 'training',
      dueDays: (idx + 1) * 2,
      completed: false,
    }));

    const newHireRecord = {
      employeeId: newHireId,
      employeeName,
      department: department || 'General Operations',
      startDate: startDate || new Date().toISOString().split('T')[0],
      progressPercent: 0,
      tasks,
      katiWelcomeSent: true,
    };

    onboardingStore[tenantId].unshift(newHireRecord);

    // Create demo user session account for employee
    usersStore.push({
      id: newHireId,
      name: employeeName,
      email: email.toLowerCase().trim(),
      role: 'employee',
      companyId: tenantId,
      department: department || 'General Operations',
    });

    // Add audit log
    auditLogsStore.unshift({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: `NEW_HIRE_REGISTERED (${employeeName})`,
      tenantId,
      companyName,
      actorEmail: req.body.actorEmail || 'admin@hrsolution.com',
      securityDomain: tenant ? tenant.domain : 'hrsolution.com',
    });

    res.json({ success: true, onboarding: onboardingStore[tenantId], newHire: newHireRecord });
  });

  app.post('/api/onboarding/:tenantId/task-toggle', (req, res) => {
    const { tenantId } = req.params;
    const { employeeId, taskId, completed } = req.body;

    if (!onboardingStore[tenantId]) {
      onboardingStore[tenantId] = [];
    }

    const employeeProgress = onboardingStore[tenantId].find((e) => e.employeeId === employeeId);
    if (employeeProgress) {
      const task = employeeProgress.tasks.find((t) => t.id === taskId);
      if (task) {
        task.completed = completed;
        task.completedAt = completed ? new Date().toISOString().split('T')[0] : undefined;
      }
      // recalculate percentage
      const total = employeeProgress.tasks.length;
      const done = employeeProgress.tasks.filter((t) => t.completed).length;
      employeeProgress.progressPercent = Math.round((done / (total || 1)) * 100);
    }

    res.json({ success: true, onboarding: onboardingStore[tenantId] });
  });

  // System Audit Logs Endpoint
  app.get('/api/audit-logs', (req, res) => {
    res.json({ success: true, logs: auditLogsStore });
  });

  // SERVER-SIDE GEMINI API INTEGRATION FOR KATI AI HR ENGINE
  app.post('/api/kati/chat', async (req, res) => {
    try {
      const { tenantId, userQuery, userName, userRole, conversationHistory } = req.body;

      if (!tenantId || !userQuery) {
        return res.status(400).json({ success: false, message: 'tenantId and userQuery are required' });
      }

      // Look up tenant from isolated tenant store
      const tenant = tenantsStore.find((t) => t.id === tenantId);
      if (!tenant) {
        return res.status(404).json({ success: false, message: 'Tenant company not found' });
      }

      const katiConfig = tenant.katiConfig;
      const policyDocs = tenant.policies || [];

      // Format policies into isolated context string
      const formattedPolicies = policyDocs
        .map(
          (p) => `--- POLICY DOCUMENT: ${p.title} (Category: ${p.category}, Version: ${p.version}) ---\n${p.content}`
        )
        .join('\n\n');

      const gemini = getGeminiClient();

      let answerText = '';
      let citations: { policyTitle: string; section: string; relevanceSnippet: string }[] = [];
      let suggestedActions: { label: string; actionType: 'form' | 'link' | 'escalate' | 'suggested_question'; value: string }[] = [];

      if (gemini) {
        const systemInstruction = `You are ${katiConfig.botName || 'Kati'}, the official AI HR Assistant for ${tenant.name}.
Your job is to assist employees and managers at ${tenant.name} strictly following ${tenant.name}'s company policies.

COMPANY POLICIES FOR ${tenant.name.toUpperCase()} (STRICT MULTI-TENANT ISOLATION BOUNDARY):
${formattedPolicies}

PERSONA & RULES:
- Tone: ${katiConfig.tone}
- Strictness: ${katiConfig.policyStrictness}
- Never reveal policies or data from other companies.
- Directly quote or reference policy names when answering.
- If a question is not covered in the policy context, politely offer to escalate to HR at ${katiConfig.escalationEmail}.
- Allowed Self-Service forms available at ${tenant.name}: ${katiConfig.allowedSelfServiceForms.join(', ')}.`;

        const prompt = `User Name: ${userName || 'Employee'} (${userRole || 'employee'})
Question: ${userQuery}`;

        const response = await gemini.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.3, // Low temperature for factual compliance accuracy
          },
        });

        answerText = response.text || `I've analyzed our ${tenant.name} policy guidelines regarding your inquiry. Please reach out to ${katiConfig.escalationEmail} for further verification.`;

        // Extract citations based on matching policies
        policyDocs.forEach((p) => {
          if (answerText.toLowerCase().includes(p.title.toLowerCase()) || userQuery.toLowerCase().includes(p.category)) {
            citations.push({
              policyTitle: p.title,
              section: p.version,
              relevanceSnippet: p.content.substring(0, 120) + '...',
            });
          }
        });

      } else {
        // Fallback intelligent response generator if GEMINI_API_KEY is not set yet
        const queryLower = userQuery.toLowerCase();
        const matchedPolicy = policyDocs.find(
          (p) =>
            p.title.toLowerCase().includes(queryLower) ||
            p.content.toLowerCase().includes(queryLower) ||
            p.tags.some((t) => queryLower.includes(t.toLowerCase()))
        );

        if (matchedPolicy) {
          answerText = `[AI Kati - ${tenant.name} Mode]\nAccording to our official ${tenant.name} policy **"${matchedPolicy.title}"**:\n\n${matchedPolicy.content}\n\nIf you have specific exceptional circumstances, I can prepare a ${katiConfig.allowedSelfServiceForms[0] || 'request form'} or connect you with ${katiConfig.escalationEmail}.`;
          citations.push({
            policyTitle: matchedPolicy.title,
            section: matchedPolicy.version,
            relevanceSnippet: matchedPolicy.content,
          });
        } else if (queryLower.includes('pto') || queryLower.includes('vacation') || queryLower.includes('leave')) {
          answerText = `At ${tenant.name}, employee leave is governed by our company PTO guidelines. You can submit leave requests directly in your portal. For full policy terms or manager approvals over 5 days, please review the policy tab or contact ${katiConfig.escalationEmail}.`;
        } else if (queryLower.includes('remote') || queryLower.includes('stipend') || queryLower.includes('wfh')) {
          answerText = `Under ${tenant.name}'s remote work policy, active employees receive dedicated stipends and home office allowances. You can file expense claims in your employee self-service hub!`;
        } else {
          answerText = `Hello ${userName || 'there'}! I am Kati, your AI HR assistant dedicated exclusively to ${tenant.name}. Based on our company guidelines, I can assist you with PTO, health benefits, remote work stipends, and onboarding checklists. How can I help you today?`;
        }
      }

      // Add default helpful suggested actions
      suggestedActions = [
        { label: 'Submit PTO Request Form', actionType: 'form', value: 'pto_form' },
        { label: 'View Full Policy Document', actionType: 'link', value: 'policies' },
        { label: `Escalate to ${katiConfig.escalationEmail}`, actionType: 'escalate', value: katiConfig.escalationEmail },
      ];

      // Record query in tenant analytics
      if (analyticsStore[tenantId]) {
        analyticsStore[tenantId].totalQueriesThisMonth += 1;
      }

      return res.json({
        success: true,
        message: {
          id: `msg-${Date.now()}`,
          sender: 'kati',
          text: answerText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          policyCitations: citations.length > 0 ? citations : undefined,
          suggestedActions,
        },
      });
    } catch (err: any) {
      console.error('Kati AI Chat Error:', err);
      return res.status(500).json({
        success: false,
        message: 'Kati AI HR service encountered a temporary error. Please try again.',
      });
    }
  });

  // Vite Middleware for Development Mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kati AI HR Platform running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
