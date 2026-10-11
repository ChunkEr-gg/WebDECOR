import { formatProjectBrief } from './agency-brief';
document.querySelectorAll<HTMLFormElement>('.ag-inquiry-form').forEach(form=>{
 const service = form.querySelector<HTMLSelectElement>('[name="service"]');
 const plan=form.querySelector<HTMLSelectElement>('[name="plan"]');
 const planPreset=new URLSearchParams(window.location.search).get('plan');
 if(plan && planPreset && Array.from(plan.options).some(option=>option.value===planPreset)) plan.value=planPreset;
 const preset = new URLSearchParams(window.location.search).get('service');
 if(service && preset && Array.from(service.options).some(option=>option.value===preset)) service.value=preset;
 const getBrief=()=>{const values=Object.fromEntries(Array.from(new FormData(form).entries()).map(([key,value])=>[key,String(value)]));values.service=service?.selectedOptions[0]?.textContent||values.service;values.plan=plan?.selectedOptions[0]?.textContent||values.plan;return formatProjectBrief(values,form.dataset.brand);};
 const status=form.querySelector('.ag-form-status');
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!form.reportValidity())return;
  const url=URL.createObjectURL(new Blob([getBrief()],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='webdecor-project-brief.txt';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  if(status)status.textContent='Your brief downloaded. It has not been submitted or sent.';
 });
 form.querySelector('[data-compose-email]')?.addEventListener('click',()=>{
  if(!form.reportValidity()||!form.dataset.email)return;
  window.location.href=`mailto:${form.dataset.email}?subject=${encodeURIComponent('Project enquiry — WebDECOR')}&body=${encodeURIComponent(getBrief())}`;
  if(status)status.textContent='A draft opens in your email app. You review and send it there.';
 });
 const fields=form.querySelector<HTMLFieldSetElement>('fieldset');if(fields)fields.disabled=false;
});
