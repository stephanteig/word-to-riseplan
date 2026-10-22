(() => {
  'use strict';

  const fileInput = document.querySelector('#file-input');
  const dropZone = document.querySelector('#drop-zone');
  const fileStatus = document.querySelector('#file-status');
  const errorBox = document.querySelector('#error-message');
  const sectionLinks = document.querySelector('#section-links');
  const courseView = document.querySelector('#course-view');
  const previewFile = document.querySelector('#preview-file');
  const toast = document.querySelector('#toast');
  const sampleButton = document.querySelector('#sample-button');

  const typeOptions = [
    ['text', 'Tekst'], ['list', 'Punktliste'], ['tabs', 'Faner'],
    ['accordion', 'Trekkspill'], ['cards', 'Kort'], ['steps', 'Stegvis prosess']
  ];
  const suggestedTypes = {
    text: 'text', paragraph: 'text', 'bulleted-list': 'list', list: 'list',
    tabs: 'tabs', accordion: 'accordion', cards: 'cards', process: 'steps', steps: 'steps'
  };
  let toastTimer;
  let currentPlan;
  let currentFilename = '';

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);

  function normalizeItem(item) {
    if (typeof item === 'string') return { title: '', text: item };
    if (!item || typeof item !== 'object') return { title: '', text: '' };
    return {
      title: typeof item.title === 'string' ? item.title : '',
      text: typeof item.text === 'string' ? item.text : (typeof item.description === 'string' ? item.description : '')
    };
  }

  function validatePlan(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Filen må inneholde et JSON-objekt.');
    if (data.format !== 'rise-preview-plan') throw new Error('Ukjent filformat. Forventet «rise-preview-plan».');
    if (data.version !== '1.0') throw new Error(`Versjon «${String(data.version ?? 'mangler')}» støttes ikke. Denne nettsiden støtter versjon 1.0.`);
    if (!data.course || typeof data.course !== 'object' || Array.isArray(data.course)) throw new Error('Kursdata mangler. Kontroller at fila har et «course»-felt.');
    if (typeof data.course.title !== 'string' || !data.course.title.trim()) throw new Error('Kurset mangler en tittel i «course.title».');
    if (!Array.isArray(data.sections) || data.sections.length === 0) throw new Error('Filen må ha minst én kursdel i «sections».');
    data.sections.forEach((section, sectionIndex) => {
      if (!section || typeof section !== 'object' || typeof section.title !== 'string' || !section.title.trim()) {
        throw new Error(`Kursdel ${sectionIndex + 1} mangler en tittel.`);
      }
      if (!Array.isArray(section.blocks)) throw new Error(`Kursdelen «${section.title}» mangler en «blocks»-liste.`);
      section.blocks.forEach((block, blockIndex) => {
        if (!block || typeof block !== 'object') throw new Error(`Blokk ${blockIndex + 1} i «${section.title}» er ugyldig.`);
        if (!Array.isArray(block.items) && typeof block.text !== 'string') {
          throw new Error(`Blokken «${block.title || block.id || blockIndex + 1}» mangler tekst eller innhold i «items».`);
        }
        if (Array.isArray(block.items)) {
          block.items.forEach((item, itemIndex) => {
            if (typeof item !== 'string' && (!item || typeof item !== 'object')) {
              throw new Error(`Innhold ${itemIndex + 1} i blokken «${block.title || block.id || blockIndex + 1}» er ugyldig.`);
            }
          });
        }
      });
    });
    return data;
  }

  function setError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function showToast(message = 'Kopiert') {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1700);
  }

  async function copyText(text, button) {
    const cleanText = String(text ?? '').trim();
    if (!cleanText) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        const temporary = document.createElement('textarea');
        temporary.value = cleanText;
        temporary.setAttribute('readonly', '');
        temporary.style.position = 'fixed';
        temporary.style.opacity = '0';
        document.body.appendChild(temporary);
        temporary.select();
        const copied = document.execCommand('copy');
        temporary.remove();
        if (!copied) throw new Error('Kopiering er ikke tilgjengelig.');
      }
      if (button) {
        button.dataset.originalLabel ||= button.innerHTML;
        button.innerHTML = '✓ Kopiert';
        button.classList.add('copied');
        setTimeout(() => {
          button.innerHTML = button.dataset.originalLabel;
          button.classList.remove('copied');
        }, 1500);
      }
      showToast();
    } catch {
      showToast('Klarte ikke å kopiere');
    }
  }

  function copyButton(text, label = 'Kopier tekst') {
    return `<div class="copy-row"><button class="copy-button" type="button" data-copy="${escapeHtml(text)}" aria-label="${escapeHtml(label)}"><svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="8" height="9" rx="1.5"></rect><path d="M10.5 5V3.5A1.5 1.5 0 0 0 9 2H4A1.5 1.5 0 0 0 2.5 3.5v7A1.5 1.5 0 0 0 4 12h1"></path></svg><span>Kopier tekst</span></button></div>`;
  }

  function textContent(text) {
    const safeText = typeof text === 'string' ? text : '';
    return `<p class="text-content">${escapeHtml(safeText) || '<span class="empty-field">Ingen tekst lagt til.</span>'}</p>${safeText ? copyButton(safeText) : ''}`;
  }

  function itemCopyText(item) {
    const normalized = normalizeItem(item);
    return [normalized.title, normalized.text].filter(Boolean).join('\n\n');
  }

  function renderList(items) {
    const values = items.map(normalizeItem);
    const plain = values.map(item => itemCopyText(item)).filter(Boolean).join('\n');
    return `<ul class="rise-list">${values.map(item => `<li>${escapeHtml(itemCopyText(item))}</li>`).join('')}</ul>${plain ? copyButton(plain, 'Kopier alle punktene') : ''}`;
  }

  function renderTabs(block, items) {
    const tabId = `tabs-${Math.random().toString(36).slice(2, 9)}`;
    if (!items.length) return '<p class="empty-field">Ingen faneinnhold lagt til.</p>';
    return `<div class="preview-tabs" role="tablist" aria-label="${escapeHtml(block.title || 'Faner')}">${items.map((item, i) => `<button class="tab-button${i === 0 ? ' active' : ''}" id="${tabId}-tab-${i}" role="tab" aria-selected="${i === 0}" aria-controls="${tabId}-pane-${i}" data-tab-group="${tabId}" data-tab-index="${i}" type="button">${escapeHtml(item.title || `Fane ${i + 1}`)}</button>`).join('')}</div>${items.map((item, i) => `<div class="tab-pane" id="${tabId}-pane-${i}" role="tabpanel" aria-labelledby="${tabId}-tab-${i}"${i ? ' hidden' : ''}>${item.title ? `<h4>${escapeHtml(item.title)}</h4>` : ''}<p>${escapeHtml(item.text) || '<span class="empty-field">Ingen tekst lagt til.</span>'}</p>${item.text || item.title ? copyButton(itemCopyText(item)) : ''}</div>`).join('')}`;
  }

  function renderAccordion(items) {
    if (!items.length) return '<p class="empty-field">Ingen trekkspillinnhold lagt til.</p>';
    return `<div class="accordion-list">${items.map((item, i) => `<div class="accordion-item"><button class="accordion-trigger" aria-expanded="${i === 0}" type="button"><strong>${escapeHtml(item.title || `Punkt ${i + 1}`)}</strong><span aria-hidden="true">${i === 0 ? '−' : '+'}</span></button><div class="accordion-panel"${i ? ' hidden' : ''}><p>${escapeHtml(item.text) || '<span class="empty-field">Ingen tekst lagt til.</span>'}</p>${item.text || item.title ? copyButton(itemCopyText(item)) : ''}</div></div>`).join('')}</div>`;
  }

  function renderCards(items) {
    if (!items.length) return '<p class="empty-field">Ingen kort lagt til.</p>';
    return `<div class="rise-cards">${items.map((item, i) => `<article class="rise-card"><span class="card-number">${String(i + 1).padStart(2, '0')}</span>${item.title ? `<h4 class="card-title">${escapeHtml(item.title)}</h4>` : ''}<p>${escapeHtml(item.text) || '<span class="empty-field">Ingen tekst lagt til.</span>'}</p>${item.text || item.title ? copyButton(itemCopyText(item)) : ''}</article>`).join('')}</div>`;
  }

  function renderSteps(items) {
    if (!items.length) return '<p class="empty-field">Ingen steg lagt til.</p>';
    return `<div class="steps-list">${items.map((item, i) => `<article class="process-step"><span class="step-number">${String(i + 1).padStart(2, '0')}</span><div class="step-copy">${item.title ? `<h4 class="step-title">${escapeHtml(item.title)}</h4>` : ''}<p class="step-text">${escapeHtml(item.text) || '<span class="empty-field">Ingen tekst lagt til.</span>'}</p>${item.text || item.title ? copyButton(itemCopyText(item)) : ''}</div></article>`).join('')}</div>`;
  }

  function renderBlock(block, blockIndex) {
    const sourceType = String(block.type || block.riseBlock || 'text').toLowerCase();
    const suggested = suggestedTypes[sourceType] || suggestedTypes[String(block.riseBlock || '').toLowerCase()] || 'text';
    const items = Array.isArray(block.items) ? block.items.map(normalizeItem) : [];
    const suggestedLabel = typeOptions.find(([type]) => type === suggested)?.[1] || 'Tekst';
    let body;
    switch (suggested) {
      case 'list': body = renderList(items); break;
      case 'tabs': body = renderTabs(block, items); break;
      case 'accordion': body = renderAccordion(items); break;
      case 'cards': body = renderCards(items); break;
      case 'steps': body = renderSteps(items); break;
      default: body = textContent(block.text || (items.length ? items.map(itemCopyText).join('\n\n') : ''));
    }
    if (block.closingText && suggested === 'tabs') {
      body += `<div class="closing-text"><span>${escapeHtml(block.closingText)}</span>${copyButton(block.closingText)}</div>`;
    }
    const options = typeOptions.map(([value, label]) => `<option value="${value}"${value === suggested ? ' selected' : ''}>${label}</option>`).join('');
    const title = block.title || `Blokk ${blockIndex + 1}`;
    const reason = typeof block.reason === 'string' && block.reason.trim()
      ? `<p class="reason"><strong>Hvorfor dette passer:</strong> ${escapeHtml(block.reason)}</p>` : '';
    return `<article class="course-block" data-block-id="${escapeHtml(block.id || `block-${blockIndex}`)}"><div class="block-top"><span class="block-label">${suggestedLabel}</span><div class="block-controls"><label for="type-${escapeHtml(block.id || `block-${blockIndex}`)}">Blokktype</label><select class="block-select" id="type-${escapeHtml(block.id || `block-${blockIndex}`)}" data-block-type="${escapeHtml(block.id || `block-${blockIndex}`)}" aria-label="Velg forhåndsvisningstype for ${escapeHtml(title)}">${options}</select></div></div><h3 class="block-title">${escapeHtml(title)}</h3><div class="block-body" data-block-body>${body}</div>${reason}</article>`;
  }

  function renderBlockBody(block, type) {
    const items = Array.isArray(block.items) ? block.items.map(normalizeItem) : [];
    switch (type) {
      case 'list': return renderList(items.length ? items : (block.text ? [block.text] : []));
      case 'tabs': return renderTabs(block, items.length ? items : (block.text ? [{ title: 'Innhold', text: block.text }] : []));
      case 'accordion': return renderAccordion(items.length ? items : (block.text ? [{ title: 'Les mer', text: block.text }] : []));
      case 'cards': return renderCards(items.length ? items : (block.text ? [{ title: 'Innhold', text: block.text }] : []));
      case 'steps': return renderSteps(items.length ? items : (block.text ? [{ title: 'Innhold', text: block.text }] : []));
      default: return textContent(block.text || (items.length ? items.map(itemCopyText).join('\n\n') : ''));
    }
  }

  function renderPlan(plan, filename) {
    currentPlan = plan;
    currentFilename = filename;
    const course = plan.course;
    const objectives = Array.isArray(course.learningObjectives) ? course.learningObjectives.filter(value => typeof value === 'string' && value.trim()) : [];
    const sectionsHtml = plan.sections.map((section, sectionIndex) => `
      <section class="course-section" id="section-${escapeHtml(section.id || `section-${sectionIndex + 1}`)}">
        <div class="section-heading"><span class="section-number">${String(sectionIndex + 1).padStart(2, '0')}</span><h2>${escapeHtml(section.title)}</h2></div>
        ${section.blocks.map((block, blockIndex) => renderBlock(block, blockIndex)).join('')}
      </section>`).join('');
    const courseDescription = typeof course.description === 'string' && course.description.trim()
      ? `<div class="meta-card" style="grid-column:1/-1"><span class="meta-label">Om kurset</span><p>${escapeHtml(course.description)}</p>${copyButton(course.description)}</div>` : '';
    const metaCards = [
      ['Forkunnskapskrav', course.prerequisite], ['Program', course.program]
    ].filter(([, value]) => typeof value === 'string' && value.trim())
      .map(([label, value]) => `<div class="meta-card"><span class="meta-label">${label}</span><p>${escapeHtml(value)}</p>${copyButton(value)}</div>`).join('');
    const objectivesHtml = objectives.length ? `<div class="objectives-card"><h2>Læringsmål</h2><ul>${objectives.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>${copyButton(objectives.join('\n'), 'Kopier læringsmål')}</div>` : '';
    const notesHtml = Array.isArray(plan.notes) && plan.notes.some(note => typeof note === 'string' && note.trim())
      ? `<aside class="course-notes"><h2>Merknader til kursplanen</h2><ul>${plan.notes.filter(note => typeof note === 'string' && note.trim()).map(note => `<li>${escapeHtml(note)}</li>`).join('')}</ul></aside>` : '';
    courseView.innerHTML = `<header class="course-hero"><p class="eyebrow">${escapeHtml(plan.language || 'KURSMATERIELL')}</p><h1>${escapeHtml(course.title)}</h1>${course.subtitle ? `<p class="subtitle">${escapeHtml(course.subtitle)}</p>` : ''}${course.program ? `<span class="program-chip">${escapeHtml(course.program)}</span>` : ''}</header>${(metaCards || objectivesHtml || courseDescription) ? `<div class="meta-grid">${metaCards}${courseDescription}${objectivesHtml}</div>` : ''}${sectionsHtml}${notesHtml}`;
    previewFile.textContent = filename;
    fileStatus.classList.add('loaded');
    fileStatus.innerHTML = `<span class="file-symbol" aria-hidden="true">✓</span><span>${escapeHtml(filename)}</span>`;
    sectionLinks.innerHTML = plan.sections.map((section, i) => `<a class="section-link" href="#section-${escapeHtml(section.id || `section-${i + 1}`)}"><span class="section-index">${String(i + 1).padStart(2, '0')}</span><span>${escapeHtml(section.title)}</span></a>`).join('');
    clearError();
  }

  async function loadFile(file) {
    if (!file) return;
    clearError();
    if (!file.name.toLowerCase().endsWith('.riseplan')) {
      setError('Velg en fil som slutter på .riseplan.');
      return;
    }
    try {
      const raw = await file.text();
      let parsed;
      try { parsed = JSON.parse(raw); }
      catch { throw new Error('Filen inneholder ikke gyldig JSON. Kontroller at den er en gyldig .riseplan-fil.'); }
      renderPlan(validatePlan(parsed), file.name);
    } catch (error) {
      fileStatus.classList.remove('loaded');
      fileStatus.innerHTML = `<span class="file-symbol" aria-hidden="true">!</span><span>${escapeHtml(file.name)}</span>`;
      previewFile.textContent = 'Filen kunne ikke vises';
      setError(error instanceof Error ? error.message : 'Noe gikk galt da fila skulle leses.');
    }
  }

  fileInput.addEventListener('change', event => loadFile(event.target.files?.[0]));
  dropZone.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); }
  });
  ['dragenter', 'dragover'].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault(); dropZone.classList.add('dragover');
  }));
  ['dragleave', 'drop'].forEach(type => dropZone.addEventListener(type, event => {
    event.preventDefault(); dropZone.classList.remove('dragover');
  }));
  dropZone.addEventListener('drop', event => loadFile(event.dataTransfer?.files?.[0]));

  document.addEventListener('click', event => {
    const button = event.target.closest('.copy-button');
    if (button) copyText(button.dataset.copy || '', button);

    const tab = event.target.closest('.tab-button');
    if (tab) {
      document.querySelectorAll(`[data-tab-group="${tab.dataset.tabGroup}"]`).forEach(other => {
        const active = other === tab;
        other.classList.toggle('active', active);
        other.setAttribute('aria-selected', String(active));
      });
      const parent = tab.closest('.course-block');
      parent.querySelectorAll('.tab-pane').forEach(pane => { pane.hidden = pane.id !== tab.getAttribute('aria-controls'); });
    }

    const accordion = event.target.closest('.accordion-trigger');
    if (accordion) {
      const expanded = accordion.getAttribute('aria-expanded') === 'true';
      accordion.setAttribute('aria-expanded', String(!expanded));
      accordion.querySelector('span').textContent = expanded ? '+' : '−';
      accordion.nextElementSibling.hidden = expanded;
    }
  });

  document.addEventListener('change', event => {
    const select = event.target.closest('.block-select');
    if (!select || !currentPlan) return;
    const section = currentPlan.sections.find(item => item.blocks.some(block => String(block.id || '') === select.dataset.blockType));
    const block = section?.blocks.find(item => String(item.id || '') === select.dataset.blockType);
    const container = select.closest('.course-block');
    if (!block || !container) return;
    const chosen = select.value;
    container.querySelector('.block-label').innerHTML = `<span aria-hidden="true">✳</span>${typeOptions.find(([value]) => value === chosen)?.[1] || 'Tekst'}`;
    container.querySelector('[data-block-body]').innerHTML = renderBlockBody(block, chosen);
  });

  sampleButton.addEventListener('click', () => {
    if (currentPlan) {
      renderPlan(currentPlan, currentFilename || 'Eksempelvisning');
      courseView.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('Eksempelvisning lastet inn');
      return;
    }
    setError('Velg testfila gemba-walk-test.riseplan på datamaskinen din.');
    fileInput.click();
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('.section-link').forEach(link => {
        link.classList.toggle('active', link.hash === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-10% 0px -75% 0px' });
  new MutationObserver(() => {
    document.querySelectorAll('.course-section').forEach(section => observer.observe(section));
  }).observe(courseView, { childList: true, subtree: true });

  if (new URLSearchParams(location.search).has('test')) {
    fetch('gemba-walk-test.riseplan').then(response => {
      if (!response.ok) throw new Error('Testfila ble ikke funnet.');
      return response.json();
    }).then(data => renderPlan(validatePlan(data), 'gemba-walk-test.riseplan'))
      .catch(error => setError(error.message));
  }
})();
