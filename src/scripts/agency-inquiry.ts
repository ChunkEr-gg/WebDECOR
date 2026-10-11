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

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!form.dataset.email) {
      downloadBrief();
      return;
    }
    const brand = form.dataset.brand || 'WebDECOR';
    window.location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(`Project enquiry — ${brand}`)}&body=${encodeURIComponent(getBrief())}`;
    if (status) status.textContent = 'Review the draft in your email app, then send it there. This website has not sent your brief.';
  });
  form.querySelector('[data-download-brief]')?.addEventListener('click', downloadBrief);

  const fields = form.querySelector<HTMLFieldSetElement>('fieldset');
  if (fields) fields.disabled = false;
});
