(function() {

  // --- REDIRECT /auth -> /auth/login ---
  // O Next.js serve /auth como registo (desactivado). Redirigir para login.
  var path = window.location.pathname;
  if (path === '/auth' || path === '/auth/') {
    window.location.replace('/auth/login');
  }

  // --- IDIOMA PORTUGUÊS POR DEFEITO ---
  if (!document.cookie.includes('i18next=')) {
    document.cookie = 'i18next=pt; path=/; max-age=31536000';
    window.location.reload();
  }

  // --- PAINEL DIREITO LOGIN ---
  var loginPanelCSS = `
    #stratechna-login-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 48px 40px;
      position: relative;
      overflow: hidden;
      background: #0E0E0E;
    }
    @media (max-width: 1024px) {
      #stratechna-login-panel { display: none !important; }
    }
    /* Grade subtil cinzento azulado */
    #stratechna-login-panel .s-bg-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(61,81,99,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(61,81,99,0.06) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
    }
    /* Glow subtil cinzento azulado no topo */
    #stratechna-login-panel .s-glow {
      position: absolute;
      width: 500px; height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(61,81,99,0.18) 0%, transparent 70%);
      top: -80px; right: -60px;
      pointer-events: none;
    }
    /* Glow vermelho muito suave em baixo */
    #stratechna-login-panel .s-glow2 {
      position: absolute;
      width: 280px; height: 280px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(136,0,0,0.08) 0%, transparent 70%);
      bottom: 60px; left: -30px;
      pointer-events: none;
    }
    #stratechna-login-panel .s-inner {
      position: relative; z-index: 1;
      width: 100%; max-width: 480px;
      display: flex; flex-direction: column; gap: 32px;
    }
    #stratechna-login-panel .s-headline {
      display: flex; flex-direction: column; gap: 12px;
    }
    /* Tag: fundo cinzento azulado, apenas dot vermelho */
    #stratechna-login-panel .s-tag {
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(61,81,99,0.2);
      border: 1px solid rgba(61,81,99,0.4);
      border-radius: 100px;
      padding: 5px 14px;
      font-size: 10px;
      font-weight: 700;
      color: #7A99B3;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      width: fit-content;
    }
    #stratechna-login-panel .s-tag-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #CC0000;
      animation: s-pulse 2.5s ease-in-out infinite;
    }
    @keyframes s-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.75); }
    }
    /* Título: branco, só "presença digital" em vermelho */
    #stratechna-login-panel .s-title {
      font-family: 'Helvetica Neue', Helvetica, sans-serif;
      font-size: 34px;
      font-weight: 700;
      color: #E0E0E0;
      line-height: 1.18;
      letter-spacing: -0.4px;
    }
    #stratechna-login-panel .s-title em {
      font-style: normal;
      color: #CC0000;
    }
    #stratechna-login-panel .s-subtitle {
      font-size: 13.5px;
      color: rgba(224,224,224,0.4);
      line-height: 1.65;
      max-width: 370px;
    }
    /* Cards: fundo muito subtil, hover com borda azulada */
    #stratechna-login-panel .s-cards {
      display: flex; flex-direction: column; gap: 12px;
    }
    #stratechna-login-panel .s-card {
      background: rgba(255,255,255,0.025);
      border: 1px solid rgba(255,255,255,0.055);
      border-radius: 14px;
      padding: 18px 20px;
      display: flex; align-items: flex-start; gap: 15px;
      transition: border-color 0.3s ease, background 0.3s ease;
      animation: s-fadein 0.5s ease forwards;
      opacity: 0;
    }
    #stratechna-login-panel .s-card:nth-child(1) { animation-delay: 0.1s; }
    #stratechna-login-panel .s-card:nth-child(2) { animation-delay: 0.22s; }
    #stratechna-login-panel .s-card:nth-child(3) { animation-delay: 0.34s; }
    @keyframes s-fadein {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    /* Hover: borda cinzento azulado, não vermelho */
    #stratechna-login-panel .s-card:hover {
      border-color: rgba(61,81,99,0.5);
      background: rgba(61,81,99,0.08);
    }
    #stratechna-login-panel .s-card-icon {
      width: 40px; height: 40px; min-width: 40px;
      border-radius: 11px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
      background: rgba(61,81,99,0.18);
      border: 1px solid rgba(61,81,99,0.28);
    }
    #stratechna-login-panel .s-card-body { flex: 1; }
    #stratechna-login-panel .s-card-title {
      font-size: 13.5px; font-weight: 600;
      color: #D0D0D0; margin-bottom: 4px;
    }
    #stratechna-login-panel .s-card-desc {
      font-size: 11.5px; color: rgba(224,224,224,0.38);
      line-height: 1.55;
    }
    #stratechna-login-panel .s-card-badge {
      font-size: 10px; font-weight: 600;
      padding: 3px 9px; border-radius: 100px;
      align-self: flex-start; margin-top: 1px;
      letter-spacing: 0.04em; white-space: nowrap;
    }
    /* Badge "Activo": vermelho muito suave */
    #stratechna-login-panel .s-card-badge.red {
      background: rgba(136,0,0,0.15);
      color: #B84444;
      border: 1px solid rgba(136,0,0,0.22);
    }
    /* Badge "Portal" e "GA4": cinzento azulado */
    #stratechna-login-panel .s-card-badge.blue {
      background: rgba(61,81,99,0.2);
      color: #6A8BA3;
      border: 1px solid rgba(61,81,99,0.3);
    }
    /* Separador */
    #stratechna-login-panel .s-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(61,81,99,0.2), transparent);
    }
    /* Rodapé */
    #stratechna-login-panel .s-footer {
      display: flex; align-items: center; gap: 11px;
    }
    #stratechna-login-panel .s-footer-logo {
      width: 30px; height: 30px;
      background: rgba(61,81,99,0.18);
      border: 1px solid rgba(61,81,99,0.28);
      border-radius: 9px;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
    }
    #stratechna-login-panel .s-footer-text {
      font-size: 11px; color: rgba(224,224,224,0.25);
      line-height: 1.5;
    }
    #stratechna-login-panel .s-footer-text strong {
      color: rgba(224,224,224,0.5);
      font-weight: 600;
    }
  `;

  var loginPanelHTML = `
    <div id="stratechna-login-panel">
      <div class="s-bg-grid"></div>
      <div class="s-glow"></div>
      <div class="s-glow2"></div>
      <div class="s-inner">
        <div class="s-headline">
          <div class="s-tag">
            <div class="s-tag-dot"></div>
            Plataforma Interna
          </div>
          <div class="s-title">
            Gestão centralizada<br>da sua <em>presença digital</em>
          </div>
          <div class="s-subtitle">
            Aceda a todas as ferramentas Stratechna num único lugar — publicação, secretariado e análise.
          </div>
        </div>

        <div class="s-cards">
          <div class="s-card">
            <div class="s-card-icon">🌐</div>
            <div class="s-card-body">
              <div class="s-card-title">Webgate — Redes Sociais</div>
              <div class="s-card-desc">Agendamento e publicação multiplataforma para Facebook, Instagram, LinkedIn e mais.</div>
            </div>
            <div class="s-card-badge red">Activo</div>
          </div>
          <div class="s-card">
            <div class="s-card-icon">📋</div>
            <div class="s-card-body">
              <div class="s-card-title">MBontime — Secretariado</div>
              <div class="s-card-desc">Registo de horas, gestão de tarefas e assistência pessoal e empresarial.</div>
            </div>
            <div class="s-card-badge blue">Portal</div>
          </div>
          <div class="s-card">
            <div class="s-card-icon">📊</div>
            <div class="s-card-body">
              <div class="s-card-title">Analytics & Relatórios</div>
              <div class="s-card-desc">Google Analytics 4, Search Console e PageSpeed integrados no painel de controlo.</div>
            </div>
            <div class="s-card-badge blue">GA4</div>
          </div>
        </div>

        <div class="s-divider"></div>

        <div class="s-footer">
          <div class="s-footer-logo">⚡</div>
          <div class="s-footer-text">
            <strong>Stratechna</strong> — Tecnologia e Serviços Empresariais<br>
            Powered by Webgate · stratechna.pt
          </div>
        </div>
      </div>
    </div>
  `;

  function injectLoginPanel() {
    if (document.getElementById('stratechna-login-panel')) return;
    if (!document.getElementById('s-login-panel-css')) {
      var style = document.createElement('style');
      style.id = 's-login-panel-css';
      style.textContent = loginPanelCSS;
      document.head.appendChild(style);
    }
    var rightPanel = document.querySelector('[class*="text-[36px]"]');
    if (rightPanel && rightPanel.parentNode) {
      var newPanel = document.createElement('div');
      newPanel.innerHTML = loginPanelHTML;
      rightPanel.parentNode.insertBefore(newPanel.firstElementChild, rightPanel);
      rightPanel.style.display = 'none';
    }
  }

  function applyBranding() {
    // LOGOS
    document.querySelectorAll('svg').forEach(function(svg) {
      var vb = svg.getAttribute('viewBox') || '';
      var w  = svg.getAttribute('width')   || '';
      if ((w === '101' || vb.indexOf('101') !== -1) && !svg.dataset.sr) {
        svg.style.display = 'none';
        var img = document.createElement('img');
        img.src = '/stratechna-logo.png';
        img.style.cssText = 'height:94px;object-fit:contain;margin-bottom:8px;display:block;';
        img.alt = 'Stratechna'; svg.dataset.sr = '1';
        svg.parentNode && svg.parentNode.insertBefore(img, svg);
      }
      if ((w === '60' || vb.indexOf('0 0 60 60') !== -1) && !svg.dataset.sr) {
        svg.style.display = 'none';
        var icon = document.createElement('img');
        icon.src = '/stratechna-icon.png';
        icon.style.cssText = 'width:85px;height:85px;object-fit:contain;display:block;';
        icon.alt = 'Stratechna Social'; svg.dataset.sr = '1';
        svg.parentNode && svg.parentNode.insertBefore(icon, svg);
      }
    });

    // PAINEL LOGIN
    injectLoginPanel();

    // SUBSTITUIR "Postiz"
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.includes('Postiz'))
        node.nodeValue = node.nodeValue.replace(/Postiz/g, 'Stratechna Social');
    }
    if (document.title && document.title.includes('Postiz'))
      document.title = document.title.replace(/Postiz/g, 'Stratechna Social');

    // CORES ROXAS → PALETA
    var purpleRgbs = [
      'rgb(97, 43, 211)','rgb(108, 71, 255)','rgb(118, 64, 224)',
      'rgb(80, 35, 184)','rgb(123, 63, 242)','rgb(98, 47, 246)',
      'rgb(129, 85, 221)','rgb(99, 102, 241)','rgb(139, 92, 246)',
      'rgb(252, 105, 255)'
    ];
    document.querySelectorAll('*').forEach(function(el) {
      var bg = getComputedStyle(el).backgroundColor;
      var col = getComputedStyle(el).color;
      if (purpleRgbs.indexOf(bg) !== -1) el.style.setProperty('background-color','#880000','important');
      if (purpleRgbs.indexOf(col) !== -1) el.style.setProperty('color','#CC0000','important');
    });

    // DATA ACTUAL
    var today = new Date();
    var todayStr = String(today.getMonth()+1).padStart(2,'0')+'/'+String(today.getDate()).padStart(2,'0')+'/'+today.getFullYear();
    document.querySelectorAll('*').forEach(function(el) {
      if (el.children.length===0 && el.textContent && el.textContent.trim()===todayStr) {
        el.style.setProperty('color','#CC0000','important');
        if (el.parentElement) el.parentElement.style.setProperty('color','#CC0000','important');
      }
    });


    // Traduzir strings inglesas hardcoded (pagina de registo/login)
    var enPt = {
      'Registration is disabled': 'Registo desactivado',
      'Login instead': 'Iniciar sessão',
      'Sign Up': 'Registar',
      'Continue With': 'Continuar com',
      "Don't Have An Account?": 'Não tem uma conta?',
      'Already have an account?': 'Já tem uma conta?'
    };
    var walker2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var nd;
    while ((nd = walker2.nextNode())) {
      var v = nd.nodeValue ? nd.nodeValue.trim() : '';
      if (enPt[v]) nd.nodeValue = nd.nodeValue.replace(v, enPt[v]);
    }

    // BORDA SIDEBAR ACTIVA
    document.querySelectorAll('a, button').forEach(function(el) {
      var bl = getComputedStyle(el).borderLeftColor;
      if (bl==='rgb(204, 0, 0)'||bl==='rgb(136, 0, 0)') {
        el.style.setProperty('border-left-color','#3D5163','important');
        el.style.setProperty('border-color','#3D5163','important');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { applyBranding(); setTimeout(applyBranding, 500); });
  } else {
    applyBranding(); setTimeout(applyBranding, 300); setTimeout(applyBranding, 800);
  }
  var obs = new MutationObserver(function() { applyBranding(); });
  function startObs() { obs.observe(document.body, { childList: true, subtree: true }); }
  document.body ? startObs() : document.addEventListener('DOMContentLoaded', startObs);
})();
