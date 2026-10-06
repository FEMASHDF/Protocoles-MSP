/* FEMAS HDF — réception authentifiée CPOM OS. Aucun secret dans ce fichier. */
(() => {
  const CONFIG = {
    clientId: 'b24e998c-fe80-4b16-9d9a-b4f140cd9051',
    tenant: '2fd5f607-3a7c-4f83-bcf4-f93150a483d3',
    redirectUri: 'https://femashdf.github.io/Protocoles-MSP/',
    endpoint: 'https://default2fd5f6073a7c4f83bcf4f93150a483.d3.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/12/workflows/55be9bd4bfba42cc90107fe18bada306/triggers/manual/paths/invoke?api-version=1',
    scopes: ['https://service.flow.microsoft.com/Flows.Install']
  };
  const connect = document.getElementById('microsoftConnect');
  const send = document.getElementById('sharepointSend');
  const consent = document.getElementById('collectionConsent');
  const status = document.getElementById('collectionStatus');
  const accountLabel = document.getElementById('microsoftAccount');
  const key = 'femas-sharepoint-receipt-v1';
  let auth, account, busy = false;
  function update() {
    send.disabled = busy || !account || !consent.checked;
    connect.disabled = busy;
    accountLabel.textContent = account ? `Connecté : ${account.username}` : 'Connexion requise pour envoyer';
    connect.textContent = account ? 'Changer de compte Microsoft' : 'Se connecter avec Microsoft';
  }
  function notice(text) { status.textContent = text; }
  function safeRead() { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
  function remember(value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* réception visible même sans stockage local */ } }
  function receipt(value) {
    notice(`Protocole reçu par la FEMAS HDF.\nRéférence : ${value.id}\nUne ligne « Reçu » a été ajoutée au suivi CPOM OS.`);
    const link = document.createElement('a');
    link.textContent = 'Ouvrir le document déposé';
    link.href = value.documentUrl;
    link.target = '_blank'; link.rel = 'noopener';
    status.append(document.createElement('br'), link);
  }
  async function initialize() {
    if (!window.msal) throw new Error('La connexion Microsoft n’a pas pu être chargée. Rechargez la page.');
    auth = new msal.PublicClientApplication({
      auth: {clientId: CONFIG.clientId, authority: `https://login.microsoftonline.com/${CONFIG.tenant}`, redirectUri: CONFIG.redirectUri},
      cache: {cacheLocation: 'sessionStorage'}
    });
    await auth.initialize();
    const result = await auth.handleRedirectPromise({navigateToLoginRequestUrl: false});
    account = result?.account || auth.getActiveAccount() || auth.getAllAccounts()[0];
    if (account) auth.setActiveAccount(account);
    if (result) { go(2); notice('Connexion Microsoft réussie. Relisez le protocole puis confirmez son envoi.'); }
    update();
  }
  const ready = initialize().catch(error => { notice(error.message || 'Connexion Microsoft indisponible.'); update(); });
  consent.addEventListener('change', update);
  connect.addEventListener('click', async () => {
    await ready;
    if (!auth) return;
    busy = true; update();
    try {
      if (location.origin !== new URL(CONFIG.redirectUri).origin) throw new Error('La connexion Microsoft est disponible sur le formulaire publié.');
      persist();
      await auth.loginRedirect({scopes: CONFIG.scopes, prompt: 'select_account'});
    } catch (error) { notice(error.message || 'Connexion interrompue.'); busy = false; update(); }
  });
  send.addEventListener('click', async () => {
    await ready;
    if (!account || !consent.checked || busy) return;
    const fields = state.fields;
    if (!fields.title?.trim() || !fields.msp?.trim()) { notice('Renseignez le titre du protocole et le nom de la MSP avant l’envoi.'); return; }
    for (const name of ['title','msp','owner','theme','version']) {
      if ((fields[name] || '').length > 255) { notice('Le titre, la MSP, le référent, la thématique et la version doivent comporter au maximum 255 caractères chacun.'); return; }
    }
    const draftJson = JSON.stringify({schema:1,...state});
    const documentHtml = protocolWordHtml();
    if (draftJson.length > 1500000 || documentHtml.length > 1500000) { notice('Ce protocole dépasse la taille autorisée. Réduisez son contenu avant de l’envoyer.'); return; }
    const previous = safeRead();
    if (previous?.draftJson === draftJson && previous?.ok) { receipt(previous); return; }
    if (previous?.draftJson === draftJson && previous?.pending) {
      notice(`Une tentative d’envoi existe déjà (référence ${previous.id}). Vérifiez le suivi FEMAS avant de recommencer : la réception n’a pas été confirmée dans ce navigateur.`);
      return;
    }
    busy = true; update(); notice('Vérification de la connexion Microsoft…');
    try {
      let token;
      try { token = await auth.acquireTokenSilent({scopes:CONFIG.scopes,account}); }
      catch (error) {
        if (error instanceof msal.InteractionRequiredAuthError) {
          persist(); await auth.acquireTokenRedirect({scopes:CONFIG.scopes,account}); return;
        }
        throw error;
      }
      const id = crypto.randomUUID();
      const payload = {id,title:fields.title.trim(),msp:fields.msp.trim(),owner:fields.owner||'',theme:fields.theme||'',version:fields.version||'',review:fields.review||'',documentHtml,draftJson};
      remember({id,draftJson,pending:true});
      notice('Envoi en cours : dépôt du document et ajout au suivi FEMAS…');
      const response = await fetch(CONFIG.endpoint,{method:'POST',headers:{'Authorization':`Bearer ${token.accessToken}`,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(90000)});
      if (!response.ok) {
        let detail; try { detail = await response.json(); } catch {}
        const reason = typeof detail?.error?.code === 'string' ? detail.error.code.replace(/[^a-zA-Z0-9_-]/g,'').slice(0,100) : '';
        if ([401,403].includes(response.status)) remember({id,draftJson,pending:false});
        throw new Error(`Le service FEMAS a répondu avec une erreur (${response.status}${reason ? ' · '+reason : ''}).`);
      }
      const value = await response.json();
      const expected = `https://femashdf.sharepoint.com/sites/CPOMOS/Documents%20partages/Protocoles%20pluripro/Protocole-${id}.doc`;
      if (value.ok !== true || value.id !== id || !value.itemId || value.documentUrl !== expected) throw new Error('Le service n’a pas confirmé le dépôt complet.');
      const completed = {...value,draftJson,pending:false}; remember(completed); receipt(completed); consent.checked=false;
    } catch (error) {
      notice(`${error.message || 'L’envoi a été interrompu.'}\nRéception non confirmée. Vérifiez le suivi FEMAS avant un nouvel envoi. Votre brouillon reste disponible dans ce navigateur.`);
    } finally { busy=false; update(); }
  });
})();
