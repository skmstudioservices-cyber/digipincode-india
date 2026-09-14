// Feedback + Updates popup buttons — floating at bottom-right corner
// Opens a small panel with "Feature Request" and "Updates" tabs.
// Submissions POST to /api/feedback (D1-backed).

const FEEDBACK_ENDPOINT = '/api/feedback';

export function initFeedbackButtons() {
  // Container
  const container = document.createElement('div');
  container.id = 'feedback-widget';
  container.innerHTML = `
    <style>
      #feedback-widget { position: fixed; bottom: 16px; right: 16px; z-index: 9999; font-family: system-ui, sans-serif; }
      #feedback-widget .fb-btn { display: block; width: 100%; padding: 10px 16px; margin: 4px 0; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; color: #fff; background: #0066cc; box-shadow: 0 2px 8px rgba(0,0,0,.2); }
      #feedback-widget .fb-btn:hover { background: #0052a3; }
      #feedback-widget .fb-panel { display: none; position: absolute; bottom: 90px; right: 0; width: 300px; background: #fff; border: 1px solid #ddd; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.15); padding: 16px; }
      #feedback-widget .fb-panel.open { display: block; }
      #feedback-widget .fb-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
      #feedback-widget .fb-tab { flex: 1; padding: 6px; border: 1px solid #ddd; border-radius: 6px; background: #f5f5f5; cursor: pointer; font-size: 13px; }
      #feedback-widget .fb-tab.active { background: #0066cc; color: #fff; border-color: #0066cc; }
      #feedback-widget textarea { width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; resize: vertical; box-sizing: border-box; }
      #feedback-widget input[type=email] { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; box-sizing: border-box; margin-bottom: 8px; }
      #feedback-widget .fb-submit { width: 100%; padding: 8px; border: none; border-radius: 6px; background: #0066cc; color: #fff; font-weight: 600; cursor: pointer; }
      #feedback-widget .fb-close { position: absolute; top: 8px; right: 10px; border: none; background: none; font-size: 18px; cursor: pointer; color: #666; }
      #feedback-widget .fb-msg { font-size: 13px; margin-top: 8px; color: #006600; }
    </style>
    <div class="fb-panel" id="fb-panel">
      <button class="fb-close" id="fb-close">&times;</button>
      <div class="fb-tabs">
        <button class="fb-tab active" data-tab="feature">Feature Request</button>
        <button class="fb-tab" data-tab="update">Updates</button>
      </div>
      <div id="fb-feature">
        <textarea id="fb-feature-text" placeholder="Describe the feature you'd like…"></textarea>
        <input type="email" id="fb-feature-email" placeholder="Your email (optional)" />
        <button class="fb-submit" data-type="feature">Submit</button>
      </div>
      <div id="fb-update" style="display:none">
        <textarea id="fb-update-text" placeholder="What should we update or fix?"></textarea>
        <input type="email" id="fb-update-email" placeholder="Your email (optional)" />
        <button class="fb-submit" data-type="update">Submit</button>
      </div>
      <div class="fb-msg" id="fb-msg"></div>
    </div>
    <button class="fb-btn" id="fb-open">💡 Feedback & Updates</button>
  `;
  document.body.appendChild(container);

  const panel = container.querySelector('#fb-panel');
  const openBtn = container.querySelector('#fb-open');
  const closeBtn = container.querySelector('#fb-close');
  const msg = container.querySelector('#fb-msg');

  openBtn.addEventListener('click', () => panel.classList.add('open'));
  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // Tab switching
  container.querySelectorAll('.fb-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.fb-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const which = tab.dataset.tab;
      container.querySelector('#fb-feature').style.display = which === 'feature' ? 'block' : 'none';
      container.querySelector('#fb-update').style.display = which === 'update' ? 'block' : 'none';
    });
  });

  // Submit
  container.querySelectorAll('.fb-submit').forEach(btn => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.type;
      const text = container.querySelector(`#fb-${type}-text`).value.trim();
      const email = container.querySelector(`#fb-${type}-email`).value.trim();
      if (!text) { msg.textContent = 'Please enter a message.'; msg.style.color = '#cc0000'; return; }

      try {
        const res = await fetch(FEEDBACK_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, message: text, email, url: location.pathname }),
        });
        if (res.ok) {
          msg.textContent = 'Thanks! Your feedback has been recorded.';
          msg.style.color = '#006600';
          container.querySelector(`#fb-${type}-text`).value = '';
          container.querySelector(`#fb-${type}-email`).value = '';
        } else {
          msg.textContent = 'Something went wrong. Please try again.';
          msg.style.color = '#cc0000';
        }
      } catch (e) {
        msg.textContent = 'Network error. Please try again.';
        msg.style.color = '#cc0000';
      }
    });
  });
}