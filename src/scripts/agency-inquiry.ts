import { formatProjectBrief } from './agency-brief';

document.querySelectorAll<HTMLFormElement>('.project-brief-form').forEach(form => {
  const service = form.querySelector<HTMLSelectElement>('[name="service"]');
  const plan = form.querySelector<HTMLSelectElement>('[name="plan"]');
  const params = new URLSearchParams(window.location.search);
  for (const [field, preset] of [[service, params.get('service')], [plan, params.get('plan')]] as const) {
    if (field && preset && Array.from(field.options).some(option => option.value === preset)) field.value = preset;
  }

  const status = form.querySelector<HTMLElement>('.project-form-status');
  const getBrief = () => {
    const values = Object.fromEntries(Array.from(new FormData(form).entries()).map(([key, value]) => [key, String(value)]));
    values.service = service?.selectedOptions[0]?.textContent || values.service;
    values.plan = plan?.selectedOptions[0]?.textContent || values.plan;
    return formatProjectBrief(values, form.dataset.brand);
  };

  const downloadBrief = () => {
    if (!form.reportValidity()) return;
    const url = URL.createObjectURL(new Blob([getBrief()], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'webdecor-project-brief.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (status) status.textContent = 'Your brief downloaded. It has not been submitted or sent.';
  };

  const brand = form.dataset.brand || 'WebDECOR';
  const subject = `Project enquiry — ${brand}`;
  const openEmailDraft = () => {
    window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(getBrief())}`;
  };
  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (form.dataset.endpoint) {
      // Send through the configured form service; fall back to an email draft if it fails.
      const data = new FormData(form);
      data.set('_subject', subject);
      data.set('brief', getBrief());
      if (submit) submit.disabled = true;
      if (status) status.textContent = 'Sending your brief…';
      try {
        const response = await fetch(form.dataset.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(String(response.status));
        form.reset();
        if (status) status.textContent = `Thank you. Your brief was sent to ${brand}.`;
      } catch {
        if (form.dataset.email) {
          if (status) status.textContent = 'The brief could not be sent from the website. An email draft has opened instead — review it and send it from your email app.';
          openEmailDraft();
        } else if (status) status.textContent = 'The brief could not be sent. Please try again or download a copy.';
      } finally {
        if (submit) submit.disabled = false;
      }
      return;
    }
    if (!form.dataset.email) {
      downloadBrief();
      return;
    }
    openEmailDraft();
    if (status) status.textContent = 'Review the draft in your email app, then send it there. This website has not sent your brief.';
  });
  form.querySelector('[data-download-brief]')?.addEventListener('click', downloadBrief);

  const fields = form.querySelector<HTMLFieldSetElement>('fieldset');
  if (fields) fields.disabled = false;
});

document.querySelectorAll<HTMLButtonElement>('[data-copy-email]').forEach(button => {
  if (!navigator.clipboard) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copyEmail || '');
      button.textContent = 'EMAIL ADDRESS COPIED';
    } catch {
      button.textContent = 'COPY FAILED — SELECT THE ADDRESS';
    }
  });
});
