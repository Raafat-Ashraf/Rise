'use server';

import { getTranslations } from 'next-intl/server';

import { createContactSchema } from '@/lib/contact-schema';

export interface ContactResult {
  ok: boolean;
  /** Field-level errors, keyed by field name. */
  errors?: Record<string, string>;
}

/**
 * Handles a contact submission.
 *
 * Re-validates server-side with the same zod schema the client uses, because
 * client validation is a UX affordance and not a trust boundary — a direct POST
 * bypasses it entirely.
 *
 * Delivery is intentionally left as a logged hand-off: the client's mail
 * provider (Resend, SendGrid, a CRM webhook) isn't chosen yet. Wire it in where
 * marked and the rest of the flow — validation, states, i18n — already works.
 */
export async function submitContactForm(
  locale: string,
  payload: unknown,
): Promise<ContactResult> {
  const t = await getTranslations({
    locale,
    namespace: 'contact.form.validation',
  });

  const schema = createContactSchema(t);
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === 'string' && !errors[field]) {
        errors[field] = issue.message;
      }
    });
    return { ok: false, errors };
  }

  const enquiry = parsed.data;

  try {
    // ── Wire up delivery here ───────────────────────────
    // e.g. await resend.emails.send({
    //        from: 'site@amjad-developments.com',
    //        to: process.env.CONTACT_INBOX!,
    //        replyTo: enquiry.email,
    //        subject: `[${enquiry.interest}] ${enquiry.name}`,
    //        text: enquiry.message,
    //      });
    console.info('[rise] contact enquiry', {
      name: enquiry.name,
      email: enquiry.email,
      interest: enquiry.interest,
      budget: enquiry.budget || 'unspecified',
      locale,
      receivedAt: new Date().toISOString(),
    });

    return { ok: true };
  } catch (error) {
    console.error('[rise] contact submission failed:', error);
    return { ok: false };
  }
}
